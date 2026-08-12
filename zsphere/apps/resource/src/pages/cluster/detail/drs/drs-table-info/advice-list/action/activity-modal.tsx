import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { DRSAdvice as IDRSAdvice } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const applyDRSAdvice = gql`
  mutation applyDRSAdvice($input: ApplyDRSAdviceListInput!) {
    applyDRSAdvice(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IDRSAdvice>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList?.map((item: IDRSAdvice) => ({
      adviceUuid: item.uuid,
    }));
    doAction({
      mutation: applyDRSAdvice,
      payload,
      name: intl.formatMessage({
        id: "executeDispatchAdvice",
        defaultMessage: "Follow DRS Recommendations",
      }),
      total: selectedList.length,
      type: "SehedulingInformation",
      middleState: {
        type: "DRSAdvice",
        field: "status",
        data: { status: "InProgress" },
        uuids: selectedList.map((item) => item.uuid),
      },

      onFinish: (_result: IActionResult) => {
        refetch?.();
      },
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      bannerMessage={intl.formatMessage({
        id: "drs.action.execute.dispatch.advice.alert.error",
        defaultMessage:
          "Executing DRS migrates the virtual machines to the destination host. Proceed with caution.",
      })}
      title={intl.formatMessage({
        id: "drs.modal.title.confirm.executeDispatchAdvice",
        defaultMessage: "Follow DRS Recommendations?",
      })}
      resourceNames={selectedList.map((item: IDRSAdvice) => {
        if (item?.vm?.uuid === undefined) {
          return item?.vmUuid || "";
        }
        return item?.vm?.name || "";
      })}
      resourceType={intl.formatMessage({
        id: "dispatchAdvice",
        defaultMessage: "DRS Recommendations",
      })}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
