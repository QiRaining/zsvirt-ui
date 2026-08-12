import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { removeUsers } from "../../../../gql/user-group.gql";

const Action: React.FC<IActionWrapperProps<IUserGroup>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const onOk = async () => {
    doAction({
      mutation: removeUsers,
      payload: {
        accountUuids: [uuid],
        userGroupUuids: selectedList.map((item: any) => item.uuid),
      },
      name: intl.formatMessage({
        id: "virtualization.remove.user.group",
        defaultMessage: "Remove User Group",
      }),
      total: 1,
      type: "UserGroup",
      onFinish: () => {
        setVisible(false);
        refetch?.();
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "remove.user.group.action.title",
        defaultMessage: "Remove User from User Group?",
      })}
      visible={visible}
      setVisible={setVisible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      bannerMessage={intl.formatMessage({
        id: "remove.user.group.action.alert.message",
        defaultMessage:
          "After a user is removed from the user group, the user will no longer have the roles and shared resources inherited from that group. Proceed with caution.",
      })}
      onConfirm={onOk}
    />
  );
};

export default Action;
