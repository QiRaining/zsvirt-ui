import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { updateL2Network } from "@zstack/virtualization-resource/src/gql/l2-network.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { formatDoActionParams } from "../utils";
import {
  createUpdateL2NetworkSchema,
  type UpdateL2NetworkFormValues,
} from "./schema";

import styles from "./style.module.less";

const Action: React.FC<IActionWrapperProps<IL2Network>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<UpdateL2NetworkFormValues>(
    () => ({
      name: selectedList?.[0]?.name ?? "",
      description: selectedList?.[0]?.description ?? "",
    }),
    [selectedList],
  );
  const formSchema = useMemo(
    () => createUpdateL2NetworkSchema(intl, selectedList?.[0]?.name),
    [intl, selectedList],
  );
  const form = useForm<UpdateL2NetworkFormValues>({
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
  const onOk = async (values: UpdateL2NetworkFormValues) => {
    setVisible(false);
    if (selectedList?.length) {
      doAction(
        formatDoActionParams(
          {
            payload: {
              ...values,
              uuid: selectedList?.[0].uuid,
            },
            action: {
              name: intl.formatMessage({
                id: "edit.l2Network",
                defaultMessage: "Edit Name and Description",
              }),
              total: 1,
            },

            onFinish: () => {
              refetch?.();
              setSelectedList?.([]);
            },
          },
          updateL2Network,
        ),
      );
    }
  };

  return (
    <DialogForm
      visible={visible}
      form={dialogForm}
      onOk={onOk}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "edit.l2Network",
        defaultMessage: "Edit Name and Description",
      })}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            required
            className={styles.baseFormItem}
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "l2Network.description",
              defaultMessage: "Description",
            })}
            rows={3}
            maxLength={2000}
            className={styles.baseFormItem}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
