import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import EditResourceAuth from "./action/edit-resource-auth";
import ItemField from "./components/ItemField";
import {
  ITargetKey,
  useAPIAuthPrivilegeListByKey,
} from "./configures/use-privilege-list";

interface IOpsManagementInfoProps {
  detail?: IZsvRole;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: any;
  handleViewClick: ({
    title,
    apiList,
  }: {
    title: string;
    apiList: string[];
  }) => void;
}

const OpsManagementInfo: FC<IOpsManagementInfoProps> = ({
  detail,
  onCollapseChange,
  collapsed,
  handleViewClick,
}) => {
  const intl = useIntl();
  const [editConfigVisible, setEditConfigVisible] = useState<boolean>(false);
  const opsManagement = useAPIAuthPrivilegeListByKey({
    intl,
    targetKey: ITargetKey.opsManagement,
    detail,
  });
  const opsManagementMemo = useMemo(
    () => opsManagement?.children,
    [opsManagement],
  );

  const list: ListItem[] = useMemo(() => {
    return opsManagementMemo?.map((item: any) => {
      return {
        label: item.name,
        value: <ItemField item={item} handleViewClick={handleViewClick} />,
      };
    });
  }, [opsManagementMemo]);

  const title = useMemo(
    () =>
      intl.formatMessage({
        id: "ops.management.info.title",
        defaultMessage: "O&M Management",
      }),
    [intl],
  );

  return (
    <>
      <DraggableCard
        key={ITargetKey.opsManagement}
        title={title}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={
          detail?.type === ZsvRoleQueryType.Predefined
            ? []
            : [
                {
                  icon: "edit",
                  onClick: () => setEditConfigVisible(true),
                  authKey: "virtualization.edit.config",
                  resource: "zsv.role",
                },
              ]
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      {editConfigVisible && (
        <EditResourceAuth
          visible={editConfigVisible}
          setVisible={setEditConfigVisible}
          selectedList={opsManagementMemo}
          source={detail}
          title={title}
        />
      )}
    </>
  );
};

export default OpsManagementInfo;
