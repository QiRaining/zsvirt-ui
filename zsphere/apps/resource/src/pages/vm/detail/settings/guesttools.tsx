import { List, ResourceName } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IVM;
}

const GuestToolsSetting: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();

  const getCrashStrategyName = (value: string | undefined) => {
    if (typeof value !== "string") {
      return;
    }
    const crashStrategyMap: { [key: string]: string } = {
      None: intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      Preserve: intl.formatMessage({
        id: "Preserve",
        defaultMessage: "No Action",
      }),
      Shutdown: intl.formatMessage({ id: "Shutdown", defaultMessage: "Shutdown" }),
      Reboot: intl.formatMessage({ id: "Reboot", defaultMessage: "Reboot" }),
    };
    return crashStrategyMap[value];
  };

  const list = React.useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "crash.handle.strategy",
          defaultMessage: "Failure Response Policy",
        }),
        value: getCrashStrategyName(detail?.crashStrategy),
      },
      {
        label: intl.formatMessage({
          id: "timeSync",
          defaultMessage: "Time Synchronization",
        }),
        value: <ResourceName value={detail?.systemTag?.timeTrack !== "0"} />,
      },
    ];
  }, [intl, detail]);

  return <List list={list} />;
};

export default GuestToolsSetting;
