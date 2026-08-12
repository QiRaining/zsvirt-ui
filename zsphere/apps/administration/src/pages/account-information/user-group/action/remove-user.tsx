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
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const doAction = useAction();

  const onOk = async () => {
    setVisible(false);

    doAction({
      mutation: removeUsers,
      payload: {
        userGroupUuids: [uuid],
        accountUuids: selectedList.map((account) => account.uuid),
      },
      name: intl.formatMessage({
        id: "virtualization.remove.user",
        defaultMessage: "Remove User",
      }),
      total: 1,
      type: "UserGroup",
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "remove.user.action.title",
        defaultMessage: "Remove User?",
      })}
      visible={visible}
      setVisible={setVisible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      bannerMessage={intl.formatMessage({
        id: "remove.user.action.alert.message",
        defaultMessage:
          "After a user is removed from the user group, the user will no longer have the roles and shared resources inherited from that group. Proceed with caution.",
      })}
      onConfirm={onOk}
    />
  );
};

export default Action;
