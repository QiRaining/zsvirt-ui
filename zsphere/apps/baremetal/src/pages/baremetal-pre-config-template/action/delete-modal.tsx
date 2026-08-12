import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  DeletePreconfigurationTemplatePayload as IDeletePreconfigurationTemplatePayload,
  PreconfigurationTemplate as IPreconfigurationTemplate,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const DELETE_PRECONFIGURATION_TEMPLATE = gql`
  mutation deletePreConfigurationTemplate(
    $input: DeletePreconfigurationTemplateInput!
  ) {
    deletePreConfigurationTemplate(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPreconfigurationTemplate>> = ({
  visible,
  setVisible,
  view: _view,
  position: _position,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    if (selectedList?.length) {
      const payload: IDeletePreconfigurationTemplatePayload[] =
        selectedList.map((item) => {
          return { uuid: item.uuid };
        });
      doAction({
        mutation: DELETE_PRECONFIGURATION_TEMPLATE,
        payload,
        name: intl.formatMessage({
          id: "delete.preConfigurationTemplate",
          defaultMessage: "Delete Bare Metal Template",
        }),
        type: "PreconfigurationTemplate",
        total: selectedList?.length,
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
      });
    }
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "preConfigurationTemplate.modal.title.confirm.delete.preConfigurationTemplate",
        defaultMessage: "Delete Bare Metal Template?",
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
