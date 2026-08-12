import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const recoverBaremetalInstance = gql`
  mutation recoverBaremetalInstance($input: RecoverBaremetalInstanceInput!) {
    recoverBaremetalInstance(input: $input) {
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

  const onOk = async () => {
    const payload = selectedList.map((item: IBaremetalInstance) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: recoverBaremetalInstance,
      payload,
      name: intl.formatMessage({
        id: "recover.baremetalInstance",
        defaultMessage: "Recover Bare Metal Instance",
      }),
      type: "BaremetalInstance",
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
      },
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "baremetalInstance.modal.title.confirm.recover.baremetalInstance",
        defaultMessage: "Recover Bare Metal Instance?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "baremetalInstance",
        defaultMessage: "Bare Metal Instance",
      })}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
