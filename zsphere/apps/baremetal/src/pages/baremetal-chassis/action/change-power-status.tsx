import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { BaremetalChassisPowerStatusType } from "@zstack/zsphere-types";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React from "react";
import { useIntl } from "react-intl";

import { updateBaremetalChassis } from "../../../gql/baremetal-chassis.gql";

export const useChangePowerStatus = () => {
  const intl = useIntl();
  const doAction = useAction();

  const changePowerStatus = usePersistFn(
    (
      powerStatus: BaremetalChassisPowerStatusType,
      selectedList: Array<IBaremetalChassis>,
      refetch: Function | undefined,
    ) => {
      let name = "";

      switch (powerStatus) {
        case BaremetalChassisPowerStatusType.PowerOn:
          name = intl.formatMessage({
            id: "send.onIpmiCmd",
            defaultMessage: 'Send a command to power on "ipmi".',
          });
          break;
        case BaremetalChassisPowerStatusType.PowerOff:
          name = intl.formatMessage({
            id: "send.offIpmiCmd",
            defaultMessage: 'Send a command to power off "ipmi".',
          });
          break;
        case BaremetalChassisPowerStatusType.Reboot:
          name = intl.formatMessage({
            id: "send.restartIpmiCmd",
            defaultMessage: 'Send a command to reboot "ipmi".',
          });
          break;
        default:
      }

      doAction({
        mutation: updateBaremetalChassis,
        payload: selectedList.map(({ uuid }) => ({
          uuid,
          powerStatus,
        })),
        type: "BaremetalChassis",
        name,
        total: selectedList.length,
        onFinish: () => {
          refetch?.();
        },
      });
    },
  );

  return { changePowerStatus };
};

const Action: React.FC<
  IActionWrapperProps<IBaremetalChassis> & {
    powerStatus: BaremetalChassisPowerStatusType;
  }
> = ({
  visible,
  setVisible,
  powerStatus,
  setSelectedList,
  selectedList = [],
  refetch,
}) => {
  const intl = useIntl();
  const { changePowerStatus } = useChangePowerStatus();

  const onOk = () => {
    changePowerStatus(powerStatus, selectedList, refetch);

    setSelectedList?.([]);
  };

  const modalActionProps =
    powerStatus === BaremetalChassisPowerStatusType.PowerOff
      ? {
          title: intl.formatMessage({
            id: "baremetalChassis.modal.title.confirm.powerOff",
            defaultMessage: "Power off Bare Metal Chassis?",
          }),
          alertMessage: intl.formatMessage({
            id: "baremetalChassis.modal.powerOff.alert.danger",
            defaultMessage:
              "Powering off bare metal chassis is equivalent to a forced shutdown and may result in data loss. Proceed with caution.",
          }),
        }
      : {
          title: intl.formatMessage({
            id: "baremetalChassis.modal.title.confirm.restart",
            defaultMessage: "Reboot Bare Metal Chassis?",
          }),
          alertMessage: intl.formatMessage({
            id: "baremetalChassis.modal.restart.alert.danger",
            defaultMessage:
              "Similar to forcible power outage, rebooting baremetal chassis will put you at risk of losing data. Exercise caution when performing this operation.",
          }),
        };

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      title={modalActionProps.title}
      bannerMessage={modalActionProps.alertMessage}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "baremetalChassis",
        defaultMessage: "Bare Metal Chassis",
      })}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;

export const OffAction: React.FC<IActionWrapperProps<IBaremetalChassis>> = (
  props,
) => (
  <Action {...props} powerStatus={BaremetalChassisPowerStatusType.PowerOff} />
);

export const RebootAction: React.FC<IActionWrapperProps<IBaremetalChassis>> = (
  props,
) => <Action {...props} powerStatus={BaremetalChassisPowerStatusType.Reboot} />;
