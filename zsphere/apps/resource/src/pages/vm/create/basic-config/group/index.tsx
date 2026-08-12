import { useLazyQuery } from "@apollo/client";
import { vmDirectoryGroupList } from "@zstack/virtualization-resource/src/gql/vm-directory.gql";
import {
  formatGroupName,
  getAllParent,
  getTreeList,
  treeFilterByName,
} from "@zstack/virtualization-resource/src/pages/directory/utils";
import { Form } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { DirectoryQueryType, Op } from "@zstack/zsphere-types";
import { useDebounceFn } from "ahooks";
import { cloneDeep as _cloneDeep } from "lodash-es";
import React, { useRef, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import DirectoryTreeSelect from "./tree-select";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  zoneUuid?: string;
  source?: any;
  width?: number;
}

const { Item } = Form;

const genKey = () => Math.random().toString(16).substring(2);

const Group: React.FC<IProps> = ({ form, zoneUuid, source, width = 400 }) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(["-2"]);
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState([]);

  const [groupTreeOptions, setGroupTreeOptions] = useState([
    {
      label: intl.formatMessage({ id: "no.group", defaultMessage: "Default" }),
      value: "-2",
    },
  ]);

  const [expandedDirKeys, setExpandedDirKeys] = useState<string[]>(["-1"]);

  const [groupExpandedDirKeys, setGroupExpandedDirKeys] = useState<string[]>([
    "-1",
  ]);

  const treeElementKey = useRef<string>(genKey());

  const isRestored = useRef<boolean>(false);

  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<null | string>(null);

  const [getGroupDirectory, { data: _groupData }] = useLazyQuery(
    vmDirectoryGroupList,
    {
      fetchPolicy: "no-cache",
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
        // setTreeData(treedData as any)
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

  //一键展开/折叠
  const onChangeTreeExpandStatus = () => {
    if (expandedDirKeys.length !== 0) {
      setExpandedDirKeys([]);
    } else {
      setExpandedDirKeys(groupExpandedDirKeys);
    }
  };

  const onGroupSelected = (keys: any, e: any) => {
    const newKeys = keys.length === 0 ? selectedKeys : keys;

    setSelectedKeys(newKeys);
    form.setFields?.([
      {
        name: "group",
        value: {
          label: formatGroupName(e.node.groupName, e.node.key, intl),
          value: e.node.key,
        },
      },
    ]);
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      getGroupDirectory({
        variables: {
          conditions: [{ key: "zoneUuid", value: zoneUuid, op: Op.eq }],
        },
      });
    }
  }, [zoneUuid, getGroupDirectory, open]);

  useEffect(() => {
    if (source?.__typename === "VMGroupDirectory") {
      form?.setFields?.([
        {
          name: "group",
          value: {
            value: source?.uuid,
            label: source?.groupName,
          },
        },
      ]);
      setGroupTreeOptions([
        {
          value: source?.uuid,
          label: source?.groupName,
        },
      ]);
      setSelectedKeys([source?.uuid]);
    } else if (source?.__typename === "VmInstance") {
      form?.setFields?.([
        {
          name: "group",
          value: {
            value: source?.group?.uuid,
            label:
              source?.group?.uuid === "-2"
                ? intl.formatMessage({
                    id: "no.group",
                    defaultMessage: "Default",
                  })
                : source?.group?.groupName,
          },
        },
      ]);
      setGroupTreeOptions([
        {
          value: source?.group?.uuid,
          label:
            source?.group?.uuid === "-2"
              ? intl.formatMessage({ id: "no.group", defaultMessage: "Default" })
              : source?.group?.groupName,
        },
      ]);
      setSelectedKeys([source?.group?.uuid]);
    } else {
      form?.setFields?.([
        {
          name: "group",
          value: {
            value: "-2",
            label: intl.formatMessage({
              id: "no.group",
              defaultMessage: "Default",
            }),
          },
        },
      ]);
    }
  }, [source, form, intl]);

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
    <Item
      label={intl.formatMessage({
        id: "virtualization.create.fields.instance.group",
        defaultMessage: "Group",
      })}
      name="group"
    >
      {source?.__typename === "VMGroupDirectory" ? (
        source?.name
      ) : (
        <DirectoryTreeSelect
          width={width}
          onTreeNodeSelect={onGroupSelected}
          serachGroupTree={serachGroupTree}
          viewType="group"
          expandedKeys={expandedDirKeys}
          selectedKeys={selectedKeys}
          searchValue={searchValue as any}
          onTreeNodeExpand={setExpandedDirKeys}
          groupTreeOptions={groupTreeOptions}
          oneKeyExpand={onChangeTreeExpandStatus}
          setSearchValue={setSearchValue}
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
      )}
    </Item>
  );
};

export default React.memo(Group);
