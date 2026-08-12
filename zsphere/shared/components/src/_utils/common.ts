export function getBaseCls(name: string) {
  return `zstack-${name}`;
}

export function escapeQueryString(value: string) {
  return value
    .replace(/\\/g, "\\\\\\")
    .replace(/_/g, "\\\\_")
    .replace(/%/g, "\\\\%");
}
