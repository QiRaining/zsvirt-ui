import type { IOption } from "@zstack/zsphere-engine/src/baremetal-chassis/useActionConfig";
import useActionConfig from "@zstack/zsphere-engine/src/baremetal-chassis/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import {
  BaremetalChassisPowerStatusType,
  StateEvent,
} from "@zstack/zsphere-types";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  baremetalChassisList,
  updateBaremetalChassis,
} from "../../../gql/baremetal-chassis.gql";
import { useChangePowerStatus } from "../action/change-power-status";
import {
  offValidator,
  onValidator,
  openConsoleValidator,
  startValidator,
  stopValidator,
  verifySingleSelect,
  verifyCreateBaremetalInstance,
  verifyUpdateIPMIInfo,
} from "../action/validator";

export const useEnableDisableBtnStyle = () => {
  return {
    enableBtnStyle: {
      icon: "play-circle-fill",
      iconStyle: {
        color: "#5ACA49",
      },
    },
    disableBtnStyle: {
      icon: "stop-circle-fill",
      iconStyle: {
        color: "#F4454C",
      },
    },
  } as any;
};

export default () => {
  const intl = useIntl();
  const doAction = useAction();
  const { changePowerStatus } = useChangePowerStatus();

  const { enableBtnStyle, disableBtnStyle } = useEnableDisableBtnStyle();

  const updateState = usePersistFn(
    ({
      state,
      selectedList,
      setSelectedList,
    }: {
      state: StateEvent;
      selectedList: Array<IBaremetalChassis>;
      setSelectedList?: (v: Array<IBaremetalChassis>) => void;
    }) => {
      doAction({
        mutation: updateBaremetalChassis,
        type: "BaremetalChassis",
        payload: selectedList.map(({ uuid }) => ({
          uuid,
          stateEvent: state,
        })),
        name:
          state === StateEvent.enable
            ? intl.formatMessage({
                id: "enable.baremetalChassis",
                defaultMessage: "Enable Bare Metal Chassis",
              })
            : intl.formatMessage({
                id: "disable.baremetalChassis",
                defaultMessage: "Disable Bare Metal Chassis",
              }),
        total: selectedList.length,
      });

      setSelectedList?.([]);
    },
  );

  const config: IOption<IBaremetalChassis> = useMemo(
    () => [
      {
        key: "add.baremetal.chassis",
        autoInjectPreValidator: false,
        ActionWrapper: require("../create").default,
      },
      {
        key: "edit",
        ActionWrapper: require("../action/update").UpdateNameDescriptionAction,
        preValidators: [verifySingleSelect],
      },
      {
        key: "enable",
        ...enableBtnStyle,
        validators: [startValidator],
        notSupportedModal: {
          title: intl.formatMessage({
            id: "bmchassis.action.modal.title.cannot.start.bm.chassis",
            defaultMessage: "Cannot Enable Bare Metal Chassis",
          }),
        },
        onClick(args) {
          updateState({ ...args, state: StateEvent.enable });
        },
      },
      {
        key: "disable",
        ...disableBtnStyle,
        validators: [stopValidator],
        notSupportedModal: {
          title: intl.formatMessage({
            id: "bmchassis.action.modal.title.cannot.stop.bm.chassis",
            defaultMessage: "Cannot Disable Bare Metal Chassis",
          }),
        },
        onClick(args) {
          updateState({ ...args, state: StateEvent.disable });
        },
      },
      {
        key: "power.on.chassis",
        preValidators: [onValidator],
        onClick({ selectedList, setSelectedList }) {
          changePowerStatus(
            BaremetalChassisPowerStatusType.PowerOn,
            selectedList,
          );

          setSelectedList?.([]);
        },
      },
      {
        key: "power.off.chassis",
        preValidators: [offValidator],
        ActionWrapper: require("../action/change-power-status").OffAction,
      },
      {
        key: "reboot.chassis",
        preValidators: [offValidator],
        ActionWrapper: require("../action/change-power-status").RebootAction,
      },
      {
        key: "get.hardware.info",
        preValidators: [verifySingleSelect],
        ActionWrapper: require("../action/get-hardware-info").default,
      },
      {
        key: "update.bareMetalChassis.ipmiInfo",
        validators: [verifyUpdateIPMIInfo],
        ActionWrapper: require("../action/update-ipmi-modal").default,
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "bareMetalChassis.update.bareMetalChassis.ipmiInfo.description",
              defaultMessage: `### Modify IPMI Info
  1. Modify the IPMI username and password of a baremetal chassis.
  2. Note that this operation supports only baremetal chassis in Unkown power status.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        key: "open.console",
        preValidators: [openConsoleValidator],
        onClick({ selectedList }) {
          window.open(`http://${selectedList[0].ipmiAddress!}`);
        },
      },
      {
        key: "delete.baremetal.chassis",
        ActionWrapper: require("../action/delete").default,
      },
      {
        key: "add.baremetal.instance",
        validators: [verifyCreateBaremetalInstance],
        ActionWrapper: require("../../baremetal-instance/create").default,
      },
    ],
    [intl, updateState, changePowerStatus],
  );

  return {
    ...useActionConfig<IBaremetalChassis>(config),
    gql: baremetalChassisList,
  };
};
