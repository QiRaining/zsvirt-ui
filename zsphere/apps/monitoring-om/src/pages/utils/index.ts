export const getHostPrefix = (metricName?: string) => {
  return metricName?.match(/(KVM|XDragon)(.)*(Host)/)?.[1] ?? "";
};
