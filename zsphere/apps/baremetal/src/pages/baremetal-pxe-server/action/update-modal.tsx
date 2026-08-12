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
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { InstanceOffering as IInstanceOffering } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createBaremetalPxeServerUpdateSchema,
  type BaremetalPxeServerUpdateFormValues,
} from "./schema";

const updateBaremetalPxeServer = gql`
  mutation ($input: UpdateBaremetalPxeServerInput!) {
    updateBaremetalPxeServer(input: $input) {
      actionId
    }
  }
`;
const Action: React.FC<IActionWrapperProps<IInstanceOffering>> = ({
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const defaultValues = useMemo<BaremetalPxeServerUpdateFormValues>(() => {
    const value: BaremetalPxeServerUpdateFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      value.name = selectedList[0].name;
      value.description = selectedList[0].description || "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createBaremetalPxeServerUpdateSchema(intl),
    [intl],
  );
  const form = useForm<BaremetalPxeServerUpdateFormValues>({
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

  const doAction = useAction();
  const onOk = async (values: BaremetalPxeServerUpdateFormValues) => {
    setVisible(false);
    const payload = {
      ...values,
      uuid: selectedList?.[0]?.uuid,
    };
    doAction({
      mutation: updateBaremetalPxeServer,
      payload,
      name: intl.formatMessage({
        id: "baremetal.pxeservice.action.update",
        defaultMessage: "Edit Deployment Server",
      }),
      total: 1,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "edit.nameAndDescription",
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
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
