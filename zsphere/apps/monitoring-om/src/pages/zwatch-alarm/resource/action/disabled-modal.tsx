import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO as IZWatchAlarm } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const updateThirdpartyPlatform = gql`
  mutation ($input: UpdateThirdpartyPlatformInput!) {
    updateThirdpartyPlatform(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IZWatchAlarm>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid, stateEvent: "disable" };
    });
    doAction({
      mutation: updateThirdpartyPlatform,
      payload,
      name: intl.formatMessage({
        id: "disable.zwatchAlarm",
        defaultMessage: "Disable Alarm",
      }),
      total: selectedList.length,
      type: "ThirdpartyPlatform",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "zwatchAlarm.modal.title.confirm.disable.zwatchAlarm",
        defaultMessage: "Disable Alarm?",
      })}
      resourceNames={selectedList.map(
        (item) => item.name ?? item.zhName ?? item.uuid,
      )}
      onConfirm={onOk}
    />
  );
};

export default Action;
