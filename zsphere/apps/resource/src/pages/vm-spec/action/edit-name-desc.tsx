import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { updateVmCustomSpecification } from "@zstack/virtualization-resource/src/gql/vm-spec.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createVmSpecNameDescSchema,
  type VmSpecNameDescValues,
} from "./schema";

export default function Edit({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<VmCustomSpecification>) {
  const intl = useIntl();
  const doAction = useAction();

  const current = selectedList?.[0];

  const title = intl.formatMessage({
    id: "edit.name.description",
    defaultMessage: "Edit Name and Description",
  });

  const defaultValues = useMemo<VmSpecNameDescValues>(
    () => ({
      name: current?.name ?? "",
      description: current?.description ?? "",
    }),
    [current],
  );
  const formSchema = useMemo(() => createVmSpecNameDescSchema(intl), [intl]);
  const form = useForm<VmSpecNameDescValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = (values: VmSpecNameDescValues) => {
    if (
      !current ||
      (values.name === current.name &&
        values.description === (current.description ?? ""))
    ) {
      return;
    }

    const payload = {
      uuid: current.uuid,
      name: values.name,
      description: values.description,
    };

    doAction({
      mutation: updateVmCustomSpecification,
      payload,
      name: title,
      total: 1,
      type: "VmCustomSpecification",
    });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
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
            rows={4}
            limit={256}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
}
