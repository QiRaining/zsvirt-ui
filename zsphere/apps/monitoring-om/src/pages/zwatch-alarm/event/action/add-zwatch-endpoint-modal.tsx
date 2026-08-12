import { gql } from "@apollo/client";
import { ModalSelect, useMetricNameConfig } from "@zstack/zsphere-components";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  ZWatchAlarmVO as IZWatchAlarmVO,
  BasicEndPoint as IBasicEndPoint,
} from "@zstack/zsphere-types/graphql";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { useWriteFragment } from "../../../alarm-message/utils";
import List from "../../../zwatch-endpoint/list";

const addActionToEventSubscription = gql`
  mutation addActionToEventSubscription(
    $input: AddActionToEventSubscriptionInput!
  ) {
    addActionToEventSubscription(input: $input) {
      actionId
    }
  }
`;

const getUuid = <T extends { uuid: string }>(
  selectedList: T[],
  source?: any,
) => {
  const [searchParams] = useSearchParams();
  if (source?.__typename === "ZWatchAlarmVO") {
    return source.uuid;
  }
  const uuid = searchParams.get("uuid");
  // 在detail页面
  if (uuid) {
    return uuid;
  }
  // list 页面
  return selectedList?.[0]?.uuid;
};

const AttachClusterList: React.FC<IActionWrapperProps<IZWatchAlarmVO>> = ({
  visible,
  setVisible,
  source,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const writeFragment = useWriteFragment();
  const [value, onChange] = useState<IZWatchAlarmVO[]>([]);
  const { translateEventName } = useMetricNameConfig();

  const alarmUuid: string = getUuid(selectedList, source) as string;

  const current =
    source?.__typename === "ZWatchAlarmVO"
      ? (source as IZWatchAlarmVO)
      : selectedList[0];
  const attachedEndpoint = current?.actions
    ?.map((item) => item.actionUuid)
    ?.filter(Boolean);

  const onOk = (v: IBasicEndPoint[]) => {
    const payload = v?.map((it) => {
      return {
        actionUuid: it?.topic?.uuid,
        subscriptionUuid: alarmUuid,
      };
    });
    doAction({
      mutation: addActionToEventSubscription,
      payload,
      name: intl.formatMessage({
        id: "virtualization.add.endpoint.zsv",
        defaultMessage: "Add Endpoint",
      }),
      total: v.length,
      onProgress: () => {},
      onFinish: (result: IActionResult) => {
        writeFragment({
          type: "ZWatchAlarmVO",
          uuid: alarmUuid,
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
        id: "virtualization.add.endpoint.zsv",
        defaultMessage: "Add Endpoint",
      })}
      value={value}
      onChange={onChange}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
      selectType="checkbox"
      resourceName={translateEventName(
        current?.namespace,
        current?.eventName ?? "",
      )}
    >
      <List
        view="select.virtualization"
        defaultQuery={{
          conditions: [
            {
              key: "state",
              op: Op.eq,
              value: "Enabled",
            },
            {
              key: "topics.uuid",
              op: Op.notIn,
              values: attachedEndpoint as [],
            },
            {
              key: "name",
              op: Op.ne,
              value: "created-by-SystemHTTPTopicAndEndpointCreator",
            },
          ],
        }}
      />
    </ModalSelect>
  );
};

export default AttachClusterList;
