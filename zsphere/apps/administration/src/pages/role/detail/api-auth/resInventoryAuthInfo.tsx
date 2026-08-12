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
  useAPIAuthPrivilegeListByKey,
  ITargetKey,
} from "./configures/use-privilege-list";

interface IResInventoryAuthInfoProps {
  detail?: IZsvRole;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: any;
  handleViewClick: ({
    title,
    apiList,
  }: {
    title: string;
    apiList: any[];
  }) => void;
}

const ResInventoryAuthInfo: FC<IResInventoryAuthInfoProps> = ({
  detail,
  onCollapseChange,
  collapsed,
  handleViewClick,
}) => {
  const intl = useIntl();
  const [editConfigVisible, setEditConfigVisible] = useState<boolean>(false);
  const resInventoryAuth = useAPIAuthPrivilegeListByKey({
    intl,
    targetKey: ITargetKey.resInventoryAuth,
    detail,
  });

  const resInventoryAuthMemo = useMemo(
    () => resInventoryAuth?.children,
    [resInventoryAuth],
  );

  const list: ListItem[] = useMemo(() => {
    return resInventoryAuthMemo?.map((item: any) => {
      return {
        label: item.name,
        value: <ItemField item={item} handleViewClick={handleViewClick} />,
      };
    });
  }, [intl, resInventoryAuthMemo]);

  const title = useMemo(
    () =>
      intl.formatMessage({
        id: "role.detail.api.auth.res.inventory.title",
        defaultMessage: "Inventory",
      }),
    [intl],
  );

  return (
    <>
      <DraggableCard
        title={title}
        isList
        key={ITargetKey.resInventoryAuth}
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
          selectedList={resInventoryAuthMemo}
          source={detail}
          title={title}
        />
      )}
    </>
  );
};

export default ResInventoryAuthInfo;
