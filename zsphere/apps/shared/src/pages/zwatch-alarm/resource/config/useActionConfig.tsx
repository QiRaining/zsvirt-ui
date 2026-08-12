import { useMetricNameConfig } from "@zstack/zsphere-components";
import { useActionConfig } from "@zstack/zsphere-engine/src/zwatch-alarm-resource";
import type { IOption } from "@zstack/zsphere-engine/src/zwatch-alarm-resource/useActionConfig";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

import { verifyStart, verifyStop, verifyDelete } from "../action/validator";
import Create from "../create/index";

export default () => {
  const { translateAlarmNameByLocale } = useMetricNameConfig();

  const options: IOption<ZWatchAlarmVO> = useMemo(
    () => [
      {
        key: "enable.zsv",
        icon: "play-circle-fill",
        iconStyle: {
          color: "#5ACA49",
        },
        validators: [verifyStart],
        ActionWrapper: require("../action/enable").default,
      },
      {
        key: "disable.zsv",
        icon: "stop-circle-fill",
        iconStyle: {
          color: "#F4454C",
        },
        validators: [verifyStop],
        ActionWrapper: require("../action/disable").default,
      },
      {
        autoInjectPreValidator: false,
        key: "add.endpoint.to.resource.alarm",
        ActionWrapper: require("../action/add-zwatch-endpoint-modal").default,
      },
      {
        autoInjectPreValidator: false,
        key: "remove.endpoint.from.resource.alarm",
        ActionWrapper: require("../action/remove-zwatch-endpoint-modal")
          .default,
      },
      {
        key: "create.reource.alarm",
        primary: true,
        onClick: null as any,
        ActionWrapper: (props) => <Create {...props} />,
        autoInjectPreValidator: false,
      },
      {
        key: "editConfig",
        ActionWrapper: require("../modify/index").default,
        autoInjectPreValidator: false,
      },
      {
        key: "edit.zsv",
        ActionWrapper: require("../action/edit-name-description").default,
      },
      {
        key: "delete.resource.alarm",
        preValidators: [verifyDelete],
        ActionWrapper: require("../action/delete").default,
      },
    ],
    [],
  );
  return {
    ...useActionConfig(options),
    getItemName: ({ name, zhName }: ZWatchAlarmVO) =>
      translateAlarmNameByLocale(name, zhName),
  };
};
