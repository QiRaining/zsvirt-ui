import { useCallback } from "react";

export const useHumanReadableBytes = () => {
  const format = useCallback((bytes?: number) => {
    if (bytes === 0) {
      return "0 B";
    }
    if (typeof bytes === "number" && !Number.isNaN(bytes)) {
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      return `${parseFloat((bytes / 1024 ** i).toFixed(2))} ${sizes[i]}`;
    }
    return "0 B";
  }, []);
  const plainFormat = useCallback((bytes?: number) => {
    if (bytes === 0) {
      return {
        value: 0,
        unit: "B",
      };
    }
    if (typeof bytes === "number" && !Number.isNaN(bytes)) {
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      return {
        value: parseFloat((bytes / 1024 ** i).toFixed(2)),
        unit: sizes[i],
      };
    }
    return {
      value: 0,
      unit: "B",
    };
  }, []);
  return {
    format,
    plainFormat,
  };
};
