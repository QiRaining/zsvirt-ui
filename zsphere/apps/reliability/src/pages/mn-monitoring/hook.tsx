import { State } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";

export const useMnStatusMap = () => {
  const intl = useIntl();

  const mnStatusMap: any = {
    running: {
      name: intl.formatMessage({
        id: "management.node.state.running",
        defaultMessage: "Online",
      }),
      color: "#5BD149",
    },
    stopped: {
      name: intl.formatMessage({ id: "offline", defaultMessage: "Offline" }),
      color: "#96989B",
    },
    unknown: {
      name: intl.formatMessage({
        id: "management.node.state.unknown",
        defaultMessage: "Unknown",
      }),
      color: "#FF3F46",
    },
  };

  return { mnStatusMap };
};

export const useServerStatusMap = () => {
  const serverStatusMap: any = {
    true: <State prefix="dot" type="running" name="True" />,
    false: <State prefix="dot" type="unknown" name="False" />,

    active: <State prefix="dot" type="running" name="Active" />,
    inActive: <State prefix="dot" type="unknown" name="InActive" />,

    error: <State prefix="dot" type="error" name="Error" />,
    mnUnknown: <State prefix="dot" type="unknown" name="Unknown" />,
    unknown: <State prefix="dot" type="error" name="Unknown" />,
    failed: <State prefix="dot" type="error" name="Failed" />,
  };

  return { serverStatusMap };
};

export function getDatabaseStatus(status: string | undefined) {
  if (status === "mysqld is alive") {
    return "active";
  }
  if (status === "not alive") {
    return "inActive";
  }
  return "unknown";
}
