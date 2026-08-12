import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createResourceAttributeConstraintsSchema,
  type ResourceAttributeConstraintsFormValues,
} from "../../key/action/schema";
import ConstraintFormList from "../components/constraint-form-list";

const updateResourceAttributeKey = gql`
  mutation updateResourceAttributeKey(
    $input: UpdateResourceAttributeKeyInput!
  ) {
    updateResourceAttributeKey(input: $input) {
      actionId
    }
  }
`;

export default function Create({
  visible,
  setVisible,
  selectedList,
  source,
}: IActionWrapperProps<ResourceAttributeKey>) {
  const intl = useIntl();
  const doAction = useAction();
  const current =
    source?.__typename === "ResourceAttributeKey"
      ? (source as ResourceAttributeKey)
      : selectedList[0];
  const defaultValues = useMemo<ResourceAttributeConstraintsFormValues>(
    () => ({ options: [{ value: "" }] }),
    [],
  );
  const formSchema = useMemo(
    () => createResourceAttributeConstraintsSchema(intl, current),
    [current, intl],
  );
  const form = useForm<ResourceAttributeConstraintsFormValues>({
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

  const onOk = async (values: ResourceAttributeConstraintsFormValues) => {
    const createConstraints = values.options
      ?.filter((item) => !!item.value)
      .map((item) => ({
        type: "enum",
        parameter: item.value,
      }));

    if (!createConstraints?.length) {
      return;
    }

    const payload = {
      uuid: current?.uuid ?? "",
      createConstraints,
    };

    doAction({
      mutation: updateResourceAttributeKey,
      payload,
      name: intl.formatMessage({
        id: "add.resource.attribute.value",
        defaultMessage: "Add Attribute Value",
      }),
      total: 1,
      type: "ResourceAttributeKey",
      onFinish: () => {
        bus.emit("action:refetch:ResourceAttributeConstraint");
      },
    });
  };

  return (
    <DialogForm
      widthClassName="w-150"
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "add.resource.attribute.value",
        defaultMessage: "Add Attribute Value",
      })}
      onOk={onOk}
      resourceName={current?.name}
    >
      <Form {...form}>
        <ConstraintFormList form={form} required source={current} />
      </Form>
    </DialogForm>
  );
}
