import { DraggableCard } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { useLldpModeMap } from "../../hooks/use-lldp-mode-map";

export interface IProps {
  current?: PhysicalNic;
}

export default function LldpInfo({ current }: IProps) {
  const intl = useIntl();
  const { modeMap } = useLldpModeMap();

  const list = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "LLdp.mode.info",
          defaultMessage: "LLDP Mode",
        }),
        value: current?.lLDPMode?.mode && modeMap.get(current?.lLDPMode?.mode),
      },
    ],
    [current, intl, modeMap],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "LLdp.info",
        defaultMessage: "LLDP Information",
      })}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}
