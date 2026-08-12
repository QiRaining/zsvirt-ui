import { gql } from "@apollo/client";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const expungeBaremetalInstance = gql`
  mutation expungeBaremetalInstance($input: ExpungeBaremetalInstanceInput!) {
    expungeBaremetalInstance(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IBaremetalInstance>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge(); //***处理敏感操作***
  const onOk = async () => {
    const payload = selectedList.map((item: IBaremetalInstance) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: expungeBaremetalInstance,
      payload,
      name: intl.formatMessage({
        id: "expunge.baremetalInstance",
        defaultMessage: "Expunge Bare Metal Instance",
      }),
      total: selectedList.length,
      type: "BaremetalInstance",
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP0Smart
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "baremetalInstance.modal.title.confirm.expunge.baremetalInstance",
        defaultMessage: "Expunge Bare Metal Instance?",
      })}
      resourceType={intl.formatMessage({
        id: "baremetalInstance",
        defaultMessage: "Bare Metal Instance",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={() => {
        onOk();
      }}
      guide={intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      })}
      needValidate={needValidate}
    />
  );
};

export default Action;
