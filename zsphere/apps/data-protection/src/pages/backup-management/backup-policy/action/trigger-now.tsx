import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  SwitchField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SchedulerJobGroupType } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createTriggerNowSchema, type TriggerNowFormValues } from "./schema";

const runSchedulerTrigger = gql`
  mutation runSchedulerTrigger($input: RunSchedulerTriggerInput!) {
    runSchedulerTrigger(input: $input) {
      actionId
    }
  }
`;

export default function TriggerNow({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SchedulerJobGroup>) {
  const intl = useIntl();
  const doAction = useAction();

  const current = selectedList?.[0];

  const fullBackupTriggerUuid = useMemo(
    () => JSON.parse(current?.jobData || "{}").fullBackupTriggerUuid,
    [current],
  );

  const title = intl.formatMessage({
    id: "backup.policy.trigger.now.title",
    defaultMessage: "Backup Now",
  });

  const defaultValues = useMemo<TriggerNowFormValues>(
    () => ({
      fullBackup: false,
    }),
    [],
  );
  const formSchema = useMemo(() => createTriggerNowSchema(), []);
  const form = useForm<TriggerNowFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const handleSubmit = useCallback(
    (data: TriggerNowFormValues) => {
      const payload =
        fullBackupTriggerUuid && data.fullBackup
          ? {
              uuid: fullBackupTriggerUuid,
            }
          : {
              uuid: current?.triggersUuid?.find(
                (uuid) => uuid !== fullBackupTriggerUuid,
              ),
            };

      doAction({
        mutation: runSchedulerTrigger,
        payload: [payload],
        name: intl.formatMessage({
          id: "backup.policy.trigger.now.title",
          defaultMessage: "Backup Now",
        }),
        total: 1,
        type: "SchedulerJobGroup",
        onFinish: () => {
          bus.emit("action:refetch:SchedulerJobHistory");
        },
        middleState: {
          type: "SchedulerJobGroup",
          uuids: current?.uuid && current?.jobs?.length ? [current.uuid] : [],
          field: "lastJobResult",
          data: { lastJobResult: { runningCount: current?.jobs?.length || 0 } },
        },
      });
    },
    [doAction, intl, current, fullBackupTriggerUuid],
  );

  return (
    <DialogForm
      form={dialogForm}
      visible={
        current?.jobType === SchedulerJobGroupType.vmBackup ? visible : false
      }
      setVisible={setVisible}
      onOk={handleSubmit as any}
      title={title}
      resourceName={current?.name}
      alertType="info"
      alertMessage={intl.formatMessage({
        id: "backup.policy.perform.immediately.alert.info",
        defaultMessage:
          "This action performs one backup plan immediately and generates new backup data.",
      })}
    >
      <Form {...form}>
        <FieldStack>
          <div className="grid min-h-8 grid-cols-[160px_1fr] items-start gap-x-2.5">
            <div className="flex min-h-8 items-center text-sm leading-[22px] font-normal text-neutral-600">
              {intl.formatMessage({
                id: "backup.mode",
                defaultMessage: "Backup Mode",
              })}
            </div>
            <div className="flex min-h-8 flex-col justify-center text-sm leading-[22px] text-neutral-700">
              {fullBackupTriggerUuid
                ? intl.formatMessage({
                    id: "custom.incremental.backup",
                    defaultMessage: "Customized Incremental Backup",
                  })
                : intl.formatMessage({
                    id: "default.incremental.backup",
                    defaultMessage: "Default Incremental Backup",
                  })}
            </div>
          </div>
          <SwitchField
            form={form}
            name="fullBackup"
            label={intl.formatMessage({
              id: "full.backup",
              defaultMessage: "Full Backup",
            })}
            disabled={!fullBackupTriggerUuid}
            layout="label-width"
            hintClassName="mt-[3px]"
            hint={
              <div className="text-xs leading-5 whitespace-pre-line text-neutral-500">
                {intl.formatMessage({
                  id: "backup.policy.perform.immediately.full.backup.switch.description",
                  defaultMessage:
                    "1. If enabled, a full backup will be manually performed once for the backup resource.\n2. If not enabled, a backup will be performed with the same backup mode as that will be performed next time.",
                })}
              </div>
            }
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
}
