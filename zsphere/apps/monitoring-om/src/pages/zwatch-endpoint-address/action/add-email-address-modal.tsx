import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@zstack/design";
import { FieldStack, useDialogHookFormAdapter } from "@zstack/form";
import { Icon } from "@zstack/icon";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  EndPointEmailAddress as IEndPointEmailAddress,
  AddEmailAddressToEndpointPayload as IAddEmailAddressToEndpointPayload,
  BasicEndPoint,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createAddEmailAddressSchema,
  type AddEmailAddressFormValues,
} from "./schema";

import styles from "./style.module.less";

export interface IProps {
  currentEndpoint: BasicEndPoint;
}

const defaultValues: AddEmailAddressFormValues = {
  emailAddress: [{ value: "" }],
};

const AddEmailAddressAction: React.FC<
  IActionWrapperProps<IEndPointEmailAddress> & IProps
> = ({ visible, setVisible, currentEndpoint }) => {
  const intl = useIntl();
  const doAction = useAction();
  const formSchema = useMemo(() => createAddEmailAddressSchema(intl), [intl]);
  const form = useForm<AddEmailAddressFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddress",
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [form, visible]);

  const addEmailAddress = gql`
    mutation addEmailAddress($input: AddEmailAddressToEndpointInput!) {
      addEmailAddress(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async (values: AddEmailAddressFormValues) => {
    const payload: IAddEmailAddressToEndpointPayload[] =
      values.emailAddress.map(({ value: emailAddress }) => {
        return {
          emailAddress,
          endpointUuid: currentEndpoint?.uuid,
        };
      });
    doAction({
      mutation: addEmailAddress,
      payload,
      name: intl.formatMessage({
        id: "add.email.address",
        defaultMessage: "Add Email Address",
      }),
      total: payload.length,
      type: "EndPointEmailAddress",
      onProgress: () => {},
      onFinish: () => {},
    });
  };

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "add.email.address",
        defaultMessage: "Add Email Address",
      })}
      form={dialogForm}
      onOk={onOk}
      resourceName={currentEndpoint?.name}
    >
      <Form {...form}>
        <FormItem
          className={styles["add-email-container"]}
          data-testid="add-email-address-list"
        >
          <div className="flex flex-row gap-2">
            <FormLabel required className="mt-[5px] flex">
              {intl.formatMessage({
                id: "email.address",
                defaultMessage: "Email Address",
              })}
            </FormLabel>
            <FieldStack className="flex-1">
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`emailAddress.${index}.value`}
                  render={({ field: inputField }) => (
                    <FormItem className="flex flex-row items-start gap-2">
                      <div className="flex flex-col">
                        <FormControl>
                          <Input
                            {...inputField}
                            className={styles["width-320"]}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={fields.length <= 1}
                        onClick={() => remove(index)}
                      >
                        <Icon type="trash" />
                      </Button>
                    </FormItem>
                  )}
                />
              ))}
              {typeof form.formState.errors.emailAddress?.message ===
              "string" ? (
                <div className="text-danger-500 text-sm">
                  {form.formState.errors.emailAddress.message}
                </div>
              ) : null}
              <Button
                type="button"
                variant="link"
                className="w-fit px-0"
                onClick={() => append({ value: "" })}
                icon={<Icon type="plus" />}
              >
                {intl.formatMessage({
                  id: "add.email.address",
                  defaultMessage: "Add Email Address",
                })}
              </Button>
            </FieldStack>
          </div>
        </FormItem>
      </Form>
    </DialogForm>
  );
};

export default AddEmailAddressAction;
