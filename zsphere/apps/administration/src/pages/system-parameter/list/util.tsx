import type { IntlShape } from "react-intl";

export const i18nConfig: Record<
  string,
  Record<string, (intl: IntlShape) => string>
> = {
  "virtualization.apiTimeout.org.zstack.storage.primary.local.APILocalStorageMigrateVolumeMsg":
    {
      getDescription: (intl) =>
        intl.formatMessage({
          id: "globalConfig.apiTimeout.org.zstack.storage.primary.local.APILocalStorageMigrateVolumeMsg.description",
          defaultMessage:
            "### Local Storage Disk Migration Timeout\n\nSpecify the maximum timeout limit for migrating disks from local storage. If the migration process exceeds this time limit, the operation will be considered failed. Default: 1 day. Unit: second, minute, hour, and day.",
        }),
    },
};
