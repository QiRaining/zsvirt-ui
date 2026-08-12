import { useMetricNameConfig } from "@zstack/zsphere-components";
import type { EmergencyLevel } from "@zstack/zsphere-types";
import React from "react";

interface IProps {
  level: EmergencyLevel;
}

const State: React.FC<IProps> = ({ level }) => {
  const { translateEmergencyLevel } = useMetricNameConfig();
  return translateEmergencyLevel(level);
};

export default State;
