import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem, FormLabel, Text } from "@zstack/design";
import {
  FieldStack,
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ResourceAttributeKey,
  UpdateResourceAttributeKeyPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useGetResourceTypeLabel } from "../../hook";
import {
  createEditResourceAttributeKeySchema,
  type EditResourceAttributeKeyFormValues,
} from "./schema";

const updateResourceAttributeKey = gql`
  mutation updateResourceAttributeKey(
    $input: UpdateResourceAttributeKeyInput!
  ) {
    updateResourceAttributeKey(input: $input) {
      actionId
    }
  }
`;

export default function Edit({
  selectedList,
  visible,
  setVisible,
}: IActionWrapperProps<ResourceAttributeKey>) {
  const intl = useIntl();
  const doAction = useAction();
  const getResourceTypeLabel = useGetResourceTypeLabel();

  const current = selectedList?.[0];
  const defaultValues = useMemo<EditResourceAttributeKeyFormValues>(
    () => ({
      name: current?.name ?? "",
      description: current?.description ?? "",
    }),
    [current],
  );
  const formSchema = useMemo(
    () => createEditResourceAttributeKeySchema(intl, current?.name),
    [current?.name, intl],
  );
  const form = useForm<EditResourceAttributeKeyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const originalResourceType = useMemo(() => {
    if (!current?.resourceTypes?.length) {
      return null;
    }
    if (current.resourceTypes.includes("ResourceAttributeKeyVO")) {
      return intl.formatMessage({
        id: "resource.attribute.key.global",
        defaultMessage: "Global",
      });
    }
    return getResourceTypeLabel(current.resourceTypes[0] ?? "").label;
  }, [current, getResourceTypeLabel, intl]);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: EditResourceAttributeKeyFormValues) => {
    const currentDescription = current?.description ?? "";
    if (
      !current?.uuid ||
      (values.name === current.name &&
        values.description === currentDescription)
    ) {
      return;
    }

    const payload: UpdateResourceAttributeKeyPayload = {
      uuid: current.uuid,
      name: values.name,
      description: values.description,
    };

    doAction({
      mutation: updateResourceAttributeKey,
      payload,
      name: intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      total: 1,
      type: "ResourceAttributeKey",
    });
  };

  return (
    <DialogForm
      widthClassName="w-150"
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      })}
      onOk={onOk}
      resourceName={current?.name}
    >
      <Form {...form}>
        <FieldStack>
          <FormItem className="flex min-h-8 flex-row gap-2">
            <FormLabel
              className="mt-[5px] flex"
              info={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "resource.attribute.key.create.field.type.tooltip",
                    defaultMessage:
                      "### Type\n\nSupports adding custom attributes to the following resources: Global, Virtual Machine, Host, Data Storage, Distributed Switch, Distributed Port Group, and Bare Metal Instance.\n\nAfter creating a custom attribute, the attribute key will be automatically associated with all resources of the selected type. You can then configure the attribute value as needed for the target resources.",
                  })}
                </ReactMarkdown>
              }
            >
              {intl.formatMessage({ id: "type", defaultMessage: "Type" })}
            </FormLabel>
            <div className="flex min-h-8 items-center">
              <Text>{originalResourceType}</Text>
            </div>
          </FormItem>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({
              id: "resource.attribute.key",
              defaultMessage: "Attribute Key",
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
            limit={256}
            rows={4}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
}
