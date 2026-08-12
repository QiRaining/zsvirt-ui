export interface InstallMigrationServiceActionPayload {
  uuid: string;
  config: string;
}

export const buildInstallMigrationServicePayload = (
  uuid: string,
  config: string,
): InstallMigrationServiceActionPayload[] => [{ uuid, config }];
