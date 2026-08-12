interface BuildUpgradePayloadParams {
  softwarePackageUuid: string;
  upgradeType: "Normal" | "Reexecute";
  uploadMethod?: "url" | "local";
  url?: string;
  installPath?: string;
  fileName?: string;
}

export interface UpgradeMigrationServicePayload extends Record<string, unknown> {
  uuid: string;
  upgradeType: "Normal" | "Reexecute";
  backupStorageUuid?: null;
  installPath: string | null;
  url: string | null | undefined;
}

export const buildUpgradeMigrationServicePayload = (
  params: BuildUpgradePayloadParams,
): UpgradeMigrationServicePayload => {
  const { softwarePackageUuid, upgradeType } = params;
  if (upgradeType === "Reexecute") {
    return {
      uuid: softwarePackageUuid,
      upgradeType,
      backupStorageUuid: null,
      installPath: null,
      url: null,
    };
  }

  const fileName = params.fileName as string;
  return {
    uuid: softwarePackageUuid,
    upgradeType,
    installPath: `${params.installPath?.replace(/\/+$/, "")}/${fileName}`,
    url:
      params.uploadMethod === "url"
        ? params.url
        : `upload://${fileName}`,
  };
};
