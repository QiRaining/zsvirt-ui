import { PrimaryStorageType } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import React from "react";
import type { IntlShape } from "react-intl";
import ReactMarkdown from "react-markdown";

type IMigrateType =
  | "migrateDataStorage"
  | "migrateHost"
  | "migrateHostAndStorage"
  | "batchChangeHostAndStorage"
  | "batchMigrateDataStorage"
  | "batchMigrateHost";

interface IMigrateParams {
  isRunning?: boolean;
  hasSchedulingRule?: boolean;
  hasAttachVF?: boolean;
  snapshotCount?: number;
}

const getMigrateAlertMessage = (
  intl: IntlShape,
  migrateType: IMigrateType,
  source: IMigrateParams,
) => {
  const createMessage = (content: string) => (
    <ReactMarkdown>{content}</ReactMarkdown>
  );

  const messageHandlers = new Map([
    // migrateHost handlers
    [
      {
        type: "migrateHost",
        condition: (s: IMigrateParams) =>
          s?.isRunning && s?.hasAttachVF && s?.hasSchedulingRule,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.migrate.vmScheduling.vf.alertMessage",
            defaultMessage:
              "1. The virtual machine is associated with a VM scheduling policy. Changing host may cause conflicts during the policy execution. Proceed based on your needs.\n2. The virtual machine has VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VM with VF NICs attached. Proceed with caution.",
          }),
        ),
    ],
    [
      {
        type: "migrateHost",
        condition: (s: IMigrateParams) => s?.hasSchedulingRule,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.migrate.vmScheduling.alertMessage",
            defaultMessage:
              "The virtual machine is associated with a VM scheduling policy. Changing host may cause conflicts during the policy execution. Proceed based on your needs.",
          }),
        ),
    ],
    [
      {
        type: "migrateHost",
        condition: (s: IMigrateParams) => s?.isRunning && s?.hasAttachVF,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.migrate.vf.alertMessage",
            defaultMessage:
              "The virtual machine has VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VM with VF NICs attached. Proceed with caution.",
          }),
        ),
    ],

    // migrateDataStorage handlers
    [
      {
        type: "migrateDataStorage",
        condition: (s: IMigrateParams) =>
          s?.isRunning && s?.hasAttachVF && s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "vm.modal.title.confirm.migrate.for.snapshot.vf.device",
              defaultMessage: `1. The virtual machine has VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VM with VF NICs attached. Proceed with caution.
2. The virtual machine has {snapshotNum} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VM before the migration.`,
            },
            { snapshotCount: s.snapshotCount },
          ),
        ),
    ],
    [
      {
        type: "migrateDataStorage",
        condition: (s: IMigrateParams) => s?.isRunning && s?.hasAttachVF,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.migrate.for.vf.device",
            defaultMessage:
              "The virtual machine has VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VM with VF NICs attached. Proceed with caution.",
          }),
        ),
    ],
    [
      {
        type: "migrateDataStorage",
        condition: (s: IMigrateParams) => s?.isRunning && s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "vm.modal.title.confirm.migrate.for.snapshot",
              defaultMessage: `1. The virtual machine has {snapshotCount} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution.
2. To keep snapshots, shut down VM before the migration.`,
            },
            { snapshotCount: s.snapshotCount },
          ),
        ),
    ],

    // migrateHostAndStorage handlers
    [
      {
        type: "migrateHostAndStorage",
        condition: (s: IMigrateParams) =>
          s?.hasSchedulingRule && s?.hasAttachVF && s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "vm.modal.title.confirm.migrate.all",
              defaultMessage: `1. The virtual machine is associated with a VM scheduling policy. Changing host and data storage may cause conflicts during the policy execution. Proceed based on your needs.
2. The virtual machine has VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VM with VF NICs attached. Proceed with caution.
3. The virtual machine has {snapshotNum} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VM before the migration.`,
            },
            { snapshotCount: s.snapshotCount },
          ),
        ),
    ],
    [
      {
        type: "migrateHostAndStorage",
        condition: (s: IMigrateParams) =>
          s?.hasSchedulingRule && s?.hasAttachVF,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.migrate.scheduling.vf",
            defaultMessage: `1. The virtual machine is associated with a VM scheduling policy. Changing host and data storage may cause conflicts during the policy execution. Proceed based on your needs.
2. The virtual machine has VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VM with VF NICs attached. Proceed with caution.`,
          }),
        ),
    ],
    [
      {
        type: "migrateHostAndStorage",
        condition: (s: IMigrateParams) =>
          s?.hasSchedulingRule && s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "vm.modal.title.confirm.migrate.scheduling.snapshot",
              defaultMessage: `1. The virtual machine is associated with a VM scheduling policy. Changing host and data storage may cause conflicts during the policy execution. Proceed based on your needs.
2. The virtual machine has {snapshotNum} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VM before the migration.`,
            },
            { snapshotCount: s.snapshotCount },
          ),
        ),
    ],
    [
      {
        type: "migrateHostAndStorage",
        condition: (s: IMigrateParams) => s?.hasAttachVF && s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "vm.modal.title.confirm.migrate.vf.snapshot",
              defaultMessage: `1. The virtual machine has VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VM with VF NICs attached. Proceed with caution.
2. The virtual machine has {snapshotCount} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VM before the migration.`,
            },
            { snapshotCount: s.snapshotCount },
          ),
        ),
    ],
    [
      {
        type: "migrateHostAndStorage",
        condition: (s: IMigrateParams) => s?.hasSchedulingRule,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.migrate.for.vm.SchedulingRule",
            defaultMessage:
              "The virtual machine is associated with a VM scheduling policy. Changing host and data storage may cause conflicts during the policy execution. Proceed based on your needs.",
          }),
        ),
    ],
    [
      {
        type: "migrateHostAndStorage",
        condition: (s: IMigrateParams) => s?.hasAttachVF,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.migrate.vf.alertMessage",
            defaultMessage:
              "The virtual machine has VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VM with VF NICs attached. Proceed with caution.",
          }),
        ),
    ],
    [
      {
        type: "migrateHostAndStorage",
        condition: (s: IMigrateParams) => s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "vm.modal.title.confirm.migrate.for.snapshot",
              defaultMessage:
                "1. The virtual machine has {snapshotCount} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution.\n2. To keep snapshots, shut down VM before the migration.",
            },
            { snapshotCount: s.snapshotCount },
          ),
        ),
    ],

    // batchMigrateHost handlers
    [
      {
        type: "batchMigrateHost",
        condition: (s: IMigrateParams) =>
          s?.hasAttachVF && s?.hasSchedulingRule,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "has.vf.vm.modal.title.confirm.batch.migrate.vmScheduling.alertMessage",
            defaultMessage:
              "1. The virtual machines are associated with VM scheduling policies. Changing host may cause conflicts during the execution of the policies. Proceed based on your needs.\n2. The virtual machines have VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VMs with VF NICs attached. Proceed with caution.",
          }),
        ),
    ],
    [
      {
        type: "batchMigrateHost",
        condition: (s: IMigrateParams) => s?.hasAttachVF,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.batch.migrate.vf.alertMessage",
            defaultMessage:
              "The virtual machines have VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VMs with VF NICs attached. Proceed with caution.",
          }),
        ),
    ],
    [
      {
        type: "batchMigrateHost",
        condition: (s: IMigrateParams) => s?.hasSchedulingRule,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.batch.migrate.vmScheduling.alertMessage",
            defaultMessage:
              "The virtual machines are associated with VM scheduling policies. Changing host may cause conflicts during the execution of the policies. Proceed based on your needs.",
          }),
        ),
    ],

    // batchMigrateDataStorage handlers
    [
      {
        type: "batchMigrateDataStorage",
        condition: (s: IMigrateParams) => s?.hasAttachVF && s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "has.vf.vm.modal.title.confirm.migrate.vm.snapshot.alertMessage",
              defaultMessage: `1. The virtual machines have VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VMs with VF NICs attached. Proceed with caution.
2. The virtual machines have {snapshotNum} snapshots. Migrating storage while the VMs are running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VMs before the migration.`,
            },
            { snapshotCount: s?.snapshotCount },
          ),
        ),
    ],
    [
      {
        type: "batchMigrateDataStorage",
        condition: (s: IMigrateParams) => s?.hasAttachVF,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.batch.migrate.vf.alertMessage",
            defaultMessage:
              "The virtual machines have VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VMs with VF NICs attached. Proceed with caution.",
          }),
        ),
    ],
    [
      {
        type: "batchMigrateDataStorage",
        condition: (s: IMigrateParams) => s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "vm.modal.title.confirm.migrate.vm.snapshot.alertMessage",
              defaultMessage:
                "The virtual machine has {snapshotNum} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VM before the migration.",
            },
            { snapshotNum: s.snapshotCount },
          ),
        ),
    ],

    // batchChangeHostAndStorage handlers
    [
      {
        type: "batchChangeHostAndStorage",
        condition: (s: IMigrateParams) =>
          s?.hasSchedulingRule && s?.hasAttachVF && s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "has.vf.vm.batch.migrate.vmScheduling.and.snapshot.alertMessage",
              defaultMessage: `1. The virtual machines are associated with VM scheduling policies. Changing host may cause conflicts during the execution of the policies. Proceed based on your needs.
2. The virtual machines have VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VMs with VF NICs attached. Proceed with caution.
3. The virtual machines have {snapshotNum} snapshots. Migrating storage while the VMs are running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VMs before the migration.`,
            },
            { snapshotNum: s.snapshotCount },
          ),
        ),
    ],
    [
      {
        type: "batchChangeHostAndStorage",
        condition: (s: IMigrateParams) =>
          s?.hasSchedulingRule && s?.hasAttachVF,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "has.vf.vm.batch.migrate.vmScheduling.alertMessage",
            defaultMessage: `1. The virtual machines are associated with VM scheduling policies. Changing host may cause conflicts during the execution of the policies. Proceed based on your needs.
2. The virtual machines have VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VMs with VF NICs attached. Proceed with caution.`,
          }),
        ),
    ],
    [
      {
        type: "batchChangeHostAndStorage",
        condition: (s: IMigrateParams) =>
          s?.hasSchedulingRule && s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "vm.modal.title.confirm.batch.migrate.vmScheduling.and.snapshot.alertMessage",
              defaultMessage: `1. The virtual machines are associated with VM scheduling policies. Changing host may cause conflicts during the execution of the policies. Proceed based on your needs.

2. The virtual machines have {snapshotNum} snapshots. Migrating storage while the VMs are running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VMs before the migration.`,
            },
            { snapshotNum: s.snapshotCount },
          ),
        ),
    ],
    [
      {
        type: "batchChangeHostAndStorage",
        condition: (s: IMigrateParams) => s?.hasAttachVF && s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "has.vf.vm.batch.migrate.snapshotCount.alertMessage",
              defaultMessage: `1. The virtual machines are associated with VM scheduling policies. Changing host may cause conflicts during the execution of the policies. Proceed based on your needs.
2. The virtual machines have {snapshotNum} snapshots. Migrating storage while the VMs are running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VMs before the migration.`,
            },
            { snapshotNum: s.snapshotCount },
          ),
        ),
    ],
    [
      {
        type: "batchChangeHostAndStorage",
        condition: (s: IMigrateParams) => s?.hasSchedulingRule,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.batch.migrate.vmScheduling.alertMessage",
            defaultMessage:
              "The virtual machines are associated with VM scheduling policies. Changing host may cause conflicts during the execution of the policies. Proceed based on your needs.",
          }),
        ),
    ],
    [
      {
        type: "batchChangeHostAndStorage",
        condition: (s: IMigrateParams) => s?.hasAttachVF,
      },
      () =>
        createMessage(
          intl.formatMessage({
            id: "vm.modal.title.confirm.batch.migrate.vf.alertMessage",
            defaultMessage:
              "The virtual machines have VF NICs attached. Depending on the actual network environment, short network interruptions may occur during the migration of VMs with VF NICs attached. Proceed with caution.",
          }),
        ),
    ],
    [
      {
        type: "batchChangeHostAndStorage",
        condition: (s: IMigrateParams) => s?.snapshotCount,
      },
      (s: IMigrateParams) =>
        createMessage(
          intl.formatMessage(
            {
              id: "vm.modal.title.confirm.batch.migrate.snapshotCount.alertMessage",
              defaultMessage:
                "The virtual machine has {snapshotNum} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution. To keep snapshots, shut down VM before the migration.",
            },
            { snapshotNum: s.snapshotCount },
          ),
        ),
    ],
  ]);

  // 查找并执行匹配的处理函数
  for (const [key, handler] of messageHandlers) {
    if (key.type === migrateType && key.condition(source)) {
      return handler(source);
    }
  }

  return null;
};

export { getMigrateAlertMessage };

export function isRootAndDataVolumePsTypeDifferent(instance?: VmInstance) {
  const allVolumeLocal = !!instance?.allVolumes?.every(
    (vol) => vol.primaryStorage?.type === PrimaryStorageType.LocalStorage,
  );
  const allVolumeNonLocal = !!instance?.allVolumes?.every(
    (vol) => vol.primaryStorage?.type !== PrimaryStorageType.LocalStorage,
  );
  const rootAndDataVolumePsTypeDifferent =
    !allVolumeLocal &&
    !allVolumeNonLocal &&
    (instance?.allVolumes?.length ?? 0) > 1;
  return rootAndDataVolumePsTypeDifferent;
}
