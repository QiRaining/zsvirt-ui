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
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type React from "react";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateHost } from "../../../gql/host.gql";
import { createUpdateHostSchema, type UpdateHostFormValues } from "./schema";

const Action: React.FC<IActionWrapperProps<IHost>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateHostFormValues>(
    () => ({
      name: selectedList?.[0]?.name ?? "",
      description: selectedList?.[0]?.description ?? "",
    }),
    [selectedList],
  );
  const formSchema = useMemo(
    () => createUpdateHostSchema(intl, selectedList?.[0]?.name),
    [intl, selectedList],
  );
  const form = useForm<UpdateHostFormValues>({
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

  const onOk = async (values: UpdateHostFormValues) => {
    if (selectedList?.length) {
      const {
        name: oldName,
        description: oldDescription,
        uuid,
      } = selectedList[0];
      const { name: newName, description: newDescription } = values;
      const params: any = { uuid };
      let isEditor = false;
      if (oldName !== newName) {
        params.name = newName;
        isEditor = true;
      }
      if (oldDescription !== newDescription) {
        params.description = newDescription;
        isEditor = true;
      }
      if (isEditor) {
        doAction({
          mutation: updateHost,
          payload: {
            ...params,
          },
          name: intl.formatMessage({
            id: "edit.host",
            defaultMessage: "Edit Host",
          }),
          total: selectedList.length,
          onFinish: () => {
            refetch?.();
          },
          type: "HostVO",
        });
      }
    }
    setVisible(false);
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "host.modal.title.confirm.edit.host",
        defaultMessage: "Edit Name and Description",
      })}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({
              id: "host.name",
              defaultMessage: "Name",
            })}
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
            rows={4}
            limit={2000}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
