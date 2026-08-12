import { gql, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { SelectField, useDialogHookFormAdapter } from "@zstack/form";
import { generateMdevDevice } from "@zstack/virtualization-resource/src/gql/vgpu-device.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IQuery, IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, MdevDeviceSpecQueryType } from "@zstack/zsphere-types";
import type {
  PciDevice as IPciDevice,
  VGpuDeviceSpec as IVGpuDeviceSpec,
  VGpuDeviceSpecList as IVGpuDeviceSpecList,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createGpuDeviceGenerateMdevSchema,
  type GpuDeviceGenerateMdevFormValues,
} from "./schema";

const queryGql = gql`
  query mdevDeviceSpecList(
    $conditions: [Condition!]!
    $type: MdevDeviceSpecQueryType
  ) {
    mdevDeviceSpecList(conditions: $conditions, type: $type) {
      list {
        uuid
        name
      }
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPciDevice>> = ({
  visible,
  selectedList,
  setSelectedList,
  setVisible,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [vgpuDeviceSpecList, setVgpuDeviceSpecList] = useState<
    Array<IVGpuDeviceSpec>
  >([]);
  const mdevSpecUuidList = useMemo(
    () => selectedList?.[0]?.mdevSpecRefs?.map((item) => item.mdevSpecUuid),
    [selectedList],
  );

  const { data } = useQuery<
    { mdevDeviceSpecList: IVGpuDeviceSpecList },
    IQuery
  >(queryGql, {
    variables: {
      type: MdevDeviceSpecQueryType.GetMdevDeviceCandidatesForGenerate,
      conditions: [
        {
          key: "uuid",
          op: Op.in,
          values: mdevSpecUuidList,
        },
      ],
    },
  });
  useEffect(() => {
    const list = data?.mdevDeviceSpecList?.list || [];
    setVgpuDeviceSpecList(list);
  }, [data]);

  const defaultValues = useMemo<GpuDeviceGenerateMdevFormValues>(() => {
    const value: GpuDeviceGenerateMdevFormValues = {
      mdevSpecUuid: "",
    };
    if (selectedList?.length) {
      value.mdevSpecUuid =
        selectedList?.[0]?.mdevSpecRefs?.[0]?.mdevSpecUuid ?? "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(() => createGpuDeviceGenerateMdevSchema(), []);
  const form = useForm<GpuDeviceGenerateMdevFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, defaultValues, form]);

  const specOptions = useMemo(
    () =>
      vgpuDeviceSpecList?.map((item: IVGpuDeviceSpec) => ({
        label: item.name,
        value: item.uuid,
      })) ?? [],
    [vgpuDeviceSpecList],
  );

  const onOk = (values: GpuDeviceGenerateMdevFormValues) => {
    const payload = {
      ...values,
      pciDeviceUuid: selectedList[0].uuid,
    };
    doAction({
      mutation: generateMdevDevice,
      payload,
      name: intl.formatMessage({
        id: "pci.device.mdev.generate",
        defaultMessage: "Virtualize",
      }),
      total: selectedList.length,
      type: "PciDevice",
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
      title={intl.formatMessage({
        id: "pci.device.mdev.generate",
        defaultMessage: "Virtualize",
      })}
      alertMessage={intl.formatMessage({
        id: "pci.device.sriov.generate.alert.message",
        defaultMessage: "Physical NVIDIA GPUs will be virtualized based on the specified specification.",
      })}
      alertType="info"
    >
      <Form {...form}>
        <SelectField
          form={form}
          name="mdevSpecUuid"
          label={intl.formatMessage({
            id: "gpuDeviceSpec",
            defaultMessage: "GPU Specification",
          })}
          options={specOptions}
          className="w-[380px]"
          getSelectPortalContainer={(node) =>
            node.closest('[role="dialog"]') as HTMLElement | null
          }
          selectContentProps={{
            align: "start",
            avoidCollisions: false,
            className: "w-[380px]",
            hideScrollButtons: true,
            side: "bottom",
            sideOffset: 4,
          }}
          selectViewportProps={{
            className: "h-auto max-h-60 overflow-y-auto",
          }}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
