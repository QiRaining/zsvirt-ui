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
import type { L3Network } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type React from "react";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateL3NetworkSchema,
  type UpdateL3NetworkValues,
} from "./schema";

const updateL3Network = gql`
  mutation updateL3Network($input: UpdateL3NetworkInput!) {
    updateL3Network(input: $input) {
      actionId
    }
  }
`;

const UpdateModal: React.FC<IActionWrapperProps<L3Network>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateL3NetworkValues>(() => {
    const { name, description } = selectedList?.[0] ?? {};
    return {
      name: name ?? "",
      description: description ?? "",
    };
  }, [selectedList]);
  const formSchema = useMemo(
    () => createUpdateL3NetworkSchema(intl, selectedList?.[0]?.name),
    [intl, selectedList],
  );
  const form = useForm<UpdateL3NetworkValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const title = useMemo(() => {
    const textMap = {
      vpc: intl.formatMessage({
        id: "edit.vpcNetwork",
        defaultMessage: "Edit VPC Network",
      }),
      public: intl.formatMessage({
        id: "edit.publicNetwork",
        defaultMessage: "Edit Public Network",
      }),
      flow: intl.formatMessage({
        id: "edit.flowNetwork",
        defaultMessage: "Edit Flow Network",
      }),
      manage: intl.formatMessage({
        id: "edit.manageNetwork",
        defaultMessage: "Edit Management Network",
      }),
      flat: intl.formatMessage({
        id: "edit.flatNetwork",
        defaultMessage: "Edit Name and Description",
      }),
    };
    const { networkType } = selectedList?.[0] ?? {};
    const typeMsg = textMap[networkType as "vpc"];
    return typeMsg;
  }, [selectedList, intl]);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: UpdateL3NetworkValues) => {
    doAction({
      mutation: updateL3Network,
      payload: {
        name: values.name,
        description: values.description,
        uuid: selectedList?.[0]?.uuid,
      },
      name: title,
      total: 1,
      onFinish: () => {
        setVisible(false);
      },
    });
  };

  return (
    <DialogForm
      title={title}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <FieldStack>
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
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "description",
              defaultMessage: "Description",
            })}
            rows={3}
            limit={2000}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default UpdateModal;
