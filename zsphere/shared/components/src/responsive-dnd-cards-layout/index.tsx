import { gql, useQuery, useMutation } from "@apollo/client";
import { ProfileType } from "@zstack/zsphere-types";
import { genUuid } from "@zstack/zsphere-utils";
import { useUnmount, useUpdateEffect } from "ahooks";
import { Spin } from "antd";
import { produce } from "immer";
import { flatten, map, isEqual, sortBy, find, remove } from "lodash-es";
import React, {
  FC,
  useState,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useIntl } from "react-intl";

import DragContainer, { DndContext } from "./drag-container";
import { DragLayer } from "./drag-layer";
import DropContainer from "./drop-container";

import style from "./style.module.less";

// 定义接口和类型
export interface ILayoutItem {
  resourceKey: string;
  x: number;
  y: number;
  node: (props: any) => ReactNode;
}

export interface IResponsiveDndCardsLayout {
  profileType: ProfileType;
  resourceType: string;
  cols: number;
  dataSet: { [key: string]: ILayoutItem };
  loading?: boolean;
  isDraggable?: boolean;
  isAdaptive?: boolean;
}

interface ILayoutMatrixItem {
  resourceKey: string;
  x: number;
  y: number;
  collapsed: boolean;
}

// GraphQL 查询和变更
const UPDATE_PERSONALIZATION_CONFIG = gql`
  mutation updatePersonalizationConfig(
    $input: UpdatePersonalizationConfigInput!
  ) {
    updatePersonalizationConfig(input: $input) {
      actionId
    }
  }
`;

const QUERY_PERSONALIZATION_CONFIG = gql`
  query queryPersonalizationConfig(
    $profileType: ProfileType!
    $resourceType: String!
  ) {
    queryPersonalizationConfig(
      profileType: $profileType
      resourceType: $resourceType
    ) {
      userId
      profileType
      resourceType
      value
    }
  }
`;

// 主组件
const ResponsiveDndCardsLayout: FC<IResponsiveDndCardsLayout> = ({
  cols = 2,
  dataSet = {},
  profileType,
  resourceType,
  loading,
  isDraggable = true,
  isAdaptive = false,
}) => {
  const intl = useIntl() as any;
  const [layoutChanged, setLayoutChanged] = useState<boolean>(false);
  const [layoutMatrix, setLayoutMatrix] = useState<ILayoutMatrixItem[][]>(
    new Array(cols).fill([]),
  );

  // 查询和变更 hooks
  const { loading: configLoading, data: remoteData } = useQuery(
    QUERY_PERSONALIZATION_CONFIG,
    {
      variables: { profileType, resourceType },
      fetchPolicy: "no-cache",
    },
  );

  const [updatePersonalizationConfig] = useMutation(
    UPDATE_PERSONALIZATION_CONFIG,
  );

  // 卸载时保存布局
  useUnmount(() => {
    if (layoutChanged) saveData(layoutMatrix);
  });

  // 本地布局矩阵值
  const localLayoutMatrixValue = useMemo(() => {
    const localLayoutMatrix: ILayoutMatrixItem[][] = Array(cols)
      .fill([])
      .map(() => []);
    Object.entries(dataSet).forEach(([resourceKey, data]) => {
      localLayoutMatrix[data.x].push({
        resourceKey,
        x: data.x,
        y: data.y,
        collapsed: false,
      });
    });
    return JSON.stringify(localLayoutMatrix);
  }, [cols, dataSet]);

  // 布局变化效果
  useUpdateEffect(() => {
    setLayoutChanged(true);
  }, [localLayoutMatrixValue]);

  // 初始化布局
  useEffect(() => {
    if (configLoading || loading) return;
    const localLayoutMatrix = JSON.parse(
      localLayoutMatrixValue,
    ) as ILayoutMatrixItem[][];
    const remoteLayoutMatrix =
      JSON.parse(remoteData?.queryPersonalizationConfig?.value || "[]") ?? [];

    const flatLocalLayoutMatrix = flatten(localLayoutMatrix);
    const localKeys = map(flatLocalLayoutMatrix, "resourceKey").sort();
    const flatRemoteLayoutMatrix = flatten(remoteLayoutMatrix);
    const remoteKeys = map(flatRemoteLayoutMatrix, "resourceKey").sort();

    const realLayoutMatrix = isEqual(localKeys, remoteKeys)
      ? remoteLayoutMatrix
      : localLayoutMatrix;
    realLayoutMatrix.forEach((arr: any) => sortBy(arr, "y"));
    setLayoutMatrix(realLayoutMatrix);
  }, [configLoading, loading, remoteData, localLayoutMatrixValue]);

  // 处理折叠状态变化
  const handleCollapseChange = useCallback(
    (resourceKey: string, state: boolean) => {
      setLayoutChanged(true);
      setLayoutMatrix((prevMatrix) =>
        produce(prevMatrix, (draft) => {
          draft.forEach((column) => {
            const item = column.find(
              (item_) => item_.resourceKey === resourceKey,
            );
            if (item) item.collapsed = state;
          });
        }),
      );
    },
    [],
  );

  // 处理移动
  const handleMove = useCallback(
    (
      dragResourceKey: string,
      hoverResourceKey: string,
      curColIndex: number,
    ) => {
      if (dragResourceKey === hoverResourceKey) return;

      setLayoutMatrix((prevMatrix) =>
        produce(prevMatrix, (draft) => {
          const dragItem = find(flatten(draft), {
            resourceKey: dragResourceKey,
          });
          if (!dragItem) return;

          const currentDragIndex = draft[curColIndex].findIndex(
            (item) => item.resourceKey === dragResourceKey,
          );
          const currentHoverIndex = draft[curColIndex].findIndex(
            (item) => item.resourceKey === hoverResourceKey,
          );

          if (currentDragIndex > -1 && currentHoverIndex > -1) {
            const [removed] = draft[curColIndex].splice(currentDragIndex, 1);
            if (currentHoverIndex < currentDragIndex) {
              draft[curColIndex].splice(currentHoverIndex, 0, removed);
            } else {
              draft[curColIndex].splice(currentHoverIndex - 1, 0, removed);
            }
          } else {
            draft.forEach((column, index) => {
              if (index !== curColIndex) {
                draft[index] = column.filter(
                  (item) => item.resourceKey !== dragResourceKey,
                );
              }
            });
            draft[curColIndex].splice(
              currentHoverIndex,
              0,
              dragItem as ILayoutMatrixItem,
            );
          }

          draft.forEach((column, x) => {
            column.forEach((item, y) => {
              item.x = x;
              item.y = y;
            });
          });
        }),
      );
    },
    [],
  );

  // 处理空容器移动
  const handleEmptyContainerMove = useCallback(
    (dragResourceKey: string, curColIndex: number) => {
      setLayoutMatrix((prevMatrix) =>
        produce(prevMatrix, (draft) => {
          let dragItem: ILayoutMatrixItem | undefined;
          draft.forEach((column) => {
            const [currItem] = remove(
              column,
              (item: any) => item.resourceKey === dragResourceKey,
            );
            if (currItem) {
              dragItem = currItem;
            }
          });

          if (!dragItem) return;

          draft[curColIndex].push(dragItem);

          draft.forEach((column, x) => {
            column.forEach((item, y) => {
              item.x = x;
              item.y = y;
            });
          });
        }),
      );
      setLayoutChanged(true);
    },
    [],
  );

  // 保存数据
  const saveData = useCallback(
    (data: ILayoutMatrixItem[][]) => {
      updatePersonalizationConfig({
        variables: {
          input: {
            payload: {
              profileType: ProfileType.OverviewLayoutConfig,
              resourceType,
              value: JSON.stringify(data),
            },
            action: {
              actionId: genUuid(),
              name: intl.formatMessage({
                id: "save.overview.layout",
                defaultMessage: "Save Overview Layout",
              }),
              total: 1,
            },
          },
        },
      });
    },
    [updatePersonalizationConfig, resourceType, intl],
  );

  // 渲染列
  const renderCols = () => {
    return Array(cols)
      .fill("")
      .map((_v, i) => (
        <div key={i}>
          <div className={style.colContainer}>
            {layoutMatrix[i]?.map((subItem, j) => (
              <DragContainer
                key={subItem.resourceKey}
                resourceKey={subItem.resourceKey}
                onDrop={({ position, sourceResourceKey }) => {
                  let targetResourceKey: string;
                  if (position === "top") {
                    targetResourceKey = subItem.resourceKey;
                  } else if (j === layoutMatrix[i].length - 1) {
                    targetResourceKey = "";
                  } else {
                    targetResourceKey = layoutMatrix[i][j + 1].resourceKey;
                  }
                  if (targetResourceKey) {
                    handleMove(sourceResourceKey, targetResourceKey, i);
                  } else {
                    handleEmptyContainerMove(sourceResourceKey, i);
                  }
                }}
                isDraggable={isDraggable}
              >
                {dataSet[subItem.resourceKey]?.node({
                  key: subItem.resourceKey,
                  collapsed: subItem.collapsed,
                  onCollapseChange: (state: boolean) =>
                    handleCollapseChange(subItem.resourceKey, state),
                })}
              </DragContainer>
            ))}
            <DropContainer
              onDrop={(resourceKey: string) => {
                handleEmptyContainerMove(resourceKey, i);
              }}
            />
          </div>
        </div>
      ));
  };

  if (configLoading) {
    return <Spin />;
  }

  return (
    <div className={isAdaptive ? style.singleColumnContainer : style.container}>
      <DndProvider backend={HTML5Backend}>
        <DndContext.Provider
          value={{ dndType: `CARD-${profileType}-${resourceType}` }}
        >
          {renderCols()}
          <DragLayer />
        </DndContext.Provider>
      </DndProvider>
    </div>
  );
};

export default ResponsiveDndCardsLayout;
