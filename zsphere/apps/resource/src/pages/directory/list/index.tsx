import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Empty, Input, useAuth } from "@zstack/zsphere-components";
import { useSubscribeOrgTreeChange } from "@zstack/zsphere-hooks";
import type { VMGroupDirectory } from "@zstack/zsphere-types/graphql";
import { updateTreeData, filterBy } from "@zstack/zsphere-utils";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

import DeleteGroup from "../action/delete";
import CreateGroup from "../action/dir-list-create";
import DirectoryTree from "./tree";

import style from "./style.module.less";

interface IProps {
  treeData: any;
  refetch: any;
  source?: any;
  view?: string;
}

interface VMGroupDirectoryTree extends VMGroupDirectory {
  titleNode?: React.ReactNode;
}

const containerHeightStyle = { height: "100%" } as const;
const buttonSizeStyle = { width: 46, height: 32 } as const;
const emptyStyle = { margin: "unset", paddingTop: 84 } as const;

const DirList: React.FC<IProps> = ({ treeData, refetch, source, view }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [deleteGroupVisible, setDeleteGroupVisble] = useState<boolean>(false);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [checkedNodes, setCheckedNodes] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const canCreate = hasAuth({
    authKey: "virtualization.create.sub.directory",
    resource: "vm.dir.group",
    type: "action",
  });
  const canDelete = hasAuth({
    authKey: "delete",
    resource: "vm.dir.group",
    type: "action",
  });

  const onCheck = (nodes: any) => {
    setCheckedNodes(nodes);
  };

  useSubscribeOrgTreeChange({
    resourceTypeList: ["DirectoryGroup", "VmInstance"],
    onFinish: (e: any) => {
      if (
        ["DirectoryGroup", "VmInstance"].indexOf(e?.type) !== -1 &&
        e.state === "success"
      ) {
        refetch();
      }
    },
  });

  const refresh = () => {
    refetch();
  };

  const filteredTreeData = useMemo(() => {
    if (searchValue) {
      return updateTreeData(treeData as VMGroupDirectoryTree[], [
        filterBy({
          field: (current) => current.title,
          keyword: searchValue,
        }),
      ]);
    }
    return treeData;
  }, [searchValue, treeData]);

  return (
    <div className={style["dir-contiainer"]} style={containerHeightStyle}>
      <div className={style.toolbar}>
        <Button
          variant="secondary"
          icon={<Icon type="refresh" />}
          style={buttonSizeStyle}
          onClick={refresh}
        />
        {view === "main" && canCreate && (
          <Button
            variant="secondary"
            icon={<Icon type="plus" />}
            disabled={checkedNodes.length > 1}
            onClick={() => setCreateGroupVisible(true)}
          >
            {intl.formatMessage({
              id: "dirList.create.vm.group",
              defaultMessage: "New VM Group",
            })}
          </Button>
        )}
        {canDelete && (
          <Button
            variant="secondary"
            icon={<Icon type="trash" />}
            disabled={checkedNodes.length === 0}
            onClick={() => setDeleteGroupVisble(true)}
          >
            {intl.formatMessage({ id: "delete", defaultMessage: "Delete" })}
          </Button>
        )}
        <Input
          className="width-320"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={intl.formatMessage({
            id: "vm.group.search.placeholder",
            defaultMessage: "Search Group Name",
          })}
          suffix={<Icon type="search" />}
        />
      </div>
      <div className={style["tree-header"]}>
        <div className={style.name}>
          {intl.formatMessage({
            id: "virtualization.dir.name",
            defaultMessage: "Name",
          })}
        </div>
        <div className={style.vmcount}>
          {intl.formatMessage({
            id: "virtualization.dir.vmCount",
            defaultMessage: "VMs",
          })}
        </div>
        <div className={style["create-time"]}>
          {intl.formatMessage({
            id: "virtualization.dir.createDate",
            defaultMessage: "Creation Time",
          })}
        </div>
        <div className={style.operation}>
          {intl.formatMessage({
            id: "virtualization.dir.operation",
            defaultMessage: "Operation",
          })}
        </div>
      </div>
      <div className={style["dir-tree-container"]}>
        {filteredTreeData.length === 0 ? (
          <Empty
            style={emptyStyle}
            className={style["margin-top"]}
            description={
              searchValue
                ? intl.formatMessage({
                    id: "vm.group.search.no.results",
                    defaultMessage: "No search results found.",
                  })
                : intl.formatMessage({
                    id: "vm.group.no.data",
                    defaultMessage: "No Data",
                  })
            }
          />
        ) : (
          <DirectoryTree
            treeHeight={614}
            treeData={filteredTreeData}
            onCheck={onCheck}
            selectedList={checkedNodes}
          />
        )}
      </div>
      <DeleteGroup
        visible={deleteGroupVisible}
        setVisible={setDeleteGroupVisble}
        selectedList={checkedNodes}
      />
      <CreateGroup
        visible={createGroupVisible}
        setVisible={setCreateGroupVisible}
        selectedList={checkedNodes}
        source={source}
      />
    </div>
  );
};

export default React.memo(DirList);
