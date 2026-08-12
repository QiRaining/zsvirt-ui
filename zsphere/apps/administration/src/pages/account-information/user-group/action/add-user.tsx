import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { AccountQueryType, AccountType, Op } from "@zstack/zsphere-types";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { addUsers } from "../../../../gql/user-group.gql";
import UserList from "../../user/list";

const Action: React.FC<IActionWrapperProps<IUserGroup>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  source,
}) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const userGroupUuid = searchParams.get("uuid") || "";
  const doAction = useAction();

  const onOk = async (values: any) => {
    setVisible(false);
    doAction({
      mutation: addUsers,
      payload: {
        accountUuids: values.map((v: any) => v.uuid),
        userGroupUuids: userGroupUuid
          ? [userGroupUuid]
          : selectedList.map((v) => v.uuid), //userGroup存在 详情
      },
      name: intl.formatMessage({
        id: "virtualization.add.user",
        defaultMessage: "Add User",
      }),
      total: 1,
      type: "UserGroup",
      onFinish: () => {
        refetch?.();
      },
    });
  };

  const defaultQuery: any = useMemo(() => {
    if (userGroupUuid) {
      return {
        type: AccountQueryType.GET_ACCOUNT_BY_NOT_USERGROUP,
        conditions: [
          {
            key: "type",
            op: Op.ne,
            value: AccountType.SystemAdmin,
          },
        ],
        extraConditions: [
          {
            key: "userGroupUuid",
            op: Op.eq,
            value: userGroupUuid,
          },
        ],
      };
    }

    if (selectedList?.[0]?.__typename === "UserGroup") {
      return {
        conditions: [
          {
            key: "type",
            op: Op.ne,
            value: AccountType.SystemAdmin,
          },
        ],
      };
    }

    return {};
  }, [userGroupUuid, selectedList]);

  const resourceName = useMemo(() => {
    if (userGroupUuid) {
      return source?.name;
    }
    return selectedList.length > 1
      ? intl.formatMessage(
          { id: "object.count", defaultMessage: "{num} objects" },
          { num: selectedList.length },
        )
      : selectedList?.[0]?.name;
  }, [userGroupUuid, intl, selectedList, source?.name]);

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "add.user.title",
        defaultMessage: "Add User",
      })}
      showSelect={false}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      selectType="checkbox"
      resourceName={resourceName}
    >
      <UserList view="select" defaultQuery={defaultQuery} />
    </ModalSelect>
  );
};

export default Action;
