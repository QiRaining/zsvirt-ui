import { Illustration } from "@zstack/zsphere-illustration";
import type {
  ResourceConfigInPage as IResourceConfigInPage,
  VmInstance as IVM,
} from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export const useOtherDeviceList = (
  detail: IVM,
  _resourceConfig: { [prop: string]: IResourceConfigInPage },
) => {
  const intl = useIntl();

  const list = useMemo(() => {
    return [
      {
        label: (
          <>
            <Illustration type="other" size={16} />
            {intl.formatMessage({
              id: "virtualization.other.hardware",
              defaultMessage: "Other",
            })}
          </>
        ),
        value: " ",
        children: [
          {
            label: intl.formatMessage({
              id: "virtualization.create.instance.other.gpu.type",
              defaultMessage: "Graphics Card Type",
            }),
            value: _resourceConfig?.videoType?.value,
          },
          {
            label: intl.formatMessage({
              id: "virtualization.create.instance.other.total.gpu.memory",
              defaultMessage: "Total Graphics Memory",
            }),
            value: detail?.systemTag?.qxlMemory?.vram
              ? `${(detail?.systemTag?.qxlMemory?.vram ?? 0) / 1024}MB`
              : undefined,
            show: _resourceConfig?.videoType?.value !== "virtio",
          },
          {
            label: intl.formatMessage({
              id: "virtualization.create.instance.other.sound.card.type",
              defaultMessage: "Audio Card Type",
            }),
            value: _resourceConfig?.soundType?.value,
          },
          {
            label: intl.formatMessage({
              id: "virtualization.create.instance.other.motherboard.type",
              defaultMessage: "Motherboard Type",
            }),
            value:
              //
              detail?.systemTag?.vmMachineType ?? "i440fx",
          },
        ],
      },
    ];
  }, [_resourceConfig, intl, detail]);
  return list;
};
