import type { ISelectProps } from "@zstack/zsphere-components";
import { ELLDPMode } from "@zstack/zsphere-types";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export const useLldpModeMap = () => {
  const intl = useIntl();
  const modeMap = useMemo(
    () =>
      new Map([
        [
          ELLDPMode.rx_only,
          intl.formatMessage({
            id: "physicalNic.lldp.mode.rxOnly",
            defaultMessage: "Receive-only mode",
          }),
        ],
        [
          ELLDPMode.tx_only,
          intl.formatMessage({
            id: "physicalNic.lldp.mode.txOnly",
            defaultMessage: "Transmit-only mode",
          }),
        ],
        [
          ELLDPMode.rx_and_tx,
          intl.formatMessage({
            id: "physicalNic.lldp.mode.rxAndTx",
            defaultMessage: "Transmit and Receive mode",
          }),
        ],
        [
          ELLDPMode.disable,
          intl.formatMessage({
            id: "physicalNic.lldp.mode.disable",
            defaultMessage: "Disabled",
          }),
        ],
      ]),
    [intl],
  );

  const modeOptions = useMemo(() => {
    const options: ISelectProps["options"] = [];
    modeMap.forEach((label, value) => {
      options.push({
        value,
        label,
      });
    });
    return options;
  }, [modeMap]);

  return {
    modeMap,
    modeOptions,
  };
};
