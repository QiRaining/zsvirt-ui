import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField } from "@zstack/form";
import { updateGroup } from "@zstack/virtualization-resource/src/gql/vm-directory.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { VMGroupDirectory } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createDirectoryUpdateSchema } from "./schema";
import type { DirectoryUpdateFormValues } from "./schema";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: VMGroupDirectory[];
}

const UpdateModal: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const { uuid, name } = selectedList?.[0] ?? {};
  const intl = useIntl();
  const doAction = useAction();
  const formSchema = useMemo(() => createDirectoryUpdateSchema(intl), [intl]);

  const initialValues = useMemo(() => {
    return {
      name: name ?? "",
    };
  }, [name]);

  const form = useForm<DirectoryUpdateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(initialValues);
    }
  }, [form, initialValues, visible]);

  const onOk = async (values: DirectoryUpdateFormValues) => {
    doAction({
      mutation: updateGroup,
      payload: {
        name: values.name,
        uuid,
      },
      type: "DirectoryGroup",
      name: intl.formatMessage({
        id: "modify.group.name",
        defaultMessage: "Edit Name",
      }),
      total: 1,
      onFinish: () => {
        setVisible(false);
      },
    });
  };

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const nameError = form.getFieldState("name").error;
          throw {
            errorFields: [
              {
                name: ["name"],
                errors: nameError?.message ? [nameError.message] : [],
              },
            ],
          };
        }

        return form.getValues();
      },
      resetFields: () => {
        form.reset(initialValues);
      },
    }),
    [form, initialValues],
  );

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "zsv.modify.group.name",
        defaultMessage: "Edit Name",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="name"
          label={intl.formatMessage({
            id: "name",
            defaultMessage: "Name",
          })}
          required
          size="m"
        />
      </Form>
    </DialogForm>
  );
};

export default UpdateModal;
