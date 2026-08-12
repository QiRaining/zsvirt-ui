import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useLocation, useSearchParams } from "react-router";

const zsvRevokeResourceSharing = gql`
  mutation zsvRevokeResourceSharing($input: ZsvRevokeResourceSharingInput!) {
    zsvRevokeResourceSharing(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IUserGroup>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const pathname = useLocation().pathname;
  const uuid = useSearchParams()[0].get("uuid") ?? "";

  const isUserGroup = pathname?.includes("/user-group/detail");

  const onOk = async () => {
    setVisible(false);

    const payload = isUserGroup
      ? {
          resourceUuids: selectedList.map((item) => item.uuid),
          userGroupUuids: [uuid],
        }
      : {
          resourceUuids: selectedList.map((item) => item.uuid),
          accountUuids: [uuid],
        };

    doAction({
      mutation: zsvRevokeResourceSharing,
      payload,
      name: intl.formatMessage({
        id: "cancel.share",
        defaultMessage: "Unshare",
      }),
      total: 1,
      type: "Owner",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "cancelShare.action.title",
        defaultMessage: "Unshare Resources?",
      })}
      visible={visible}
      setVisible={setVisible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
