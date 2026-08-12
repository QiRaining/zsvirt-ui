import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const CHANGE_PRECONFIGURATION_TEMPLATE_STATE = gql`
  mutation changePreconfigurationTemplateState(
    $input: ChangePreconfigurationTemplateStateInput!
  ) {
    changePreconfigurationTemplateState(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPreconfigurationTemplate>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList.map((item: IPreconfigurationTemplate) => {
      return { uuid: item.uuid, stateEvent: "enable" };
    });

    doAction({
      mutation: CHANGE_PRECONFIGURATION_TEMPLATE_STATE,
      payload,
      name: intl.formatMessage({
        id: "enable.preConfigurationTemplate",
        defaultMessage: "Enable Bare Metal Template",
      }),
      type: "PreconfigurationTemplate",
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "preConfigurationTemplate.modal.title.confirm.enable.preConfigurationTemplate",
        defaultMessage: "Enable Bare Metal Template?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "preConfigurationTemplate",
        defaultMessage: "Bare Metal Template",
      })}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
