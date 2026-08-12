import { DocMarkdown } from "@zstack/design";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { AccountType } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { deleteAccounts } from "../../../../../gql/account.gql";

const Action: React.FC<IActionWrapperProps<IAccount>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();

  const onOk = async () => {
    setVisible(false);

    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: deleteAccounts,
      payload,
      name: intl.formatMessage({
        id: "delete.subAccount",
        defaultMessage: "Delete User",
      }),
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
        if (
          window.location.pathname?.includes("/account-information/user/detail")
        ) {
          navigate(-1);
        }
      },
      type: "AccountVO",
    });
  };

  const resourceNames = selectedList.map((item) => item.name ?? item.uuid);

  const alertMessage = useMemo(() => {
    return (
      <DocMarkdown>
        {intl.formatMessage({
          id: "accountManagement.modal.delete.alert.danger",
          defaultMessage: `1. The deleted user will no longer be able to log in to the platform, and ownership of their resources will be transferred to admin.
2. Deleting an SSO user does not affect the user information in the source authentication server.`,
        })}
      </DocMarkdown>
    );
  }, [intl, selectedList]);

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "accountInformation.modal.title.confirm.delete.subAccount",
        defaultMessage: "Delete User?",
      })}
      resourceNames={resourceNames}
      resourceType={intl.formatMessage({
        id: "account",
        defaultMessage: "Account",
      })}
      bannerMessage={alertMessage}
      onConfirm={onOk}
      confirmText={intl.formatMessage({
        id: "confirm.delete.new",
        defaultMessage: "Confirm to Delete",
      })}
    />
  );
};

export default Action;
