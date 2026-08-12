import { useCallback } from "react";

import { useLazyGlobalConfigQuery } from "../use-lazy-global-config-query";

export type UploadTargetTimeType =
  | "image"
  | "storagePackage"
  | "migrationServicePackage";

const UPLOAD_MAX_IDLE_DURATION_NAME = "upload.max.idle.duration.in.seconds";
const DEFAULT_UPLOAD_MAX_IDLE_DURATION_SECONDS = 30;
const UPLOAD_IDLE_DURATION_BUFFER_SECONDS = 10;

const UPLOAD_TYPE_GLOBAL_CONFIG_CATEGORY: Record<
  UploadTargetTimeType,
  "image" | "softwarePackage"
> = {
  image: "image",
  storagePackage: "softwarePackage",
  migrationServicePackage: "softwarePackage",
};

const UPLOAD_MAX_IDLE_DURATION_CONFIGS = [
  {
    category: "image",
    name: UPLOAD_MAX_IDLE_DURATION_NAME,
  },
  {
    category: "softwarePackage",
    name: UPLOAD_MAX_IDLE_DURATION_NAME,
  },
];

export const getUploadGlobalConfigCategory = (
  uploadType: UploadTargetTimeType,
) => UPLOAD_TYPE_GLOBAL_CONFIG_CATEGORY[uploadType];

const parsePositiveDuration = (value?: string | number | null) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const duration = Number(value);
  if (!Number.isFinite(duration) || duration <= 0) {
    return undefined;
  }
  return duration;
};

export const parseUploadMaxIdleDuration = (
  value?: string | number | null,
  defaultValue?: string | number | null,
) =>
  parsePositiveDuration(value) ??
  parsePositiveDuration(defaultValue) ??
  DEFAULT_UPLOAD_MAX_IDLE_DURATION_SECONDS;

export const getTargetUploadTimeByMaxIdleDuration = (maxIdleDuration: number) =>
  Math.max(1, maxIdleDuration - UPLOAD_IDLE_DURATION_BUFFER_SECONDS);

export default function useUploadTargetTime() {
  const { queryGlobalConfig, globalConfigDataMap } = useLazyGlobalConfigQuery(
    UPLOAD_MAX_IDLE_DURATION_CONFIGS,
    {
      autoQuery: true,
      includeUiConfig: false,
      ui: false,
      linkStr: ".",
    },
  );

  return useCallback(
    async (uploadType: UploadTargetTimeType = "image") => {
      const category = getUploadGlobalConfigCategory(uploadType);
      const configKey = `${category}.${UPLOAD_MAX_IDLE_DURATION_NAME}`;
      let config = globalConfigDataMap?.[configKey];

      if (!config) {
        const { data } = await queryGlobalConfig();
        config = data?.globalConfigList?.list?.find(
          (item) =>
            item?.category === category &&
            item?.name === UPLOAD_MAX_IDLE_DURATION_NAME,
        );
      }

      const maxIdleDuration = parseUploadMaxIdleDuration(
        config?.value,
        config?.defaultValue,
      );

      return getTargetUploadTimeByMaxIdleDuration(maxIdleDuration);
    },
    [globalConfigDataMap, queryGlobalConfig],
  );
}
