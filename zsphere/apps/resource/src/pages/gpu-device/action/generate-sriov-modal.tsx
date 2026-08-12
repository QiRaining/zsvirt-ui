import { useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  InputNumber,
  Slider,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import {
  generateSriovPciDevices,
  gpuDeviceList as gpuDeviceListGql,
} from "@zstack/virtualization-resource/src/gql/gpu-device.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  PciDevice as IPciDevice,
  GenerateSriovPciDeviceInput as IGenerateSriovPciDeviceInput,
} from "@zstack/zsphere-types/graphql";
import React, { useRef, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createGpuDeviceGenerateSriovSchema,
  type GpuDeviceGenerateSriovFormValues,
} from "./schema";

import styles from "../detail/style.module.less";

const GenerateSriovModal: React.FC<IActionWrapperProps<IPciDevice>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const attachGpuCountRef = useRef<number>();

  const { data: gpuDeviceList } = useQuery(gpuDeviceListGql, {
    variables: {
      conditions: [
        {
          key: "hostUuid",
          op: Op.eq,
          value: selectedList?.[0]?.hostUuid,
        },
      ],
    },
  });
  attachGpuCountRef.current =
    gpuDeviceList?.pciDeviceList?.list?.filter(
      (item: IPciDevice) => item.vendorId === "1002",
    )?.length || 0;

  const maxPartNum = useMemo(() => {
    return selectedList?.[0]?.physicalNicDeviceMaxPartNum ?? 10;
  }, [selectedList]);

  const defaultValues = useMemo<GpuDeviceGenerateSriovFormValues>(() => {
    return {
      virtPartNum: maxPartNum,
    };
  }, [maxPartNum]);

  const formSchema = useMemo(
    () => createGpuDeviceGenerateSriovSchema(maxPartNum),
    [maxPartNum],
  );
  const form = useForm<GpuDeviceGenerateSriovFormValues>({
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

  const middNum: number = Math.round(maxPartNum / 2);

  const onOk = async ({ virtPartNum }: GpuDeviceGenerateSriovFormValues) => {
    const payload: IGenerateSriovPciDeviceInput["payload"] = {
      virtPartNum: Number(virtPartNum),
      pciDeviceUuid: selectedList![0].uuid,
    };
    doAction({
      mutation: generateSriovPciDevices,
      payload,
      type: "PciDevice",
      name: intl.formatMessage({
        id: "pci.device.mdev.generate",
        defaultMessage: "Virtualize",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
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
      alertMessage={
        <>
          {intl.formatMessage({
            id: "pci.device.amd.sriov.generate.alert.message",
            defaultMessage:
              "All AMD GPUs of the host are virtualized based on the selected number of virtual GPUs.",
          })}
          <span className={styles["alert-font"]}>
            {intl.formatMessage(
              {
                id: "pci.device.amd.sriov.generate.count.alert.message",
                defaultMessage: "{count} pGPUs are to be virtualized.",
              },
              {
                count: attachGpuCountRef.current,
              },
            )}
          </span>
        </>
      }
      alertType="warning"
      onOk={onOk}
      title={intl.formatMessage({
        id: "pci.device.mdev.generate",
        defaultMessage: "Virtualize",
      })}
    >
      <Form {...form}>
        <FormField
          control={form.control}
          name="virtPartNum"
          render={({ field }) => {
            const value = typeof field.value === "number" ? field.value : 1;

            return (
              <FormItem>
                <div className="flex justify-center">
                  <div className="w-1/2 pt-3">
                    <FormControl>
                      <Slider
                        min={1}
                        max={maxPartNum}
                        step={1}
                        value={[value]}
                        onValueChange={(values) => {
                          field.onChange(values[0] ?? 1);
                        }}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <div className="mt-2 flex justify-between text-xs text-neutral-500">
                      <span>1</span>
                      <span>{middNum}</span>
                      <span>{maxPartNum}</span>
                    </div>
                  </div>
                  <div className="w-[16.67%] px-4">
                    <InputNumber
                      min={1}
                      max={maxPartNum}
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      className="w-20"
                    />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </Form>
    </DialogForm>
  );
};

export default GenerateSriovModal;
