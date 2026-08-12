import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BasicEndPoint as IBasicEndPoint } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

const removeActionFromAlarm = gql`
  mutation removeActionFromAlarm($input: RemoveActionFromAlarmInput!) {
    removeActionFromAlarm(input: $input) {
      actionId
    }
  }
`;

const getUuid = <T extends { uuid: string }>(selectedList: T[]) => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");
  // 在detail页面
  if (uuid) {
    return uuid;
  }
  // list 页面
  return selectedList?.[0]?.uuid;
};

const Action: React.FC<IActionWrapperProps<IBasicEndPoint>> = ({
  visible,
  setVisible,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const alarmUuid = getUuid(selectedList);

  const onOk = async () => {
    const payload = selectedList?.map((it) => ({
      actionUuid: it?.topic?.uuid,
      alarmUuid,
    }));
    doAction({
      mutation: removeActionFromAlarm,
      payload,
      name: intl.formatMessage({
        id: "remove.zwatchEndpoint",
        defaultMessage: "Remove Endpoint",
      }),
      total: selectedList.length,
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      title={intl.formatMessage({
        id: "zwatchEndpoint.modal.title.confirm.remove.zwatchEndpoint",
        defaultMessage: "Remove Endpoint?",
      })}
      resourceNames={selectedList.map((item) => {
        return item.type === "SYSTEM_HTTP"
          ? intl.formatMessage({
              id: "systemAlarmNoticeObject",
              defaultMessage: "System Endpoint",
            })
          : (item.name ?? item.uuid);
      })}
    />
  );
};

export default Action;
