import { gql } from "@apollo/client";
import { ModalSelect, useMetricNameConfig } from "@zstack/zsphere-components";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type {
  IActionWrapperProps,
  Condition as ICondition,
} from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  BasicEndPoint as IBasicEndPoint,
  ZWatchAlarmVO as IZWatchAlarmVO,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useLocation, useSearchParams } from "react-router";

import { useWriteFragment } from "../../../alarm-message/action/utils";
import List from "../../../zwatch-endpoint/list";

const addActionToAlarm = gql`
  mutation addActionToAlarm($input: AddActionToAlarmInput!) {
    addActionToAlarm(input: $input) {
      actionId
    }
  }
`;

const getUuid = <T extends { uuid: string }>(
  selectedList: T[],
  source?: any,
) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  if (source?.__typename === "ZWatchAlarmVO") {
    return source.uuid;
  }
  //在通知对象页面用select中的内容
  if (location?.pathname === "/zwatch-endpoint/detail") {
    return selectedList?.[0]?.uuid;
  }

  const uuid = searchParams.get("uuid");
  // 在detail页面
  if (uuid) {
    return uuid;
  }
  // list 页面
  return selectedList?.[0]?.uuid;
};

const AddAlarm: React.FC<IActionWrapperProps<IZWatchAlarmVO>> = ({
  visible,
  setVisible,
  refetch,
  source,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const writeFragment = useWriteFragment();
  const [value, onChange] = useState<IZWatchAlarmVO[]>([]);
  const { translateAlarmNameByLocale } = useMetricNameConfig();

  const alarmUuid: string = getUuid(selectedList, source) as string;

  const current =
    source?.__typename === "ZWatchAlarmVO"
      ? (source as IZWatchAlarmVO)
      : selectedList[0];
  const attachedEndpoint =
    current?.actions?.map((item) => item.actionUuid) ?? [];

  const sendSmsFailedSet =
    current?.eventName === "SendSmsFailed"
      ? [
          {
            key: "type",
            op: Op.ne,
            value: "AliyunSms",
          },
        ]
      : [];

  const conditions: ICondition[] = [
    {
      key: "state",
      op: Op.eq,
      value: "Enabled",
    },
    {
      key: "topics.uuid",
      op: Op.notIn,
      values: attachedEndpoint as string[],
    },
    {
      key: "name",
      op: Op.ne,
      value: "created-by-SystemHTTPTopicAndEndpointCreator",
    },
    ...sendSmsFailedSet,
  ];

  const onOk = (v: IBasicEndPoint[]) => {
    const payload = v?.map((it) => {
      return {
        actionUuid: it?.topic?.uuid,
        alarmUuid,
      };
    });
    doAction({
      mutation: addActionToAlarm,
      payload,
      name: intl.formatMessage({
        id: "add.endpoint",
        defaultMessage: "Add Endpoint",
      }),
      total: v.length,
      onProgress: () => {},
      onFinish: (result: IActionResult) => {
        writeFragment({
          type: "ZWatchAlarmVO",
          uuid: current?.uuid,
          fields: "actions",
          inventory: result?.inventory,
        });
        refetch?.();
      },
    });
    setSelectedList?.([]);
  };

  useEffect(() => {
    onChange([]);
  }, [visible]);

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "add.endpoint",
        defaultMessage: "Add Endpoint",
      })}
      value={value}
      onChange={onChange}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
      selectType="checkbox"
      resourceName={translateAlarmNameByLocale(current?.name, current?.zhName)}
    >
      <List
        view="select.virtualization"
        defaultQuery={{
          conditions,
        }}
      />
    </ModalSelect>
  );
};

export default AddAlarm;
