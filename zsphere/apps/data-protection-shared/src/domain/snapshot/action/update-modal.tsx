import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createSnapshotUpdateSchema,
  type SnapshotUpdateFormValues,
} from "./schema";

const updateVolumeSnapshot = gql`
  mutation updateVolumeSnapshot($input: UpdateVolumeSnapshotInput!) {
    updateVolumeSnapshot(input: $input) {
      actionId
    }
  }
`;

interface IProps extends IActionWrapperProps<any> {
  view: "sub.vm" | "sub.volume";
}

const EditAction: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const current = selectedList?.[0] || {};

  const defaultValues = useMemo<SnapshotUpdateFormValues>(() => {
    return {
      name: current?.group?.name || current?.name || "",
      description: current?.group?.description || current?.description || "",
    };
  }, [current]);
  const formSchema = useMemo(() => createSnapshotUpdateSchema(intl), [intl]);
  const form = useForm<SnapshotUpdateFormValues>({
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

  const onOk = async (values: SnapshotUpdateFormValues) => {
    const { name, description } = values;
    const payload = selectedList.map((item) => {
      return {
        uuid: item?.groupUuid || item?.uuid,
        name,
        description,
        type: item.snapshotType,
      };
    })[0];
    doAction({
      mutation: updateVolumeSnapshot,
      payload,
      name: intl.formatMessage({
        id: "edit.vmSnapshot",
        defaultMessage: "Edit VM Snapshot",
      }),
      total: 1,
      type: "VolumeSnapshotGroup",
      onFinish: () => {
        setVisible(false);
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "virtualization.edit.name.description",
        defaultMessage: "Edit Name and Description",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={current?.group?.name || current?.name}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            name="name"
            size="m"
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "description",
              defaultMessage: "Description",
            })}
            limit={2000}
            rows={4}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default EditAction;
