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

const removeActionFromAlarm = gql`
  mutation removeActionFromAlarm($input: RemoveActionFromAlarmInput!) {
    removeActionFromAlarm(input: $input) {
      actionId
    }
  }
`;

const RemoveZwatchList: React.FC<IActionWrapperProps<IZWatchAlarmVO>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [value, onChange] = useState<IZWatchAlarmVO[]>([]);
  const { translateAlarmNameByLocale } = useMetricNameConfig();

  const alarmUuid = selectedList?.[0]?.uuid;
  const attachedEndpoint =
    selectedList[0]?.actions?.map((item) => item.actionUuid) ?? [];

  const onOk = (v: IBasicEndPoint[]) => {
    const payload = v.map((it) => {
      return {
        actionUuid: it?.topic?.uuid,
        alarmUuid,
      };
    });
    doAction({
      mutation: removeActionFromAlarm,
      payload,
      name: intl.formatMessage({
        id: "remove.endpoint",
        defaultMessage: "Remove Endpoint",
      }),
      total: v.length,
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
        id: "remove.endpoint",
        defaultMessage: "Remove Endpoint",
      })}
      value={value}
      onChange={onChange}
      visible={visible}
      setVisible={setVisible}
      showSelect={false}
      onOk={onOk}
      selectType="checkbox"
      resourceName={translateAlarmNameByLocale(
        selectedList?.[0]?.name,
        selectedList?.[0]?.zhName,
      )}
    >
      <List
        view="select.virtualization"
        defaultQuery={{
          conditions: [
            //
            // {
            //   key: 'state',
            //   op: Op.eq,
            //   value: 'Enabled'
            // },
            {
              key: "topics.uuid",
              op: Op.in,
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

export default RemoveZwatchList;
