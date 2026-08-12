import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { updateVmTemplate } from "@zstack/virtualization-resource/src/gql/vm-template.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import type React from "react";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateVmTemplateSchema,
  type UpdateVmTemplateValues,
} from "./schema";

const UpdateModal: React.FC<IActionWrapperProps<IZone>> = ({
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateVmTemplateValues>(
    () => ({
      name: selectedList?.[0]?.name ?? "",
      description: selectedList?.[0]?.description || "",
    }),
    [selectedList],
  );
  const formSchema = useMemo(
    () => createUpdateVmTemplateSchema(intl, selectedList?.[0]?.name),
    [intl, selectedList],
  );
  const form = useForm<UpdateVmTemplateValues>({
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

  const onOk = async (values: UpdateVmTemplateValues) => {
    doAction({
      mutation: updateVmTemplate,
      payload: {
        ...values,
        uuid: selectedList?.[0].uuid,
      },
      name: intl.formatMessage({
        id: "vm.template.action.edit",
        defaultMessage: "Edit VM Template",
      }),
      total: selectedList.length,
      type: "VmTemplate",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      resourceName={selectedList?.[0]?.name || ""}
      onOk={onOk}
      title={intl.formatMessage({
        id: "vm.template.action.edit.modal.title",
        defaultMessage: "Edit Name and Description",
      })}
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
              id: "description",
              defaultMessage: "Description",
            })}
            limit={2000}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default UpdateModal;
