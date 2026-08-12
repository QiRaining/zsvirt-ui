import { gql, useLazyQuery } from "@apollo/client";
import { vmDirectoryGroupList } from "@zstack/virtualization-resource/src/gql/vm-directory.gql";
import {
  getAllParent,
  formatGroupName,
  getTreeList,
  treeFilterByName,
} from "@zstack/virtualization-resource/src/pages/directory/utils";
import DirectoryTreeSelect from "@zstack/virtualization-resource/src/pages/vm/create/basic-config/group/tree-select";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { DirectoryQueryType, Op } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { useDebounceFn } from "ahooks";
import { cloneDeep as _cloneDeep } from "lodash-es";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useIntl } from "react-intl";

const addResourcesToDirectory = gql`
  mutation addResourcesToDirectory($input: AddResourcesToDirectoryInput!) {
    addResourcesToDirectory(input: $input) {
      actionId
    }
  }
`;

const MoveToGroupModal: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList,
  refetch,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<null | string>(null);

  const zoneUuid = selectedList?.[0]?.zoneUuid;

  const [groupTreeOptions, setGroupTreeOptions] = useState([
    {
      label: intl.formatMessage({
        id: "all.vm",
        defaultMessage: "All",
      }),
      value: "-1",
    },
  ]);
  const [selectedKeys, setSelectedKeys] = useState(["-2"]);
  const isRestored = useRef<boolean>(false);

  const [expandedDirKeys, setExpandedDirKeys] = useState<string[]>(["-1"]);
  const [groupExpandedDirKeys, setGroupExpandedDirKeys] = useState<string[]>([
    "-1",
  ]);

  const [open, setOpen] = useState(false);

  const initialValues = useMemo(() => {
    const groupUuids = selectedList.map((t: any) => t?.group?.uuid) || [];
    const isAllSameGroup =
      Array.from(new Set(groupUuids)).length === 1 && groupUuids.length !== 1;

    const showDefault = !(isAllSameGroup || groupUuids.length === 1);

    setSelectedKeys([showDefault ? "-2" : groupUuids[0]]);
    return {
      group: showDefault ? "-2" : groupUuids[0],
    };
  }, [selectedList]);

  const [getGroupDirectory, { data: _groupData }] = useLazyQuery(
    vmDirectoryGroupList,
    {
      onCompleted(data) {
        const groupTreeData = data?.vmDirectoryGroupList?.list ?? [];
        const formatedTreeData = getTreeList(groupTreeData, "") as any;
        const treedData = [
          {
            key: "-1",
            disabled: true,
            title: intl.formatMessage({
              id: "all.vm",
              defaultMessage: "All",
            }),
            children: formatedTreeData[0].children || [],
            vmCount: formatedTreeData[0].vmCount,
          },
        ];

        setGroupTreeOptions(
          groupTreeData.map((t: { groupName: any; key: any }) => {
            return {
              label: formatGroupName(t.groupName, t.key, intl),
              value: t.key,
            };
          }),
        );

        if (isSearchMode) {
          const filetdTree = treeFilterByName(treedData, (e: any) => {
            if (e.title.indexOf(searchValue) !== -1) {
              return e;
            }
          });
          setTreeData(filetdTree);
          setExpandedDirKeys(groupTreeData.map((t: any) => t.key));
        } else {
          setTreeData(treedData as any);
          if (groupExpandedDirKeys.length <= 1) {
            setExpandedDirKeys(["-1", "-2"]); //控制展开
          }
          setExpandedDirKeys(_cloneDeep(expandedDirKeys));
        }
        //group all keys
        const canExpandKeys = groupTreeData
          .filter((t: any) => t.level < 4)
          .map((k: any) => k.key);
        setGroupExpandedDirKeys(canExpandKeys);
        setLoading(false);
      },
    },
  );

  //这里拆成两个副作用防止重复渲染
  useEffect(() => {
    if (visible) {
      getGroupDirectory({
        variables: {
          type: DirectoryQueryType.Normal,
          conditions: [{ key: "zoneUuid", value: zoneUuid, op: Op.eq }],
        },
      });
    }
  }, [zoneUuid, selectedList, getGroupDirectory, visible]);

  useEffect(() => {
    if (open) {
      getGroupDirectory({
        variables: {
          type: DirectoryQueryType.Normal,
          conditions: [{ key: "zoneUuid", value: zoneUuid, op: Op.eq }],
        },
      });
    }
  }, [zoneUuid, selectedList, getGroupDirectory, open]);

  //一键展开/折叠
  const onChangeTreeExpandStatus = () => {
    //若展开
    if (expandedDirKeys.length !== 0) {
      setExpandedDirKeys([]);
    } else {
      setExpandedDirKeys(groupExpandedDirKeys);
    }
  };

  const onOk = async () => {
    const payload = selectedList
      .map((t) => {
        return {
          uuid: t.uuid,
          directoryUuid: selectedKeys[0],
          originDirectoryUuid: t?.group?.uuid || "-1",
        };
      })
      .filter((t) => t.directoryUuid !== t.originDirectoryUuid);

    if (payload.length) {
      doAction({
        mutation: addResourcesToDirectory,
        payload,
        name: intl.formatMessage({
          id: "add.vm.to.group",
          defaultMessage: "Add Virtual Machine to Group",
        }),
        total: 1,
        type: "DirectoryGroup",
        onFinish: () => {
          setSelectedList?.([]);
          refetch?.();
        },
      });
    }
  };

  const genKey = () => Math.random().toString(16).substring(2);

  const treeElementKey = useRef<string>(genKey());

  const onGroupSelected = (keys: any, e: any) => {
    setOpen(false);
    if (keys.length !== 0) {
      setSelectedKeys(keys);

      form?.setFields([
        {
          name: "group",
          value: e.node.key,
        },
      ]);
    }
  };

  const { run: serachGroupTree } = useDebounceFn(
    (inputVal) => {
      restoreSearchTodo();
      if (inputVal) {
        setIsSearchMode(true);
      } else {
        setIsSearchMode(false);
        setExpandedDirKeys(["-1"]);
      }

      getGroupDirectory({
        variables: {
          type: DirectoryQueryType.Normal,
          conditions: [{ key: "zoneUuid", value: zoneUuid, op: Op.eq }],
        },
      });
    },
    {
      wait: 800,
    },
  );

  const restoreSearchTodo = () => {
    isRestored.current = true;
    setTreeData([]);
    setLoading(true);
    treeElementKey.current = genKey();
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "move.vm.to.group",
        defaultMessage: "Change Group",
      })}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form} initialValues={initialValues}>
        <Form.Item
          name="group"
          label={intl.formatMessage({
            id: "vm.group",
            defaultMessage: "VM Group",
          })}
        >
          <DirectoryTreeSelect
            widthClassName="w-80"
            onTreeNodeSelect={onGroupSelected}
            serachGroupTree={serachGroupTree}
            viewType="group"
            expandedKeys={expandedDirKeys}
            selectedKeys={selectedKeys}
            onTreeNodeExpand={setExpandedDirKeys}
            groupTreeOptions={groupTreeOptions}
            oneKeyExpand={onChangeTreeExpandStatus}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            getPopupContainer={(triggerNode) =>
              (triggerNode.closest('[role="dialog"]') as HTMLElement) ||
              document.body
            }
            onDropdownVisibleChange={(dpvisible: boolean) => {
              setOpen(dpvisible);
              if (dpvisible) {
                setLoading(true);
                if (selectedKeys[0]) {
                  setExpandedDirKeys([
                    "-1",
                    ...getAllParent(treeData, selectedKeys[0]).filter(
                      (t: string) => t !== selectedKeys[0],
                    ),
                  ]);
                }
              }
              setSearchValue(null);
              setIsSearchMode(false);
            }}
            treeData={treeData}
            loading={loading}
            open={open}
          />
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default MoveToGroupModal;
