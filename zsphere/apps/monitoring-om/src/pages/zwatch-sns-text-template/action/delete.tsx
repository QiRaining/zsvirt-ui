import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { deleteSNSTextTemplate } from "../../../gql/zwatch-sns-text-template.gql";

const Action: React.FC<IActionWrapperProps<ISNSTextTemplate>> = ({
  position: _position,
  visible,
  refetch,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: deleteSNSTextTemplate,
      payload,
      name: intl.formatMessage({
        id: "delete.messageTemplate",
        defaultMessage: "Delete Message Template",
      }),
      total: selectedList.length,
      type: "SNSTextTemplate",
      onFinish: () => {
        navigate("/zwatch-sns-text-template");
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "zwatchSnsTextTemplate.modal.title.confirm.delete.messageTemplate",
        defaultMessage: "Delete Message Template?",
      })}
      visible={visible}
      setVisible={setVisible}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
