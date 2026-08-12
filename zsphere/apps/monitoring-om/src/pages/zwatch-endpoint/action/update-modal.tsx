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
import type {
  EndPoint as IEndPoint,
  UpdateEndpointPayload as IUpdateEndpointPayload,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateEndpointSchema,
  type UpdateEndpointFormValues,
} from "./schema";

const UpdateAction: React.FC<IActionWrapperProps<IEndPoint>> = ({
  visible,
  refetch,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateEndpointFormValues>(() => {
    const value: UpdateEndpointFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      value.name = selectedList[0].name;
      value.description = selectedList[0].description || "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(() => createUpdateEndpointSchema(intl), [intl]);
  const form = useForm<UpdateEndpointFormValues>({
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

  const updateSNSApplicationEndpoint = gql`
    mutation updateSNSApplicationEndpoint($input: UpdateEndpointInput!) {
      updateSNSApplicationEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async (values: UpdateEndpointFormValues) => {
    setSelectedList?.([]);

    const payload: IUpdateEndpointPayload = {
      ...values,
      uuid: selectedList?.length ? selectedList[0].uuid : "",
    };

    doAction({
      mutation: updateSNSApplicationEndpoint,
      payload,
      name: intl.formatMessage({
        id: "change.zwatchEndpoint",
        defaultMessage: "Modify Endpoint",
      }),
      total: 1,
      type: "EndPoint",
      onProgress: (result: ITaskResult) => {
        console.log("onProgress:", result);
      },
      onFinish: (result: IActionResult) => {
        console.log("onFinish:", result);
        refetch?.();
      },
    });
  };
  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "",
      })}
      form={dialogForm}
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
};

export default UpdateAction;
