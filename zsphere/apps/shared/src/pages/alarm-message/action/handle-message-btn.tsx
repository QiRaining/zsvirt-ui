import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useAction } from "@zstack/zsphere-hooks";
import type { AlarmHistories } from "@zstack/zsphere-types/graphql";
import { Dropdown, Menu } from "antd";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import SetSilencePeriod from "./set-silence-period";

const ackAlarmData = gql`
  mutation ackAlarmData($input: AckAlarmDataInput!) {
    ackAlarmData(input: $input) {
      actionId
    }
  }
`;

const ONE_MINUTE_SECONDS = 60;
const ONE_HOUR_SECONDS = 60 * ONE_MINUTE_SECONDS;

export const minuteList = [5, 15, 30].map((minute) => [
  minute,
  minute * ONE_MINUTE_SECONDS,
]);
export const hourList = [1, 6].map((hour) => [hour, hour * ONE_HOUR_SECONDS]);

const HandleMessageButton: React.FC<{
  current: AlarmHistories;
  refetch?: Function;
}> = ({ current, refetch }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [visible, setVisible] = useState(false);

  const onClick = (value: number) => {
    const { dataUuid, type, resourceUuid, alarmUuid, subscriptionUuid } =
      current;

    doAction({
      mutation: ackAlarmData,
      payload: {
        dataUuid,
        type,
        resourceUuid,
        alarmUuid,
        subscriptionUuid,
        ackPeriodSec: value,
      },
      name: intl.formatMessage({
        id: "set.silencePeriod",
        defaultMessage: "Set Silence Period",
      }),
      onFinish: () => refetch?.(),
      total: 1,
    });
  };

  const dropdownMenu = (
    <Menu>
      {minuteList.map(([minute, value]) => (
        <Menu.Item key={value} onClick={() => onClick(value)}>
          <div>
            {intl.formatMessage(
              {
                id: "silence.$number.minites",
                defaultMessage: "Mute for {minite} minutes",
              },
              { minite: minute },
            )}
          </div>
        </Menu.Item>
      ))}
      {hourList.map(([hour, value]) => (
        <Menu.Item key={value} onClick={() => onClick(value)}>
          {intl.formatMessage(
            { id: "silence.$number.hours", defaultMessage: "Mute for {hour} hours" },
            { hour },
          )}
        </Menu.Item>
      ))}
      <Menu.Item onClick={() => setVisible(true)}>
        <span>
          {intl.formatMessage({
            id: "custom.silence.period",
            defaultMessage: "Custom Silence Time",
          })}
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={dropdownMenu} trigger={["click"]}>
        <Button
          variant="secondary"
          className="zstack-action-btn"
          data-testid="action-handle.message"
          icon={<Icon type="wrench" />}
          style={{
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {intl.formatMessage({
            id: "handle.message",
            defaultMessage: "Set Silence Period",
          })}
        </Button>
      </Dropdown>
      <SetSilencePeriod
        selectedList={[current]}
        position="header"
        view=""
        visible={visible}
        setVisible={setVisible}
      />
    </>
  );
};

export default HandleMessageButton;
