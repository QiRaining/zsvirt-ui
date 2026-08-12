import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  AccountQueryType,
  Op,
  UserGroupQueryType,
} from "@zstack/zsphere-types";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { PageType } from "../components/sharing-permissions";
import { UserGroupPlainList, AccountPlainList } from "../mf-index";

const zsvShareResourceFromAccount = gql`
  mutation zsvShareResourceFromAccount(
    $input: ZsvShareResourceFromAccountInput!
  ) {
    zsvShareResourceFromAccount(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IUserGroup>> = ({
  refetch,
  visible,
  selectedList: _selectedList,
  setVisible,
  view: _view,
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

  const defaultQuery = useMemo(() => {
    if (isUserGroup) {
      return {
        type: UserGroupQueryType.GET_USERGROUP_BY_NOT_SHARED,
        extraConditions: [
          {
            key: "resourceUuid",
            op: Op.eq,
            value: resourceUuid,
          },
        ],
      };
    }
    return {
      type: AccountQueryType.GET_ACCOUNT_BY_NOT_SHARED,
      conditions: [
        {
          key: "name",
          op: Op.ne,
          value: "admin",
        },
      ],
      extraConditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: resourceUuid,
        },
      ],
    };
  }, [isUserGroup, resourceUuid]);

  const onOk = async (values: any) => {
    const payload = isUserGroup
      ? {
          resourceUuids: [resourceUuid],
          userGroupUuids: values.map((v: any) => v.uuid),
        }
      : {
          resourceUuids: [resourceUuid],
          accountUuids: values.map((v: any) => v.uuid),
        };

    doAction({
      mutation: zsvShareResourceFromAccount,
      payload,
      name: isUserGroup
        ? intl.formatMessage({
            id: "add.user.group.to.share",
            defaultMessage: "Add Shared User Group",
          })
        : intl.formatMessage({
            id: "add.user.to.share",
            defaultMessage: "Add Shared User",
          }),
      total: 1,
      type: "Owner",
      onFinish: () => {
        setVisible(false);
        refetch?.();
      },
    });
  };

  const title = useMemo(() => {
    if (isUserGroup) {
      return intl.formatMessage({
        id: "select.user.group.to.share.title",
        defaultMessage: "Select Shared User Group",
      });
    }
    return intl.formatMessage({
      id: "select.user.to.share.title",
      defaultMessage: "Select Shared User",
    });
  }, [intl, isUserGroup]);

  return (
    <ModalSelect
      title={title}
      showSelect={false}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      selectType="checkbox"
      resourceName={source?.name}
    >
      {isUserGroup ? (
        <UserGroupPlainList view="select" defaultQuery={defaultQuery} />
      ) : (
        <AccountPlainList view="select" defaultQuery={defaultQuery} />
      )}
    </ModalSelect>
  );
};

export default Action;
