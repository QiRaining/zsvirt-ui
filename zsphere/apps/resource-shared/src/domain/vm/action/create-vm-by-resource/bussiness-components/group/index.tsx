import { gql, useLazyQuery } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { DirectoryQueryType, Op } from "@zstack/zsphere-types";
import { getAllParent } from "@zstack/zsphere-utils";
import { useDebounceFn } from "ahooks";
import { cloneDeep as _cloneDeep } from "lodash-es";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import DirectoryTreeSelect from "./tree-select";
import { formatGroupName, getTreeList, treeFilterByName } from "./utils";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  zoneUuid?: string;
  source?: any;
}

const { Item } = Form;

const vmDirectoryGroupList = gql`
  query vmDirectoryGroupList(
    $conditions: [Condition!]
    $type: DirectoryQueryType
  ) {
    vmDirectoryGroupList(conditions: $conditions, type: $type) {
      list {
        key
        title
        level
        name
        parentUuid
        groupName
        vmCount
        uuid
        createDate
        zoneUuid
      }
    }
  }
`;

const genKey = () => Math.random().toString(16).substring(2);

const Group: React.FC<IProps> = ({ form, zoneUuid, source }) => {
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

  const [getGroupDirectory] = useLazyQuery(vmDirectoryGroupList, {
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
          children: formatedTreeData[0]?.children || [],
          vmCount: formatedTreeData[0]?.vmCount || 0,
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
  });

  //一键展开/折叠
  const onChangeTreeExpandStatus = () => {
    if (expandedDirKeys.length !== 0) {
      setExpandedDirKeys([]);
    } else {
      setExpandedDirKeys(groupExpandedDirKeys);
    }
  };

  const onGroupSelected = (keys: any, e: any) => {
    if (!keys || !Array.isArray(keys)) {
      return;
    }
    const newKeys = keys.length === 0 ? selectedKeys : keys;
    setSelectedKeys(newKeys);
    if (e?.node && form?.setFieldsValue) {
      form.setFieldsValue({
        group: {
          label: formatGroupName(e.node.groupName, e.node.key, intl),
          value: e.node.key,
        },
      });
    } else if (e?.node && form?.setFields) {
      form.setFields([
        {
          name: "group",
          value: {
            label: formatGroupName(e.node.groupName, e.node.key, intl),
            value: e.node.key,
          },
        },
      ]);
    }
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
    if (!form) {
      return;
    }

    if (source?.__typename === "VMGroupDirectory") {
      const groupValue = {
        value: source?.uuid,
        label: source?.groupName,
      };
      if (form.setFieldsValue) {
        form.setFieldsValue({ group: groupValue });
      } else if (form.setFields) {
        form.setFields([
          {
            name: "group",
            value: groupValue,
          },
        ]);
      }
      setGroupTreeOptions([
        {
          value: source?.uuid,
          label: source?.groupName,
        },
      ]);
      setSelectedKeys([source?.uuid]);
    } else if (source?.__typename === "VmInstance") {
      const groupValue = {
        value: source?.group?.uuid,
        label:
          source?.group?.uuid === "-2"
            ? intl.formatMessage({ id: "no.group", defaultMessage: "Default" })
            : source?.group?.groupName,
      };
      if (form.setFieldsValue) {
        form.setFieldsValue({ group: groupValue });
      } else if (form.setFields) {
        form.setFields([
          {
            name: "group",
            value: groupValue,
          },
        ]);
      }
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
      const groupValue = {
        value: "-2",
        label: intl.formatMessage({ id: "no.group", defaultMessage: "Default" }),
      };
      if (form.setFieldsValue) {
        form.setFieldValue("group", groupValue);
      } else if (form.setFields) {
        form.setFields([
          {
            name: "group",
            value: groupValue,
          },
        ]);
      }
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

  return source?.__typename === "VMGroupDirectory" ? (
    <Item
      label={intl.formatMessage({
        id: "virtualization.create.fields.instance.group",
        defaultMessage: "Group",
      })}
      name="group"
    >
      {source?.name}
    </Item>
  ) : (
    <Item
      label={intl.formatMessage({
        id: "virtualization.create.fields.instance.group",
        defaultMessage: "Group",
      })}
      name="group"
    >
      <DirectoryTreeSelect
        width={400}
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
    </Item>
  );
};

export default React.memo(Group);
