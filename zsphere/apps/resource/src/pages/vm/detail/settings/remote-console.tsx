import { List, ResourceName } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { vmConsoleModeMap } from "../../utils";

interface IProps {
  detail: IVM;
  resourceConfig: any;
}

const RemoteConsoleSetting: React.FC<IProps> = ({ detail, resourceConfig }) => {
  const intl = useIntl();

  // const isWindow = ['Windows', 'WindowsVirtio'].includes(detail?.platform!)

  const list = React.useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "console.mode",
          defaultMessage: "Console Mode",
        }),
        value: vmConsoleModeMap(
          detail.systemTag?.vmConsoleMode as string,
          detail.consoleAddress,
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.vdiMonitorNumber",
          defaultMessage: "VDI Screen Count",
        }),
        show: ["spice", "vncAndSpice"].includes(
          detail.systemTag?.vmConsoleMode ?? "",
        ),
        value: (
          <ResourceName
            canModify
            value={detail?.systemTag?.VDIMonitorNumber || "1"}
          />
        ),
      },
      {
        label: "Spice Streaming",
        value: (
          <ResourceName
            canModify
            value={resourceConfig?.spiceStreamingMode?.value}
          />
        ),
        show: ["spice", "vncAndSpice"].includes(
          detail.systemTag?.vmConsoleMode ?? "",
        ),
      },
      {
        label: intl.formatMessage({
          id: "usbRedirect",
          defaultMessage: "USB Redirection",
        }),
        value: <ResourceName value={!!detail.systemTag?.usbRedirect} />,
      },
    ];
  }, [intl, detail]);

  return <List list={list} />;
};

export default RemoteConsoleSetting;
