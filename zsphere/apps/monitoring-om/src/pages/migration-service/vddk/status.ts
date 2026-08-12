export type VddkStatus =
  | { state: "success"; key: "uploaded" }
  | { state: "error"; key: "missing" }
  | { state: "unknown"; key: "unknown" };

export const getVddkStatus = (uploaded?: boolean): VddkStatus => {
  if (uploaded === true) {
    return { state: "success", key: "uploaded" };
  }
  if (uploaded === false) {
    return { state: "error", key: "missing" };
  }
  return { state: "unknown", key: "unknown" };
};
