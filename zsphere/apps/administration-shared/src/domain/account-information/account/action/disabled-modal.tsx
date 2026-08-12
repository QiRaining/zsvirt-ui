import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { State as StateEnum } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { updateAccount } from "../../../../../gql/account.gql";

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
      .filter((item) => item.state === StateEnum.Enabled)
      .map((it) => ({ uuid: it.uuid, state: StateEnum.Disabled }));

    doAction({
      mutation: updateAccount,
      payload,
      name: intl.formatMessage({
        id: "disabled.account",
        defaultMessage: "Disable User",
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
    <DialogP3
      title={intl.formatMessage({
        id: "account.modal.title.confirm.disable.account",
        defaultMessage: "Disable User?",
      })}
      visible={visible}
      setVisible={setVisible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "user",
        defaultMessage: "User",
      })}
      onConfirm={onOk}
    />
  );
};

export default Action;
