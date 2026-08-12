import { Alert, Button, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  Empty,
  Spin,
  Action,
  Select,
  useAuth,
} from "@zstack/zsphere-components";
import { useSubscribeOrgTreeChange } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op, VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  SnapshotGroupByVolume,
} from "@zstack/zsphere-types/graphql";
import { useControllableValue, useDebounceFn, useToggle } from "ahooks";
import { Input } from "antd";
import type { ChangeEvent, FC } from "react";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import CreateSnapShot from "../action/create";
import DirectoryTree from "../components/tree/tree";
import { useActionConfig } from "../config";
import { useGetData, SnapshotContext } from "../hooks";
import type { DisplayLocationType, ISortBy } from "../types";
import { extractKeys, mergeTrees } from "../utils";

import style from "./style.module.less";

interface IProps {
  onChange?: (item?: SnapshotGroupByVolume) => void;
  displayLocation?: DisplayLocationType;
  source?: IVM;
  isWarning?: boolean;
}

const SideList: FC<IProps> = ({
  onChange,
  displayLocation,
  source,
  isWarning = false,
}) => {
  const intl = useIntl();
  const { store } = useContext(SnapshotContext);
  const { list, viewMap } = useActionConfig();
  const { hasAuth } = useAuth();
  const canCreateSnapshot = hasAuth({
    authKey: "create.snapshot",
    resource: "snapshot",
    type: "action",
  });
  const [loading, setLoading] = useState(true);
  const [, setSelectedItem] = useControllableValue<
    SnapshotGroupByVolume | undefined
  >({
    onChange,
  });
  const [createSnapShotVisable, setCreateSnapShotVisable] =
    useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortBy, { toggle: toggleSortBy }] = useToggle<ISortBy, ISortBy>(
    "count",
    "size",
  );
  const [vmData, setVmData] = useState([]);
  const [snapshotData, setSnapshotData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(["-1"]);
  const [defaultExpandedKeys, setDefaultExpandedKeys] = useState<string[]>([]);
  const [additionalExpandedKeys, setAdditionalExpandedKeys] = useState<
    string[]
  >([]);
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);

  const { getSnapshotTree, getVmList, snapShotTreeLoading } = useGetData(
    setVmData,
    setSnapshotData,
    setLoading,
    displayLocation,
  );

  const variables: IQuery = useMemo(
    () => ({
      sortBy,
      conditions: [
        {
          key: "__search__",
          value: searchValue,
        },
      ],
    }),
    [sortBy, searchValue],
  );

  useEffect(() => {
    if (displayLocation === "list") {
      getVmList({
        variables,
      });
      getSnapshotTree();
    } else {
      //根盘变更 todo
      getSnapshotTree({
        variables: {
          conditions: [
            {
              key: "volumeUuid",
              op: Op.eq,
              value: source?.rootVolumeUuid,
            },
          ],
        },
      });
    }
  }, [source?.rootVolumeUuid, variables]);

  useEffect(() => {
    const _treeData =
      displayLocation === "detail"
        ? snapshotData
        : mergeTrees(vmData, snapshotData);
    if (_treeData) {
      const currentlyExpandedKeys = [...additionalExpandedKeys];

      setTreeData(_treeData as any);

      const newSelectedKey = selectedNodeKey || _treeData[0]?.key;

      setSelectedKeys([newSelectedKey]);

      if (newSelectedKey === _treeData[0]?.key) {
        setSelectedItem(_treeData[0]);
      }

      setDefaultExpandedKeys(extractKeys([_treeData[0]]));
      setAdditionalExpandedKeys(currentlyExpandedKeys);
    }

    if (!snapShotTreeLoading) {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  }, [displayLocation, snapshotData, vmData, snapShotTreeLoading]);

  //点击snapshot列表名称，联动选中tree
  useEffect(() => {
    if (store?.snapshotUuid) {
      setSelectedKeys([store?.snapshotUuid]);
    }
  }, [store]);

  const reset = () => {
    setTreeData([]);
    setSelectedKeys([]);
    setSelectedNodeKey("");
    // setSelectedItem(undefined)
  };

  //排序
  const handleChangeSoryBy = (value: ISortBy) => {
    reset();
    toggleSortBy(value);
  };

  const { run } = useDebounceFn(
    (inputVal) => {
      reset();
      if (inputVal) {
        getVmList({
          variables: {
            conditions: [
              {
                key: "__search__",
                value: inputVal,
              },
            ],
          },
        });
      } else {
        getVmList({
          variables,
        });
      }
    },
    { wait: 800 },
  );

  //搜索
  const handleChangeSearchValue = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchValue(inputValue);

    if (displayLocation === "list") {
      run(inputValue);
    }
  };

  const onTreeNodeExpand = (expandedKeys: React.Key[], info: any) => {
    const { expanded } = info;
    if (!expanded) {
      setDefaultExpandedKeys([]);
    }
    setAdditionalExpandedKeys(expandedKeys as any[]);
  };

  //树节点点击事件
  const onTreeNodeSelected = (keys: string[], info: any) => {
    const { resourceType, key } = info.node;
    //点击同一个树节点，return
    if (selectedKeys.includes(key)) {
      return;
    }
    setSelectedNodeKey(key);
    setSelectedKeys([key]);
    setSelectedItem(info?.selectedNodes?.[0] || info?.node);
    //点击vm展开其下子节点
    if (resourceType === "vm") {
      const currentSelectedItem = treeData.filter((it: any) => it.key === key);
      setAdditionalExpandedKeys([
        ...new Set([
          ...additionalExpandedKeys,
          ...extractKeys(currentSelectedItem),
        ]),
      ]);
    }
  };

  //刷新
  const refetchData = () => {
    setLoading(true);
    reset();
    if (displayLocation === "list") {
      getVmList({
        variables,
      });
      getSnapshotTree();
    } else {
      //根盘变更 todo
      getSnapshotTree({
        variables: {
          conditions: [
            {
              key: "volumeUuid",
              op: Op.eq,
              value: source?.rootVolumeUuid,
            },
          ],
        },
      });
    }
  };

  useSubscribeOrgTreeChange({
    resourceTypeList: ["VolumeSnapshot", "VolumeSnapshotGroup", "VmInstance"],
    onFinish: (e: any) => {
      setLoading(true);
      if (
        ["VolumeSnapshot", "VolumeSnapshotGroup", "VmInstance"].includes(e.type)
      ) {
        const inventory = JSON.parse(e?.inventory);

        if (inventory?.actionType === "delete") {
          setSelectedKeys(["-1"]);
          setSelectedNodeKey(null);
        }

        if (displayLocation === "list") {
          getVmList({
            variables,
          });
          getSnapshotTree();
        } else {
          getSnapshotTree({
            variables: {
              conditions: [
                {
                  key: "volumeUuid",
                  op: Op.eq,
                  value: source?.rootVolumeUuid,
                },
              ],
            },
          });
        }
      }
    },
  });

  const alertMessage = useMemo(() => {
    if (isWarning) {
      return intl.formatMessage({
        id: "virtualization.snapshot.detail.alert.warning",
        defaultMessage:
          "Too many snapshots. This will lower VM performance, increase data security risks, and occupy data storage space. For long-term data backup, you can use the backup service.",
      });
    }
    return "";
  }, [intl, isWarning]);

  const renderToolbar = useMemo(() => {
    const searchPlaceholder =
      displayLocation === "detail"
        ? intl.formatMessage({
            id: "virtualization.snapshot.sidelist.search.snapshot.name",
            defaultMessage: "Search Snapshot Name",
          })
        : intl.formatMessage({
            id: "virtualization.snapshot.sidelist.search.vm.name.or.uuid",
            defaultMessage: "Search by VM Name or UUID",
          });

    const commonToolbar = [
      <Input
        key="search"
        value={searchValue}
        onChange={handleChangeSearchValue}
        placeholder={searchPlaceholder}
        suffix={<Icon type="search" />}
        className={
          displayLocation === "detail"
            ? style.detailSearchInput
            : style.listSearchInput
        }
      />,
    ];

    if (displayLocation === "detail") {
      return [
        <Button
          key="refresh"
          style={{ marginRight: 4 }}
          onClick={refetchData}
          variant="secondary"
          icon={<Icon type="refresh" />}
        />,
        <Action
          key="action"
          view="sub.virtualization"
          menuList={list}
          viewMap={viewMap}
          position="toolbar"
          selectedList={[]}
          source={source}
        />,
      ];
    }

    return [
      ...commonToolbar,
      <Select
        key="sort"
        className={style.typeSelect}
        value={sortBy}
        onChange={handleChangeSoryBy}
      >
        <Select.Option value="count">
          {intl.formatMessage({
            id: "orderBy.snapshotCount",
            defaultMessage: "By Snapshot Number",
          })}
        </Select.Option>
        <Select.Option value="size">
          {intl.formatMessage({
            id: "orderBy.snapshotCapacity",
            defaultMessage: "By Snapshot Size",
          })}
        </Select.Option>
      </Select>,
    ];
  }, [displayLocation, intl, searchValue, sortBy, source]);

  const createBtn = useMemo(() => {
    /**
     * 1.存在共享盘
     * 2.虚拟机状态为Destroyed
     * 3.存在RDM(ScsiLun)盘
     */

    const buttonEle = (
      <Button variant="link" disabled style={{ padding: 0, fontSize: 12 }}>
        {intl.formatMessage({
          id: "go.to.create",
          defaultMessage: "Create",
        })}
      </Button>
    );

    if (source?.state === VmInstanceState.Destroyed) {
      return buttonEle;
    }
    if ((source?.attachedShareableVolumeUuidList || [])?.length > 0) {
      return (
        <Tooltip
          title={intl.formatMessage({
            id: "virtualization.vm.have.shareable.tips",
            defaultMessage: "The current virtual machine has shared disks attached and cannot create a snapshot.",
          })}
        >
          <span>{buttonEle}</span>
        </Tooltip>
      );
    }
    if (source?.haveScsiLun) {
      return (
        <Tooltip
          title={intl.formatMessage({
            id: "vm.action.create.snapshot.with.rdm.volume",
            defaultMessage: "The virtual machine exists on RDM disk, and cannot create a snapshot.",
          })}
        >
          <span>{buttonEle}</span>
        </Tooltip>
      );
    }
    return (
      <Button
        variant="link"
        style={{ padding: 0, fontSize: 12 }}
        onClick={() => setCreateSnapShotVisable(true)}
      >
        {intl.formatMessage({
          id: "go.to.create",
          defaultMessage: "Create",
        })}
      </Button>
    );
  }, [intl, source]);

  const renderTree = useMemo(() => {
    if (loading) {
      return <Spin spinning={loading} className={style.spin} />;
    }

    return (
      <>
        {treeData.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{ height: "100%" }}
          >
            <Empty
              className={style.empty}
              type="Table"
              description={
                displayLocation === "detail"
                  ? canCreateSnapshot
                    ? intl.formatMessage(
                        {
                          id: "not.virtualmachine.snapshot",
                          defaultMessage: "No VM snapshots, {add}",
                        },
                        {
                          add: createBtn,
                        },
                      )
                    : intl.formatMessage({
                        id: "no.virtualmachine.snapshot",
                        defaultMessage: "No VM Snapshots",
                      })
                  : intl.formatMessage({
                      id: "no.data",
                      defaultMessage: "No Data",
                    })
              }
            />
          </div>
        ) : (
          <DirectoryTree
            treeData={treeData}
            selectedKeys={selectedKeys}
            onTreeNodeSelect={onTreeNodeSelected}
            expandedKeys={[...defaultExpandedKeys, ...additionalExpandedKeys]}
            onTreeNodeExpand={onTreeNodeExpand}
          />
        )}
      </>
    );
  }, [
    loading,
    treeData,
    displayLocation,
    intl,
    createBtn,
    selectedKeys,
    defaultExpandedKeys,
    additionalExpandedKeys,
  ]);

  return (
    <>
      <div className={style.sideList}>
        {isWarning && displayLocation === "detail" && (
          <Alert
            variant={isWarning ? "warning" : "info"}
            closable
            style={{ marginBottom: 12 }}
          >
            {alertMessage}
          </Alert>
        )}
        <div className={style.toolbar}>{renderToolbar}</div>
        <div className={style.scrollBox}>{renderTree}</div>
      </div>
      {displayLocation === "detail" && (
        <CreateSnapShot
          visible={createSnapShotVisable}
          setVisible={setCreateSnapShotVisable}
          view=""
          selectedList={[]}
          position="header"
          source={source}
        />
      )}
    </>
  );
};

export default SideList;
