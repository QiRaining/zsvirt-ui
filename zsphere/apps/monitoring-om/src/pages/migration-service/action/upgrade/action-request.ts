import type { DocumentNode } from "@apollo/client";

import type { ActionCompletionResult } from "../../action-result";

interface UpgradeMigrationServiceActionOptions<
  TPayload extends Record<string, unknown>,
> {
  mutation: DocumentNode;
  name: string;
  payload: TPayload;
}

export const buildUpgradeMigrationServiceAction = <
  TPayload extends Record<string, unknown>,
>({
  mutation,
  name,
  payload,
}: UpgradeMigrationServiceActionOptions<TPayload>) => ({
  mutation,
  name,
  payload,
  total: 1,
  type: "MigrationService" as const,
});

interface CleanupUpgradePackageActionOptions {
  mutation: DocumentNode;
  name: string;
  onFinish: (result: ActionCompletionResult) => void;
  softwarePackageUuid: string;
}

export const buildCleanupUpgradePackageAction = ({
  mutation,
  name,
  onFinish,
  softwarePackageUuid,
}: CleanupUpgradePackageActionOptions) => ({
  forceRunCallback: true,
  mutation,
  name,
  onFinish,
  payload: [{ uuid: softwarePackageUuid }],
  total: 1,
  type: "MigrationService" as const,
});
