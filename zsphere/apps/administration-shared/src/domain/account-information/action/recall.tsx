import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { PageType } from "../components/sharing-permissions";

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
  setVisible,
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const resourceUuid = searchParams.get("uuid") || "";

  const isUserGroup = useMemo(
    () => source?.currentPage === PageType.userGroup,
    [source?.currentPage],
  );

  const doAction = useAction();

  const onOk = async () => {
    setVisible(false);

    const payload = isUserGroup
      ? {
          resourceUuids: [resourceUuid],
          userGroupUuids: selectedList.map((v) => v.uuid),
        }
      : {
          resourceUuids: [resourceUuid],
          accountUuids: selectedList.map((v) => v.uuid),
        };

    doAction({
      mutation: zsvRevokeResourceSharing,
      payload,
      name: isUserGroup
        ? intl.formatMessage({
            id: "recall.user.group.action.name",
            defaultMessage: "Unshare from User Group",
          })
        : intl.formatMessage({
            id: "recall.user.action.name",
            defaultMessage: "Unshare from User",
          }),
      total: 1,
      type: "Owner",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const title = useMemo(() => {
    if (isUserGroup) {
      return intl.formatMessage({
        id: "recall.user.group.action.title",
        defaultMessage: "Unshare with User Group?",
      });
    }
    return intl.formatMessage({
      id: "recall.user.action.title",
      defaultMessage: "Unshare with User?",
    });
  }, [intl, isUserGroup]);

  return (
    <DialogP3
      title={title}
      visible={visible}
      setVisible={setVisible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
