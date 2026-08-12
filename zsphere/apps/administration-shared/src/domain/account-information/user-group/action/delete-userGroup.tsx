import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router";

import { deleteUserGroup } from "../../../../../gql/user-group.gql";

const Action: React.FC<IActionWrapperProps<IUserGroup>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  const doAction = useAction();

  const onOk = async () => {
    setVisible(false);

    const payload = selectedList.map((item) => ({
      uuid: item.uuid,
    }));

    doAction({
      mutation: deleteUserGroup,
      payload,
      name: intl.formatMessage({
        id: "virtualization.delete.user.group",
        defaultMessage: "Delete User Group",
      }),
      total: 1,
      type: "UserGroup",
      onFinish: () => {
        if (
          location.pathname?.includes("/account-information/user-group/detail")
        ) {
          navigate(-1);
        }
        refetch?.();
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "delete.userGroup.title",
        defaultMessage: "Delete User Group?",
      })}
      visible={visible}
      setVisible={setVisible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      bannerMessage={intl.formatMessage({
        id: "delete.userGroup.alert.message",
        defaultMessage:
          "After a user group is deleted, all users within the group will no longer have the roles and shared resources inherited from that group. Proceed with caution.",
      })}
      onConfirm={onOk}
    />
  );
};

export default Action;
