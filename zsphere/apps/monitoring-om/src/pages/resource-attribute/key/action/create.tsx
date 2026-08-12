import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputField,
  SelectField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { supportedResourceTypes } from "../../constant";
import ConstraintFormList from "../../constraint/components/constraint-form-list";
import { useGetResourceTypeLabel } from "../../hook";
import {
  createCreateResourceAttributeKeySchema,
  type CreateResourceAttributeKeyFormValues,
} from "./schema";

const createResourceAttributeKey = gql`
  mutation createResourceAttributeKey(
    $input: CreateResourceAttributeKeyInput!
  ) {
    createResourceAttributeKey(input: $input) {
      actionId
    }
  }
`;

export default function Create({
  visible,
  setVisible,
}: IActionWrapperProps<ResourceAttributeKey>) {
  const intl = useIntl();
  const doAction = useAction();
  const getResourceTypeLabel = useGetResourceTypeLabel();
  const defaultValues = useMemo<CreateResourceAttributeKeyFormValues>(
    () => ({
      resourceType: "ResourceAttributeKeyVO",
      name: "",
      description: "",
      options: [{ value: "" }],
    }),
    [],
  );
  const formSchema = useMemo(
    () => createCreateResourceAttributeKeySchema(intl),
    [intl],
  );
  const form = useForm<CreateResourceAttributeKeyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const resourceTypeOptions = useMemo(() => {
    const globalOption = {
      label: intl.formatMessage({
        id: "resource.attribute.key.global",
        defaultMessage: "Global",
      }),
      value: "ResourceAttributeKeyVO",
    };
    const resourceOptions = supportedResourceTypes
      .map((item) => getResourceTypeLabel(item))
      .filter(Boolean);

    return [globalOption, ...resourceOptions];
  }, [getResourceTypeLabel, intl]);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: CreateResourceAttributeKeyFormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      resourceTypes:
        values.resourceType !== "ResourceAttributeKeyVO"
          ? [values.resourceType]
          : null,
      constraints: values.options
        ?.filter((item) => !!item.value)
        .map((item) => ({
          type: "enum",
          parameter: item.value,
        })),
    };

    doAction({
      mutation: createResourceAttributeKey,
      payload,
      name: intl.formatMessage({
        id: "create.resource.attribute.key",
        defaultMessage: "New Custom Attribute",
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
        id: "create.resource.attribute.key",
        defaultMessage: "New Custom Attribute",
      })}
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <SelectField
            form={form}
            name="resourceType"
            label={intl.formatMessage({ id: "type", defaultMessage: "Type" })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "resource.attribute.key.create.field.type.tooltip",
                  defaultMessage:
                    "### Type\n\nSupports adding custom attributes to the following resources: Global, Virtual Machine, Host, Data Storage, Distributed Switch, Distributed Port Group, and Bare Metal Instance.\n\nAfter creating a custom attribute, the attribute key will be automatically associated with all resources of the selected type. You can then configure the attribute value as needed for the target resources.",
                })}
              </ReactMarkdown>
            }
            options={resourceTypeOptions}
            size="s"
          />
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
          <ConstraintFormList form={form} />
        </FieldStack>
      </Form>
    </DialogForm>
  );
}
