import { gql } from "@apollo/client";
import { ModalSelect, useMetricNameConfig } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  ZWatchAlarmVO as IZWatchAlarmVO,
  BasicEndPoint as IBasicEndPoint,
} from "@zstack/zsphere-types/graphql";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import List from "../../../zwatch-endpoint/list";

const removeActionFromEventSubscription = gql`
  mutation removeActionFromEventSubscription(
    $input: RemoveActionFromEventSubscriptionInput!
  ) {
    removeActionFromEventSubscription(input: $input) {
      actionId
    }
  }
`;

const AttachClusterList: React.FC<IActionWrapperProps<IZWatchAlarmVO>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [value, onChange] = useState<IZWatchAlarmVO[]>([]);
  const { translateEventName } = useMetricNameConfig();

  const alarmUuid = selectedList?.[0]?.uuid;
  const attachedEndpoint = selectedList[0]?.actions
    ?.map((item) => item.actionUuid)
    ?.filter(Boolean);

  const onOk = (v: IBasicEndPoint[]) => {
    const payload = v.map((it) => {
      return {
        actionUuid: it?.topic?.uuid,
        subscriptionUuid: alarmUuid,
      };
    });
    doAction({
      mutation: removeActionFromEventSubscription,
      payload,
      name: intl.formatMessage({
        id: "virtualization.remove.endpoint.zsv",
        defaultMessage: "Remove Endpoint",
      }),
      total: selectedList.length,
      onFinish: () => {
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
        id: "virtualization.remove.endpoint.zsv",
        defaultMessage: "Remove Endpoint",
      })}
      value={value}
      onChange={onChange}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
      selectType="checkbox"
      resourceName={translateEventName(
        selectedList?.[0]?.namespace,
        selectedList?.[0]?.eventName ?? "",
      )}
    >
      <List
        view="select.virtualization"
        defaultQuery={{
          conditions: [
            {
              key: "topics.uuid",
              op: Op.in,
              values: attachedEndpoint as [],
            },
          ],
        }}
      />
    </ModalSelect>
  );
};

export default AttachClusterList;
