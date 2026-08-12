import { useActionConfig } from "@zstack/zsphere-engine/src/zone";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { selected, verifyUninstall } from "../../../action/validator";
import AttachZoneAction from "../../../action/zone/attach-zone";
import DetachZoneAction from "../../../action/zone/detach-zone";

export default () => {
  const intl = useIntl();
  return useActionConfig<IZone>([
    {
      key: "load",
      autoInjectPreValidator: false,
      ActionWrapper: AttachZoneAction,
    },
    {
      key: "uninstall",
      validators: [verifyUninstall],
      preValidators: [selected],
      notSupportedModal: {
        title: intl.formatMessage({
          id: "backup.storage.modal.title.cannot.detach.default.zone",
          defaultMessage: "Cannot Detach Data Center",
        }),
      },
      tooltip: {
        title: intl.formatMessage({
          id: "detach.default.zone.action.disabled.tooltip",
          defaultMessage: "You cannot detach the default data center.",
        }),
      },
      ActionWrapper: DetachZoneAction,
    },
  ]);
};
