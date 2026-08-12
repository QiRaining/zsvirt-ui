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
import { SnapshotType } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  VolumeSnapshot as IVolumeSnapshot,
  VolumeSnapshotGroup as IVolumeSnapshotGroup,
} from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import type React from "react";
import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createBatchSnapshotSchema, type BatchSnapshotValues } from "./schema";

const batchCreateVolumeSnapshot = gql`
  mutation batchCreateVolumeSnapshot($input: BatchCreateVolumeSnapshotInput!) {
    batchCreateVolumeSnapshot(input: $input) {
      actionId
    }
  }
`;

type IProps = IActionWrapperProps<IVolumeSnapshot | IVolumeSnapshotGroup | IVM>;

const BatchCreateSnapshotAction: React.FC<IProps> = ({
  visible,
  setVisible,
  // refetch,
  source: _source = {},
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const defaultValues = useMemo<BatchSnapshotValues>(
    () => ({
      name: `快照-${currentTime}`,
      description: "",
    }),
    [currentTime],
  );
  const formSchema = useMemo(() => createBatchSnapshotSchema(intl), [intl]);
  const form = useForm<BatchSnapshotValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const [resourceNum, setResourceNum] = useState(
    `${String(selectedList?.length)}个对象`,
  );

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
      setResourceNum(`${String(selectedList?.length)}个对象`);
    }
  }, [defaultValues, form, selectedList, visible]);

  const _actionName = intl.formatMessage({
    id: "batch.create.vmSnapshot",
    defaultMessage: "Create a virtual machine snapshot.",
  });

  const onOk = (values: BatchSnapshotValues) => {
    const { name, description } = values;

    const payload = selectedList.map((t: any) => {
      return {
        volumeUuid: t.rootVolumeUuid,
        name,
        description,
        type: SnapshotType.Group,
      };
    });
    doAction({
      mutation: batchCreateVolumeSnapshot,
      payload,
      name: _actionName,
      total: selectedList.length || 1,
      type: "snapshotList",
      onFinish: () => {
        // refetch?.()
        setVisible(false);
        setSelectedList?.([]);
      },
    });
  };

  const onCancel = () => {
    form.reset(defaultValues);
    setVisible(false);
  };

  return (
    <DialogForm
      title={_actionName}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      onCancel={onCancel}
      alertType="info"
      alertMessage={intl.formatMessage({
        id: "batch.create.snapshot.alertmessage",
        defaultMessage: "The snapshot of the virtual machine created will use a unified name for simplicity.",
      })}
      key={genUuid()}
      resourceName={resourceNum}
    >
      <Form {...form}>
        <FieldStack>
          {/* 快照name特殊处理：  */}
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
            limit={2000}
            rows={4}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default BatchCreateSnapshotAction;
