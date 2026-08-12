import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  SnapshotStrategy,
  UpdateSnapshotStrategyPayload,
} from "@zstack/zsphere-types/graphql";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createSnapshotStrategyNameDescSchema,
  type SnapshotStrategyNameDescFormValues,
} from "./schema";

import style from "../components/style.module.less";

const updateSnapshotStrategy = gql`
  mutation updateSnapshotStrategy($input: UpdateSnapshotStrategyInput!) {
    updateSnapshotStrategy(input: $input) {
      actionId
    }
  }
`;

export default function Edit({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SnapshotStrategy>) {
  const intl = useIntl();
  const doAction = useAction();

  const current = selectedList[0];

  const title = intl.formatMessage({
    id: "snapshot.strategy.edit.nameDesc.title",
    defaultMessage: "Edit Name and Description",
  });

  const defaultValues = useMemo<SnapshotStrategyNameDescFormValues>(
    () => ({
      name: current?.name ?? "",
      description: current?.description ?? "",
    }),
    [current],
  );
  const formSchema = useMemo(
    () => createSnapshotStrategyNameDescSchema(intl),
    [intl],
  );
  const form = useForm<SnapshotStrategyNameDescFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible && current) {
      form.reset(defaultValues);
    }
  }, [current, defaultValues, form, visible]);

  const handleSubmit = useCallback(
    (data: SnapshotStrategyNameDescFormValues) => {
      const payload: UpdateSnapshotStrategyPayload = {
        schedulerJobGroupUuid: current?.uuid ?? "",
        name: data.name,
        description: data.description,
      };

      doAction({
        mutation: updateSnapshotStrategy,
        payload: [payload],
        name: title,
        total: 1,
        type: "SnapshotStrategy",
      });
    },
    [doAction, current, title],
  );

  return (
    <DialogForm
      className={style.formModal}
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
            size="m"
            maxLength={256}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
}
