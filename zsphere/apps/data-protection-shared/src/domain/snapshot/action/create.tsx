import { gql, useLazyQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Tooltip,
} from "@zstack/design";
import {
  FieldStack,
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SnapshotType } from "@zstack/zsphere-types";
import type {
  CreateVolumeSnapshotPayload,
  VmInstance as IVM,
  VolumeSnapshot as IVolumeSnapshot,
  VolumeSnapshotGroup as IVolumeSnapshotGroup,
} from "@zstack/zsphere-types/graphql";
import { isVhostStorage, isZbsStorage } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createSnapshotCreateSchema,
  type SnapshotCreateFormValues,
} from "./schema";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    defaultChecked?: boolean;
  }
>(({ checked, onChange, label, defaultChecked, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

const CREATE_VOLUME_SNAPSHOT = gql`
  mutation createVolumeSnapshot($input: CreateVolumeSnapshotInput!) {
    createVolumeSnapshot(input: $input) {
      actionId
    }
  }
`;

const QUERY_VM_EXTERNAL_DEVICE_LIST = gql`
  query vmExternalDevice($uuid: String!) {
    vmExternalDevice(uuid: $uuid) {
      lun
      usb
      gpu
      vgpu
      pci
    }
  }
`;
type IProps = IActionWrapperProps<IVolumeSnapshot | IVolumeSnapshotGroup | IVM>;

const CreateAction: React.FC<IProps> = ({
  visible,
  setVisible,
  // refetch,
  source = {},
  selectedList,
}) => {
  const intl = useIntl();

  const doAction = useAction();
  const resourceName = useMemo(() => {
    let name = selectedList?.[0]?.name || source?.name || "";

    const { resourceType = "", snapshotType = "" } = source;
    if (snapshotType && snapshotType === SnapshotType.Group) {
      name = source?.group?.vmName;
    }
    if (resourceType === "vm") {
      name = source?.title;
    }

    return name;
  }, [selectedList, source]);
  const current: any = selectedList[0] ?? source;

  const isVmRunning: boolean = current?.state === "Running";
  const createDefaultValues = useCallback((): SnapshotCreateFormValues => {
    //假如vm名称过长，会导致snapshot名称超出限制。
    return {
      name: `${resourceName.substr(0, 44)}-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
      description: "",
      withMemory: false,
    };
  }, [resourceName]);
  const [defaultValues, setDefaultValues] =
    useState<SnapshotCreateFormValues>(createDefaultValues);
  const formSchema = useMemo(() => createSnapshotCreateSchema(intl), [intl]);
  const form = useForm<SnapshotCreateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      const nextDefaultValues = createDefaultValues();
      setDefaultValues(nextDefaultValues);
      form.reset(nextDefaultValues);
    }
  }, [createDefaultValues, form, visible]);

  const _actionName = intl.formatMessage({
    id: "create.vmSnapshot",
    defaultMessage: "Create VM Snapshot",
  });

  const onOk = (values: SnapshotCreateFormValues) => {
    //多入口的情况 (云主机更多操作、快照树、云主机详情)
    const volumeUuid =
      source?.rootVolumeUuid ||
      source?.attr?.rootVolumeUuid ||
      (selectedList?.[0] as IVM)?.rootVolumeUuid;

    const { name, description, withMemory } = values;

    const payload: CreateVolumeSnapshotPayload = {
      volumeUuid,
      name,
      description,
      type: SnapshotType.Group,
      withMemory,
    };

    doAction({
      mutation: CREATE_VOLUME_SNAPSHOT,
      payload,
      name: _actionName,
      total: 1,
      type: "snapshotList",
      onFinish: () => {
        // refetch?.()
        setVisible(false);
      },
    });
  };

  const onCancel = () => {
    form.reset(defaultValues);
    setVisible(false);
  };
  const [getVmExternalDevices, { data }] = useLazyQuery(
    QUERY_VM_EXTERNAL_DEVICE_LIST,
    {
      fetchPolicy: "no-cache",
    },
  );
  const currentVmUuid = current.uuid ?? current?.key;
  const [externalDeviceVmUuid, setExternalDeviceVmUuid] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (visible) {
      setExternalDeviceVmUuid(undefined);
      getVmExternalDevices({
        variables: {
          uuid: currentVmUuid,
        },
      }).then(() => {
        setExternalDeviceVmUuid(currentVmUuid);
      });
    }
  }, [currentVmUuid, getVmExternalDevices, visible]);

  const isVmExternalDevice: boolean = Object.values(
    externalDeviceVmUuid === currentVmUuid ? data?.vmExternalDevice || [] : [],
  ).some((item: any) => item > 0);

  const hasVolumeInDisabledPrimaryStorage: boolean = useMemo(() => {
    const isDistributedStorage = (storage: any) =>
      storage?.type === "Ceph" ||
      isVhostStorage(storage) ||
      isZbsStorage(storage);

    //检查主存储类型和数据盘是否是分布式存储
    return (
      isDistributedStorage(current?.primaryStorage) ||
      current?.allVolumes?.some((volume: any) =>
        isDistributedStorage(volume?.primaryStorage),
      ) ||
      false
    );
  }, [current?.primaryStorage, current?.allVolumes]);

  const memoryTooltip = useMemo(
    () => (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "snapshot.field.memory.tooltip.has.block",
          defaultMessage: `### Memory Snapshot

A memory snapshot captures the real-time state of a virtual machine.

- Prerequisites:

  1. The virtual machine must be in the running state.
  2. Any attached peripheral devices must be detached from the virtual machine.
  3. You cannot take memory snapshots for virtual machines using distributed storage.

- To ensure memory consistency, the virtual machine will be briefly paused during memory snapshot creation.`,
        })}
      </ReactMarkdown>
    ),
    [intl],
  );
  const createMemoryTips = React.useMemo(() => {
    return intl.formatMessage({
      id: "snapShot.modal.create.field.snapShotType.group.vmMemory",
      defaultMessage: "Also create memory snapshot",
    });
  }, [intl]);

  const memoryDisabled =
    !isVmRunning || hasVolumeInDisabledPrimaryStorage || isVmExternalDevice;

  useEffect(() => {
    if (memoryDisabled) {
      form.setValue("withMemory", false);
    }
  }, [form, memoryDisabled]);

  const handleMemoryChange = (checked: boolean) => {
    form.setValue("withMemory", checked, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const renderMemoryCheckbox = (
    checked: boolean,
    onChange: (checked: boolean) => void,
  ) => {
    if (!isVmRunning) {
      return (
        <Tooltip
          title={intl.formatMessage({
            id: "snapShot.modal.create.field.snapShotType.group.vmRunning",
            defaultMessage: "Ensure the VM is running.",
          })}
        >
          <FormCheckbox
            checked={false}
            onChange={handleMemoryChange}
            disabled
            label={createMemoryTips}
          />
        </Tooltip>
      );
    }
    if (hasVolumeInDisabledPrimaryStorage) {
      return (
        <Tooltip
          title={intl.formatMessage({
            id: "snapshot.memory.unsupported.primaryStorageType",
            defaultMessage: "You cannot take memory snapshots for virtual machines using distributed storage.",
          })}
        >
          <FormCheckbox
            checked={false}
            onChange={handleMemoryChange}
            disabled
            label={createMemoryTips}
          />
        </Tooltip>
      );
    }
    if (isVmExternalDevice) {
      return (
        <Tooltip
          title={intl.formatMessage({
            id: "snapShot.modal.create.field.snapShotType.group.pci.on.vm",
            defaultMessage: "The VM instance has a peripheral device attached. To create a memory snapshot, detach the peripheral device first.",
          })}
        >
          <FormCheckbox
            checked={false}
            onChange={handleMemoryChange}
            disabled
            label={createMemoryTips}
          />
        </Tooltip>
      );
    }
    return (
      <FormCheckbox
        checked={checked}
        onChange={(value) => {
          onChange(value);
          handleMemoryChange(value);
        }}
        label={createMemoryTips}
      />
    );
  };
  return (
    <DialogForm
      title={_actionName}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      onCancel={onCancel}
      resourceName={resourceName}
    >
      <Form {...form}>
        <FieldStack>
          {/* 快照name特殊处理：  */}
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
          <FormField
            control={form.control}
            name="withMemory"
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel className="mt-[5px] flex" info={memoryTooltip}>
                  {intl.formatMessage({
                    id: "snapshot.memory",
                    defaultMessage: "Memory Snapshot",
                  })}
                </FormLabel>
                <FormControl>
                  {renderMemoryCheckbox(field.value, field.onChange)}
                </FormControl>
              </FormItem>
            )}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};
export default CreateAction;
