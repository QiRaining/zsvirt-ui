interface MigrationPackageUploadFormData {
  uploadMethod: "url" | "local";
  installPath: string;
  url?: string;
}

export interface MigrationPackageUploadPayload extends Record<string, unknown> {
  name: string;
  installPath: string;
  url: string | undefined;
  type: "ZMigrate";
}

export const buildMigrationPackageUploadPayload = (
  formData: MigrationPackageUploadFormData,
  fileName: string,
): MigrationPackageUploadPayload => ({
  name: fileName.split(".")[0],
  installPath: `${formData.installPath.replace(/\/+$/, "")}/${fileName}`,
  url:
    formData.uploadMethod === "url"
      ? formData.url
      : `upload://${fileName}`,
  type: "ZMigrate",
});
