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
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import { createZoneCreateSchema, type ZoneCreateFormValues } from "./schema";

const CREATE_ZONE_MUTATION = gql`
  mutation createZone($input: CreateZoneInput!) {
    createZone(input: $input) {
      actionId
    }
  }
`;

export const ZoneFormItems = ({
  form,
}: {
  form: UseFormReturn<ZoneCreateFormValues>;
}) => {
  const intl = useIntl();

  return (
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
        maxLength={2000}
      />
    </FieldStack>
  );
};

const Action: React.FC<IActionWrapperProps<IZone>> = ({
  visible,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<ZoneCreateFormValues>(
    () => ({
      name: "",
      description: "",
    }),
    [],
  );
  const formSchema = useMemo(() => createZoneCreateSchema(intl), [intl]);
  const form = useForm<ZoneCreateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = async (values: ZoneCreateFormValues) => {
    doAction({
      mutation: CREATE_ZONE_MUTATION,
      payload: {
        ...values,
      },
      name: intl.formatMessage({
        id: "create.zone",
        defaultMessage: "New Data Center",
      }),
      total: 1,
      type: "Zone",
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
      onOk={onOk}
      title={intl.formatMessage({
        id: "create.zone",
        defaultMessage: "New Data Center",
      })}
    >
      <Form {...form}>
        <ZoneFormItems form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
