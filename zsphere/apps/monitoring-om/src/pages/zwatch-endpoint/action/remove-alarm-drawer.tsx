import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  Op,
  ZWatchAlarmQueryType as IZWatchAlarmQueryType,
} from "@zstack/zsphere-types";
import type {
  EndPoint as IEndPoint,
  ZWatchAlarmVO as IZWatchAlarmVO,
  RemoveAlarmFromEndPointPayload as IRemoveAlarmFromEndPointPayload,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

import RadioList from "../components/radio-list";

const RemoveAlarmAction: React.FC<IActionWrapperProps<IEndPoint>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  reVerify,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const [currentAlarmType, setCurrentAlarmType] = useState(
    IZWatchAlarmQueryType.Resource,
  );

  const removeAlarm = gql`
    mutation removeAlarmFromEndpoint($input: RemoveAlarmFromEndPointInput!) {
      removeAlarmFromEndpoint(input: $input) {
        actionId
      }
    }
  `;
  const defaultQuery = useMemo(() => {
    return {
      type: currentAlarmType,
      conditions: [
        {
          key: "actions.actionUuid",
          op: Op.eq,
          value: selectedList?.[0]?.topic?.uuid,
        },
      ],
      extraConditions: [],
    };
  }, [currentAlarmType, selectedList]);

  const onOk = (value: IZWatchAlarmVO[]) => {
    const payload: IRemoveAlarmFromEndPointPayload[] = value?.map((item) => {
      if (currentAlarmType === IZWatchAlarmQueryType.Resource) {
        return {
          alarmUuid: item.uuid,
          actionUuid: selectedList?.[0]?.topic?.uuid || "",
          type: currentAlarmType,
        };
      }
      return {
        subscriptionUuid: item.uuid,
        actionUuid: selectedList?.[0]?.topic?.uuid || "",
        type: currentAlarmType,
      };
    });

    doAction({
      mutation: removeAlarm,
      payload,
      name: intl.formatMessage({
        id: "remove.zwatchAlarm",
        defaultMessage: "Remove Alarm",
      }),
      total: payload?.length,
      type: "EndPoint",
      onFinish: () => {
        setSelectedList?.([]);
        reVerify?.();
      },
    });
  };

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "zwatchEndpoint.drawer.title.remove.zwatchAlarm",
        defaultMessage: "Remove Alarm",
      })}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      selectType="checkbox"
      onOk={onOk}
      destroyOnClose={true}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <RadioList
        view="select"
        currentAlarmType={currentAlarmType}
        setCurrentAlarmType={setCurrentAlarmType}
        defaultQuery={defaultQuery}
      />
    </ModalSelect>
  );
};

export default RemoveAlarmAction;
