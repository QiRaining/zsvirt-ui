import type { DRS as IDRS } from "@zstack/zsphere-types/graphql";

export const validateEnabled = (current: IDRS) => {
  return current?.state !== "Enabled";
};

export const validateDisabled = (current: IDRS) => {
  return current?.state !== "Disabled";
};
