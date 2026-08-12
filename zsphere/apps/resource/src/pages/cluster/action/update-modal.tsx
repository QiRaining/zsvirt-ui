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
  createClusterUpdateSchema,
  type ClusterUpdateFormValues,
} from "./schema";

const updateCluster = gql`
  mutation updateCluster($input: UpdateClusterInput!) {
    updateCluster(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICluster> & { title?: string }> = ({
  refetch,
  title: _title,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const title = _title || intl.formatMessage({ id: "edit.cluster" });

  const defaultValues = useMemo<ClusterUpdateFormValues>(() => {
    const value: ClusterUpdateFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      value.name = selectedList[0].name ?? "";
      value.description = selectedList[0].description ?? "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(() => createClusterUpdateSchema(intl), [intl]);
  const form = useForm<ClusterUpdateFormValues>({
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

  const onOk = async (values: ClusterUpdateFormValues) => {
    doAction({
      mutation: updateCluster,
      payload: {
        ...values,
        uuid: selectedList[0].uuid,
      },
      name: title,
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
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
      title={title}
      resourceName={formatResourceName(selectedList, intl)}
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
            rows={4}
            limit={2000}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
