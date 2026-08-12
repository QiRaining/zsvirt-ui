import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { AccountType } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { changeAccountType } from "../../../../../gql/account.gql";

const Action: React.FC<IActionWrapperProps<IAccount>> = ({
  visible,
  refetch,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList
      .filter((item) => item.type !== AccountType.SystemAdmin)
      .map((it) => ({ uuid: it.uuid, type: AccountType.SystemAdmin }));

    doAction({
      mutation: changeAccountType,
      payload,
      name: intl.formatMessage({
        id: "change.to.administrator.user",
        defaultMessage: "Change to Admin User",
      }),
      type: "AccountVO",
      total: payload.length,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP1
      title={intl.formatMessage({
        id: "account.modal.title.confirm.change.to.administrator",
        defaultMessage: "Change to Admin User?",
      })}
      bannerMessage={intl.formatMessage({
        id: "account.modal.message.confirm.change.to.administrator",
        defaultMessage:
          "1. Once a regular user is changed to an admin user, the change cannot be undone.\n\n2. After the change, the previously assigned roles, associated user groups, and shared resources will be automatically removed from the regular user.",
      })}
      visible={visible}
      setVisible={setVisible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      confirmText={intl.formatMessage({
        id: "confirm",
        defaultMessage: "OK",
      })}
      onConfirm={() => {
        onOk();
        setVisible(false);
      }}
    />
  );
};

export default Action;
