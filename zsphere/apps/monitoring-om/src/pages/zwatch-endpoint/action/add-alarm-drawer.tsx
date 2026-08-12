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
  AddAlarmToEndPointPayload as IAddAlarmToEndPointPayload,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

import RadioList from "../components/radio-list";

const AddAlarmAction: React.FC<IActionWrapperProps<IEndPoint>> = ({
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

  const addAlarm = gql`
    mutation addAlarmToEndpoint($input: AddAlarmToEndPointInput!) {
      addAlarmToEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const defaultQuery = useMemo(() => {
    return {
      type: IZWatchAlarmQueryType.ZwatchEndpoint,
      conditions: [
        {
          key: "uuid",
          op: Op.notIn,
          values: ["14a991d4d7d54a66b14e398ffc510bd6"],
        },
      ],
      extraConditions: [
        {
          key: "alarmType",
          op: Op.eq,
          value: currentAlarmType,
        },
        {
          key: "actionUuid",
          op: Op.eq,
          value: selectedList?.[0]?.topic?.uuid,
        },
      ],
    };
  }, [currentAlarmType, selectedList]);

  const onOk = (value: IZWatchAlarmVO[]) => {
    const payload: IAddAlarmToEndPointPayload[] = value?.map((item) => {
      if (currentAlarmType === IZWatchAlarmQueryType.Resource) {
        return {
          alarmUuid: item.uuid,
          actionUuid: selectedList?.[0]?.topic?.uuid || "",
          actionType: "sns",
          type: currentAlarmType,
        };
      }
      return {
        subscriptionUuid: item.uuid,
        actionUuid: selectedList?.[0]?.topic?.uuid || "",
        actionType: "sns",
        type: currentAlarmType,
      };
    });

    doAction({
      mutation: addAlarm,
      payload,
      name: intl.formatMessage({
        id: "add.zwatchAlarm",
        defaultMessage: "Add Alarm",
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
        id: "zwatchEndpoint.drawer.title.add.zwatchAlarm",
        defaultMessage: "Add Alarm",
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

export default AddAlarmAction;
