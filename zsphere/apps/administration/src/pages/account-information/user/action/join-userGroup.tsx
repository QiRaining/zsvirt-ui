import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, UserGroupQueryType } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { addUsers } from "../../../../gql/user-group.gql";
import BindRoleConfirmModal from "../../components/bind-role-confirm-modal";
import UserGroupList from "../../user-group/list";
import { analyzeAccountTypes } from "../../utils";

const Action: React.FC<IActionWrapperProps<IAccount>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  source,
  setSelectedList,
}) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const accountUuid = searchParams.get("uuid") || "";
  const doAction = useAction();
  const { onlyNormalAndThirdParty, isUserGroup } = analyzeAccountTypes(
    selectedList || [],
  );

  const onOk = async (values: any) => {
    doAction({
      mutation: addUsers,
      payload: {
        userGroupUuids: values.map((item: any) => item.uuid),
        accountUuids: accountUuid
          ? [accountUuid]
          : selectedList.map((item: any) => item.uuid),
      },
      name: intl.formatMessage({
        id: "join.userGroup.title",
        defaultMessage: "Join User Group",
      }),
      total: 1,
      type: "UserGroup",
      onFinish: () => {
        setVisible(false);
        refetch?.();
      },
    });
  };

  const resourceName = useMemo(() => {
    if (accountUuid) {
      return source?.name;
    }
    return selectedList.length > 1
      ? intl.formatMessage(
          { id: "object.count", defaultMessage: "{num} objects" },
          { num: selectedList.length },
        )
      : selectedList?.[0]?.name;
  }, [accountUuid, intl, selectedList, source?.name]);

  if (!onlyNormalAndThirdParty && !isUserGroup) {
    return (
      <BindRoleConfirmModal
        visible={visible}
        setVisible={setVisible}
        onOk={() => {
          setVisible(false);
          setSelectedList?.([]);
        }}
        modalConfirmContent={intl.formatMessage({
          id: "join.userGroup.mixed.content",
          defaultMessage: "To add multiple users to the user group, all selected users must be of the same type.",
        })}
        alertMessage={intl.formatMessage({
          id: "join.userGroup.mixed.alert",
          defaultMessage: "Cannot Join User Group",
        })}
      />
    );
  }

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "join.userGroup.title",
        defaultMessage: "Join User Group",
      })}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
      selectType="checkbox"
      resourceName={resourceName}
    >
      <UserGroupList
        view="select"
        defaultQuery={
          accountUuid
            ? {
                type: UserGroupQueryType.GET_USERGROUP_BY_NOT_ACCOUNT,
                extraConditions: [
                  {
                    key: "accountUuid",
                    op: Op.eq,
                    value: accountUuid,
                  },
                ],
              }
            : {}
        }
      />
    </ModalSelect>
  );
};

export default Action;
