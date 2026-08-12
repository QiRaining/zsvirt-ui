import { useActionConfig } from "@zstack/zsphere-engine/src/https-certificate";
import { useIntl } from "react-intl";

export interface IProps {
  isDualMnDisconnected: boolean;
}

export default ({ isDualMnDisconnected }: IProps) => {
  const intl = useIntl();
  return useActionConfig([
    {
      key: "virtualization.import.certification.http",
      ActionWrapper: require("../action/import-certification/index").default,
      primary: true,
      autoInjectPreValidator: false,
      validators: [() => !isDualMnDisconnected],
      tooltipPlacement: "top",
      tooltip: {
        title: intl.formatMessage({
          id: "cert.import.disabled",
          defaultMessage: "The management node has an exception, please restore it and then proceed with the setting...",
        }),
      },
    },
    {
      key: "virtualization.import.certification",
      ActionWrapper: require("../action/import-certification/index").default,
      autoInjectPreValidator: false,
      validators: [() => !isDualMnDisconnected],
      tooltipPlacement: "top",
      tooltip: {
        title: intl.formatMessage({
          id: "cert.import.disabled",
          defaultMessage: "The management node has an exception, please restore it and then proceed with the setting...",
        }),
      },
    },
    {
      key: "virtualization.restore.default",
      ActionWrapper: require("../action/restore-default").default,
      autoInjectPreValidator: false,
      validators: [() => !isDualMnDisconnected],
    },
  ]);
};
