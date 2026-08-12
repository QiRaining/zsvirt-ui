import { gql, useLazyQuery } from "@apollo/client";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Icon } from "@zstack/icon";
import { useAction } from "@zstack/zsphere-hooks";
import { Item } from "@zstack/zsphere-types";
import { Button, Checkbox, Col, Drawer, Row, Tooltip } from "antd";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { difference, find, isString, map as _map, uniq } from "lodash-es";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../../_utils/common";
import { findAuthByKey } from "../../../action/utils";
import { useAuth } from "../../../auth";
import {
  actionKey,
  IColumnMap,
  IColumnType,
  ICustomColumnProps,
  IKey,
} from "../../base-type";
import { formatAuthParams } from "../../hooks";
import { formatElement } from "../export-to-excel";
import { SortableItem } from "./_sortable-item";

import "./style.less";

const updateCustomColumns = gql`
  mutation updateCustomColumns($input: UpdateCustomColumnsInput!) {
    updateCustomColumns(input: $input) {
      actionId
    }
  }
`;

const queryCustomColumnConfig = gql`
  query queryCustomColumnConfig {
    queryCustomColumnConfig {
      userId
      customColumnConfig
    }
  }
`;

type IProps<T extends Item> = ICustomColumnProps<T>;

const baseCls = getBaseCls("custom-column");

function CustomColumns<T extends Item>(props: IProps<T>) {
  const intl = useIntl();

  const {
    columnConfig,
    resourceAttributeColumnList,
    view,
    customView: _customView,
    columnKeys,
    resource,
    viewMap: actionViewMap,
    menuList,
    setCustomRefresh,
    disabledKeyList: _disabledKeyList = ["name", actionKey],
    queryCustomColumnGql = queryCustomColumnConfig,
    updateCustomColumnsGql = updateCustomColumns,
    gqlValueMapper,
  } = props;

  const { hasAuth } = useAuth();
  const customColumnPath = `${resource}.${_customView ?? view}`;
  const doAction = useAction();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedKeyList, setSelectedKeyList] = useState<CheckboxValueType[]>(
    [],
  );
  const [selectedList, setSelectedList] = useState<Item[]>([]);
  // 缓存本地存储的列配置，避免重复读取和解析
  const [cachedColumnConfig, setCachedColumnConfig] = useState<IColumnMap>({});

  const { list: staticColList, viewMap } = columnConfig;
  const list = useMemo(() => {
    return staticColList.concat(resourceAttributeColumnList || []);
  }, [staticColList, resourceAttributeColumnList]);

  const disabledKeyList = useMemo(
    () => uniq([..._disabledKeyList, actionKey]),
    [_disabledKeyList],
  );

  const customView = useMemo(
    () => _customView ?? `${view}.custom`,
    [view, _customView],
  );

  const canAttachActionColumn = useMemo(() => {
    const { activeKeys = [], extraKeys = [] } =
      actionViewMap?.[`${view}/row`] ?? {};

    const has = [...activeKeys, ...extraKeys].some((key) =>
      hasAuth(findAuthByKey(key, menuList) ?? { type: "action", authKey: key }),
    );

    if (!has) {
      return false;
    }

    if (view.startsWith("select")) {
      return false;
    }

    return !!(activeKeys?.length || extraKeys?.length);
  }, [hasAuth, view, actionViewMap, menuList]);

  const getCollectionMap = useCallback(
    (needCollectionList: Item[]) => {
      let groupNum = 0;
      let isDisabledKey = true;

      return needCollectionList.reduce(
        (pre, { key }) => {
          if (
            (isDisabledKey && !disabledKeyList.includes(key)) ||
            (!isDisabledKey && disabledKeyList.includes(key))
          ) {
            groupNum += 1;
            isDisabledKey = !isDisabledKey;
          }
          pre[key] = groupNum;
          return pre;
        },
        {} as { [key: string]: number },
      );
    },
    [disabledKeyList],
  );

  const getCollection = (columns: Item[]) => {
    const columnCollection = getCollectionMap(
      list.filter((item) => selectedKeyList.includes(item.key)),
    );
    const collectedList = columns.reduce((pre, column) => {
      const columnGroupNum = columnCollection[column.key];
      if (!Array.isArray(pre[columnGroupNum])) {
        pre[columnGroupNum] = [];
      }
      pre[columnGroupNum].push(column);
      return pre;
    }, [] as Item[][]);
    return { collectedList, columnCollection };
  };

  useEffect(() => {
    // 这里是为了解决切换语言之后，selectedList还是原来数组里的内容，导致无法改变语言类型的问题
    //
    if (intl && visible) {
      const newSelectedList = selectedList.map((item) => {
        const findColumnItem = find(list, { key: item.key });
        return { ...item, title: findColumnItem?.title || item.title };
      });
      setSelectedList(newSelectedList);
    }
  }, [intl, visible]);

  useEffect(() => {
    let newSelectedList = [...selectedList];
    if (selectedList.length < selectedKeyList.length) {
      // 按分组尾部增加
      const differArr = difference(
        selectedKeyList,
        selectedList.map((e) => e.key),
      );
      let newList = newSelectedList;
      differArr.forEach((e) => {
        const objFind = find(list, { key: e });
        if (objFind) {
          const { collectedList, columnCollection } = getCollection(newList);
          const objFindGroupNum = columnCollection[objFind.key];
          if (!Array.isArray(collectedList[objFindGroupNum])) {
            collectedList[objFindGroupNum] = [];
          }
          collectedList[objFindGroupNum].push(objFind);
          newList = collectedList.flat().filter(Boolean);
        }
      });
      newSelectedList = newList.sort((lhs, rhs) => {
        return (
          selectedKeyList.indexOf(lhs.key) - selectedKeyList.indexOf(rhs.key)
        );
      });
    } else if (selectedList.length > selectedKeyList.length) {
      // 删除
      const differArr = difference(
        selectedList.map((e) => e.key),
        selectedKeyList,
      );
      newSelectedList = newSelectedList.filter(
        (item) => !differArr.includes(item.key),
      );
    }
    setSelectedList(newSelectedList);
  }, [selectedKeyList]);

  const [getCustomColumnConfig] = useLazyQuery(queryCustomColumnConfig, {
    onCompleted(_data) {
      let content = gqlValueMapper
        ? gqlValueMapper?.(_data, queryCustomColumnGql)
        : _data?.queryCustomColumnConfig?.customColumnConfig || "{}";

      localStorage.setItem("customColumnConfig", content);
      setVisible(false);
      if (setCustomRefresh) setCustomRefresh(Math.random());
    },
    fetchPolicy: "no-cache",
  });

  // 在抽屉打开时才读取本地存储，避免每次 visible 变化都读取
  useEffect(() => {
    if (visible) {
      try {
        const columnConfig = localStorage.getItem("customColumnConfig") || "{}";
        const parsedConfig = isString(columnConfig)
          ? JSON.parse(columnConfig)
          : columnConfig;
        setCachedColumnConfig(parsedConfig);
      } catch (error) {
        console.error("Failed to parse customColumnConfig:", error);
        setCachedColumnConfig({});
      }
    }
  }, [visible]);

  const customColumnConfigData: IColumnMap = cachedColumnConfig;

  const filterColumns = useMemo(() => {
    let keys: IKey<T>[] = viewMap[view] ?? [];

    let customKeys: string[] | undefined;
    if (typeof customColumnConfigData === "string") {
      try {
        customKeys = JSON.parse(customColumnConfigData)[customColumnPath];
      } catch {}
    } else {
      customKeys = customColumnConfigData[customColumnPath];
    }

    if (customKeys) {
      keys = customKeys;
    } else if (columnKeys?.length) {
      keys = columnKeys;
    }

    const columns = keys.reduce<Array<IColumnType<T>>>((prev, curr) => {
      const findColumnItem = list.find((item) => item.key === curr);

      if (!findColumnItem) {
        return prev;
      }

      const authParams = formatAuthParams(findColumnItem);

      if (!authParams) {
        return [...prev, findColumnItem];
      }

      return hasAuth(authParams) ? [...prev, findColumnItem] : prev;
    }, []);

    return columns;
  }, [
    viewMap,
    view,
    customColumnConfigData,
    customColumnPath,
    columnKeys,
    list,
    hasAuth,
  ]);

  useEffect(() => {
    if (visible) {
      setSelectedKeyList(filterColumns.map((e) => e.key));
    }
  }, [filterColumns, visible]);

  // 优先使用新生成的i18nKey来生成名字，同时保留原来的逻辑做兜底
  const genLabel = (e: { i18nKey?: string; title?: any }) => {
    if (e.i18nKey) {
      return intl.formatMessage({ id: e.i18nKey });
    }
    return formatElement(e.title);
  };

  // 格式化数组 - 只在抽屉打开时计算，减少不必要的计算
  const allListWithCheckbox = useMemo(() => {
    if (!visible) return [];

    const keys: IKey<T>[] = (viewMap[customView] ?? []).concat(
      resourceAttributeColumnList?.map((item) => item.key) || [],
    );

    const columns = keys.reduce<Array<IColumnType<T>>>((prev, curr) => {
      const findColumnItem = list.find((item) => item.key === curr);

      if (!findColumnItem) {
        return prev;
      }

      const authParams = formatAuthParams(findColumnItem);

      if (!authParams) {
        return [...prev, findColumnItem];
      }

      return hasAuth(authParams) ? [...prev, findColumnItem] : prev;
    }, []);

    if (canAttachActionColumn) {
      columns.push({
        title: intl.formatMessage({
          id: "action",
          defaultMessage: "Actions",
        }),
        key: actionKey,
      });
    }

    return columns.map((e) => ({
      label: genLabel(e),
      value: e.key,
      disabled: disabledKeyList.includes(e.key),
    }));
  }, [
    visible,
    viewMap,
    customView,
    canAttachActionColumn,
    list,
    hasAuth,
    intl,
    disabledKeyList,
    genLabel,
  ]);

  // 选择变更
  const onChange = (checkedValues: CheckboxValueType[]) => {
    const filteredCheckedValues = checkedValues.filter((e) => e !== actionKey);
    setSelectedKeyList(filteredCheckedValues);
  };

  // 删除选择的 key
  const removeSelectedKey = useCallback((key: string) => {
    setSelectedKeyList((prev) => prev.filter((k) => k !== key));
  }, []);

  // 清空选择列表
  const clearSelectedKey = () => {
    setSelectedKeyList((prev) =>
      prev.filter((k) => disabledKeyList.includes(k)),
    );
  };

  const resetDefaultSelectedKey = () => {
    setSelectedList([]);
    let keys: IKey<any>[] = viewMap[view] ?? [];

    if (columnKeys?.length) {
      keys = columnKeys;
    }

    const newSelectedKeyList: CheckboxValueType[] = keys.reduce<
      CheckboxValueType[]
    >((prev, curr) => {
      const findColumnItem = list.find((item) => item.key === curr);

      if (!findColumnItem) {
        return prev;
      }

      const authParams = formatAuthParams(findColumnItem);

      if (!authParams) {
        return [...prev, `${String(curr)}`];
      }

      return hasAuth(authParams) ? [...prev, `${String(curr)}`] : prev;
    }, []);

    setSelectedKeyList([...newSelectedKeyList]);
  };

  const onOk = () => {
    doAction({
      mutation: updateCustomColumnsGql,
      payload: {
        path: customColumnPath,
        columnKeys: _map(selectedList, "key"),
      },
      name: intl.formatMessage({
        id: "saveCustomColumnItem",
        defaultMessage: "Save Custom Column Items",
      }),
      total: 1,
      onFinish: () => {
        getCustomColumnConfig();
      },
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedList.findIndex((item) => item.key === active.id);
      const newIndex = selectedList.findIndex((item) => item.key === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setSelectedList(arrayMove(selectedList, oldIndex, newIndex));
      }
    }
  };

  return (
    <>
      {viewMap[customView] && (
        <Tooltip
          title={intl.formatMessage({
            id: "customColumnItem",
            defaultMessage: "Custom Column Item",
          })}
        >
          <Button onClick={() => setVisible(true)}>
            <Icon type="settings" />
          </Button>
        </Tooltip>
      )}
      <Drawer
        placement="right"
        closable={false}
        onClose={() => setVisible(false)}
        open={visible}
        width={600}
        className={baseCls}
        destroyOnClose
        mask={true}
        title={intl.formatMessage({
          id: "customColumnItem",
          defaultMessage: "Custom Column Item",
        })}
        footer={
          <div className="footer">
            <div className="left">
              <Button type="primary" onClick={() => onOk()}>
                {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
              </Button>
              <Button type="text" onClick={() => setVisible(false)}>
                {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
              </Button>
            </div>
            <div className="right">
              <Button type="link" onClick={() => resetDefaultSelectedKey()}>
                {intl.formatMessage({
                  id: "reset",
                  defaultMessage: "Reset",
                })}
              </Button>
            </div>
          </div>
        }
      >
        <Row gutter={20} className="row">
          <Col span={11} className="col">
            <div className="left-container">
              <div className="title">
                <span>
                  {intl.formatMessage({
                    id: "selected",
                    defaultMessage: "Selected",
                  })}
                  (
                  {canAttachActionColumn
                    ? selectedKeyList.length + 1
                    : selectedKeyList.length}
                  )
                </span>
                <Icon
                  type="trash"
                  style={{ color: "var(--neutral-400)" }}
                  onClick={() => clearSelectedKey()}
                />
              </div>
              <div className="content">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedList.map((item) => item.key)}
                    strategy={verticalListSortingStrategy}
                  >
                    {selectedList.map((item) => (
                      <SortableItem
                        key={item.key}
                        id={item.key}
                        label={formatElement(item.title)}
                        disabled={disabledKeyList.includes(item.key)}
                        onRemove={removeSelectedKey}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {canAttachActionColumn && (
                  <div className="sortable-item">
                    <div className="sortable-item-left-not-allowed">
                      <Icon type="drag" />
                      {intl.formatMessage({
                        id: "action",
                        defaultMessage: "Actions",
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Col>
          <Col span={13} className="col">
            <div className="right-container">
              <div className="title">
                {intl.formatMessage({
                  id: "allColumns",
                  defaultMessage: "All Columns",
                })}
                (
                {canAttachActionColumn
                  ? selectedKeyList.length + 1
                  : selectedKeyList.length}
                /{allListWithCheckbox.length})
              </div>
              <div className="content">
                <div className="list">
                  {visible && (
                    <Checkbox.Group
                      options={allListWithCheckbox}
                      value={
                        canAttachActionColumn
                          ? [...selectedKeyList, actionKey]
                          : selectedKeyList
                      }
                      onChange={onChange}
                    />
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Drawer>
    </>
  );
}

export default React.memo(CustomColumns);
