import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createBackupPolicyNameDescSchema,
  type BackupPolicyNameDescFormValues,
} from "./schema";

const changeSchedulerJobGroupBasicInfo = gql`
  mutation changeSchedulerJobGroupBasicInfo(
    $input: ChangeSchedulerJobGroupBasicInfoInput!
  ) {
    changeSchedulerJobGroupBasicInfo(input: $input) {
      actionId
    }
  }
`;

export default function Edit({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SchedulerJobGroup>) {
  const intl = useIntl();
  const doAction = useAction();

  const current = selectedList?.[0];

  const title = intl.formatMessage({
    id: "backup.policy.editNameDesc.title",
    defaultMessage: "Edit Name and Description",
  });

  const defaultValues = useMemo<BackupPolicyNameDescFormValues>(
    () => ({
      name: current?.name ?? "",
      description: current?.description ?? "",
    }),
    [current],
  );
  const formSchema = useMemo(
    () => createBackupPolicyNameDescSchema(intl),
    [intl],
  );
  const form = useForm<BackupPolicyNameDescFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (current && visible) {
      form.reset(defaultValues);
    }
  }, [current, defaultValues, form, visible]);

  const handleSubmit = useCallback(
    (data: BackupPolicyNameDescFormValues) => {
      const payload = {
        uuid: current?.uuid ?? "",
        name: data.name,
        description: data.description,
      };

      doAction({
        mutation: changeSchedulerJobGroupBasicInfo,
        payload: [payload],
        name: intl.formatMessage({
          id: "backup.policy.editNameDesc.title",
          defaultMessage: "Edit Name and Description",
        }),
        total: 1,
        type: "SchedulerJobGroup",
      });
    },
    [doAction, intl, current],
  );

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={handleSubmit}
      title={title}
      resourceName={current?.name}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            required
            size="m"
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            rows={3}
            limit={256}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
}
