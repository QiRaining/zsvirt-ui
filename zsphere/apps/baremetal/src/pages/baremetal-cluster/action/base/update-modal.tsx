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
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createBaremetalClusterUpdateSchema,
  type BaremetalClusterUpdateFormValues,
} from "./schema";

const UPDATE_CLUSTER = gql`
  mutation updateCluster($input: UpdateClusterInput!) {
    updateCluster(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICluster>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<BaremetalClusterUpdateFormValues>(() => {
    const value: BaremetalClusterUpdateFormValues = {
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
    () => createBaremetalClusterUpdateSchema(intl),
    [intl],
  );
  const form = useForm<BaremetalClusterUpdateFormValues>({
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

  const onOk = async (values: BaremetalClusterUpdateFormValues) => {
    setVisible(false);
    if (selectedList?.length) {
      doAction({
        mutation: UPDATE_CLUSTER,
        payload: {
          ...values,
          uuid: selectedList[0].uuid,
        },
        name: intl.formatMessage({
          id: "change.baremetalCluster",
          defaultMessage: "Edit Baremetal Cluster",
        }),
        total: 1,
        onFinish: () => {
          setSelectedList?.([]);
          refetch?.();
        },
      });
    }
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      resourceName={formatResourceName(selectedList, intl)}
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
            labelTooltip={intl.formatMessage({
              id: "global.field.name.hover",
              defaultMessage:
                "Names must be 1-128 characters in length and can contain Chinese characters, letters, digits, hyphens (\"-\"), underscores (\"_\"), periods (\".\"), parenthesis (\"()\"), colons (\":\"), and plus signs (\"+\").",
            })}
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
            size="m"
            limit={256}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
