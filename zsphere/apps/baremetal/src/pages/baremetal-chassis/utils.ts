export const ipToInt = (ip: string): number => {
  const arr: string[] = ip.split(".");

  return (
    (Number(arr[0]) * 256 * 256 * 256 +
      Number(arr[1]) * 256 * 256 +
      Number(arr[2]) * 256 +
      Number(arr[3])) >>>
    0
  );
};

export const intToIp = (num: number): string => {
  const arr = [
    String((num >>> 24) >>> 0),
    String(((num << 8) >>> 24) >>> 0),
    String((num << 16) >>> 24),
    String((num << 24) >>> 24),
  ];

  return arr.join(".");
};
