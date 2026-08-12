import { useMetricNameConfig } from "@zstack/zsphere-components";
import type { IOption } from "@zstack/zsphere-engine/src/zwatch-alarm-event/useActionConfig";
import useActionConfig from "@zstack/zsphere-engine/src/zwatch-alarm-event/useActionConfig";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { verifyDelete } from "../../resource/action/validator";
import { verifyStart, verifyStop } from "../action/validator";

export default () => {
  const intl = useIntl();
  const { translateEventName } = useMetricNameConfig();
  const options: IOption<ZWatchAlarmVO> = useMemo(
    () => [
      {
        key: "enable.zsv",
        icon: "play-circle-fill",
        iconStyle: {
          color: "#5ACA49",
        },
        validators: [verifyStart],
        notSupportedModal: {
          title: intl.formatMessage({
            id: "zwatchAlarm.modal.title.cannot.start.alarm",
            defaultMessage: "Cannot Enable Alarm",
          }),
          getItemName: (item: ZWatchAlarmVO) => {
            return translateEventName(
              item?.namespace ?? "",
              item?.eventName ?? "",
            );
          },
        },
        ActionWrapper: require("../action/enable").default,
      },
      {
        key: "disable.zsv",
        icon: "stop-circle-fill",
        iconStyle: {
          color: "#F4454C",
        },
        validators: [verifyStop],
        notSupportedModal: {
          title: intl.formatMessage({
            id: "zwatchAlarm.modal.title.cannot.stop.alarm",
            defaultMessage: "Cannot Disable Alarm",
          }),
          getItemName: (item: ZWatchAlarmVO) => {
            return translateEventName(
              item?.namespace ?? "",
              item?.eventName ?? "",
            );
          },
        },
        ActionWrapper: require("../action/disable").default,
      },
      {
        key: "create.zsv",
        primary: true,
        ActionWrapper: require("../create/index").default,
        autoInjectPreValidator: false,
      },
      {
        autoInjectPreValidator: false,
        key: "add.endpoint.zsv",
        ActionWrapper: require("../action/add-zwatch-endpoint-modal").default,
      },
      {
        autoInjectPreValidator: false,
        key: "remove.endpoint.zsv",
        ActionWrapper: require("../action/remove-zwatch-endpoint-modal")
          .default,
      },
      {
        autoInjectPreValidator: false,
        key: "modifyconfig.zsv",
        ActionWrapper: require("../modify/index").default,
      },
      {
        preValidators: [verifyDelete],
        key: "delete.zsv",
        ActionWrapper: require("../action/delete").default,
      },
    ],
    [intl],
  );

  return {
    ...useActionConfig(options),
    getItemName: ({ namespace, eventName }: ZWatchAlarmVO) =>
      translateEventName(namespace, eventName ?? ""),
  };
};
