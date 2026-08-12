import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { Form, Select } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { CpuArchitecture } from "@zstack/zsphere-types";
import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  source: any;
  createByResource?: boolean;
  newCreate?: boolean;
}

const { Item } = Form;
const { Option } = Select;

const allCanDisableItems = [
  "gpuType",
  "totalGPUMemory",
  "soundCard",
  "motherboardType",
];
const gpuOptions = ["virtio", "vga", "qxl", "cirrus"];

const OtherCard: React.FC<IProps> = ({
  form,
  source,
  createByResource = true,
}) => {
  const intl = useIntl();

  const disabledConfig = useContext(ConfigContext);
  const motherboardOptions = ["q35", "i440fx"];
  const disableItems = createByResource ? allCanDisableItems : [];

  // 监听相关字段变化，设置表单值
  const gpuType = Form.useWatch("gpuType", form);

  // 监听 gpuType 变化，设置 totalGPUMemory
  useEffect(() => {
    if (["cirrus", "vga", "qxl"].indexOf(gpuType) !== -1) {
      form.setFieldsValue({ totalGPUMemory: 16 });
    }
  }, [gpuType, form]);

  // 监听 runPath 变化，设置 motherboardType
  useEffect(() => {
    const isArm = source?.architecture === CpuArchitecture.aarch64;
    if (isArm) {
      form.setFieldsValue({ motherboardType: "q35" });
    }
  }, [source, form]);

  const soundCardOptions = [
    {
      value: "ac97",
      displayName: intl.formatMessage({
        id: "globalConfig.vm.soundType.ac97",
        defaultMessage: "AC97",
      }),
    },
    {
      value: "ich6",
      displayName: intl.formatMessage({
        id: "globalConfig.vm.soundType.ich6",
        defaultMessage: "HDA(ICH6)",
      }),
    },
    {
      value: "ich9",
      displayName: intl.formatMessage({
        id: "globalConfig.vm.soundType.ich9",
        defaultMessage: "HDA(ICH9)",
      }),
    },
  ];

  return (
    <div className={styles.content}>
      <Item noStyle shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {() => {
          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.other.gpu.type",
                defaultMessage: "Graphics Card Type",
              })}
              name="gpuType"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "zsv.create.instance.other.gpu.type.tooltip",
                    defaultMessage: `### Graphics Type
Used to set the default graphics type for virtual machines at startup. For x86 architectures, the default is VGA, while for ARM architectures only Virtio is supported.

- Virtio

   - A optimized graphics virtualization type that uses QEMU Virtio framework to communicate with the host, providing higher performance and lower latency.

   - Suitable for virtual machines that require high-performance graphics acceleration and optimization, such as high-performance computing and graphics-intensive applications.

- VGA

   - A simple graphics virtualization type.

   - Suitable for scenarios where high-performance graphics acceleration is not required, such as simple server virtualization.

- QXL

   - A graphics virtualization type that supports advanced graphics features, including hardware acceleration and 3D acceleration capabilities.

   - When using the SPICE protocol, it provides better performance and experience. Suitable for virtual machines that require advanced graphics features and graphics acceleration, such as desktop virtualization and virtual gaming.

- Cirrus

   - A high-level graphics virtualization type that provides better performance and experience.

   - Suitable for virtual machines that require better graphics performance but do not need 3D acceleration.`,
                  })}
                </ReactMarkdown>
              }
              tooltip={disabledConfig.tooltip}
            >
              <Select
                disabled={
                  disabledConfig.disabled || disableItems.includes("gpuType")
                }
                width={200}
              >
                {gpuOptions.map((t) => (
                  <Option value={t} key={t}>{`${t}`}</Option>
                ))}
              </Select>
            </Item>
          );
        }}
      </Item>

      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          return pre.gpuType !== cur.gpuType;
        }}
      >
        {() => {
          const options = [2, 4, 8, 16, 32, 64, 128, 256, 512];

          const gpuType = form.getFieldValue("gpuType");

          return gpuType !== "virtio" ? (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.other.total.gpuMemory",
                defaultMessage: "Total Graphics Memory",
              })}
              name="totalGPUMemory"
              tooltip={disabledConfig.tooltip}
            >
              <Select
                disabled={
                  ["cirrus", "vga"].indexOf(gpuType) !== -1 ||
                  disabledConfig.disabled ||
                  disableItems.includes("totalGPUMemory")
                }
                width={200}
                options={options?.map((it) => ({
                  value: it,
                  label: `${it} MB`,
                  key: it,
                }))}
              />
            </Item>
          ) : null;
        }}
      </Item>

      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.other.sound.card.type",
          defaultMessage: "Audio Card Type",
        })}
        name="soundCard"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.create.instance.other.sound.card.type.tooltip",
              defaultMessage: `### Audio Card Type

Default: HDA (ICH6)

Used to set the default audio card type when starting a virtual machine.

HDA (ICH6)
- Simulates high-fidelity audio devices.
- Provides high-quality and advanced audio features, including multichannel audio, surround sound, and audio input/output.
- Suitable for scenarios with high audio performance requirements, such as VDI-based infrastructure, multimedia applications, audio editing, and professional music software.

HDA (ICH9)
- Simulates high-fidelity audio devices.
- Provides high-quality and advanced audio output, supporting multichannel audio, up to 24-bit precision audio sampling, and up to 192 kHz audio sampling rate, with better anti-jamming performance and low power consumption.
- Suitable for computers and embedded systems that require high-quality audio output, with improved audio processing performance and low power consumption.

AC97
- Simulates audio devices.
- Provides basic audio functionality, including sound effects and music playback.
- Suitable for scenarios where the audio performance requirement is low, such as general-purpose server virtualization, testing environments, and supporting legacy operating systems.`,
            })}
          </ReactMarkdown>
        }
        tooltip={disabledConfig.tooltip}
      >
        <Select
          width={200}
          disabled={
            disabledConfig.disabled || disableItems.includes("soundCard")
          }
        >
          {soundCardOptions.map((t) => (
            <Option value={t.value} key={t.value}>
              {t.displayName}
            </Option>
          ))}
        </Select>
      </Item>
      <Item noStyle shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {() => {
          const isArm = source?.architecture === CpuArchitecture.aarch64;
          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.other.motherboard.type",
                defaultMessage: "Motherboard Type",
              })}
              name="motherboardType"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "zsv.create.instance.other.motherboard.type.tooltip",
                    defaultMessage: `### Motherboard Type

Specify the default motherboard type when starting a virtual machine. Default: i440fx.

- i440fx: A relatively traditional type of virtual machine motherboard that emulates the Intel i440FX chipset. This option provides basic BIOS compatibility for the virtual machine but has relatively weak support for hardware virtualization.
- q35: A virtual motherboard specification developed by Intel that provides more hardware virtualization features. This option supports more advanced hardware virtualization features.`,
                  })}
                </ReactMarkdown>
              }
            >
              <Select
                disabled={disableItems.includes("motherboardType")}
                width={200}
              >
                {(isArm
                  ? motherboardOptions.filter((t) => t === "q35")
                  : motherboardOptions
                ).map((t) => (
                  <Option value={t} key={t}>{`${t}`}</Option>
                ))}
              </Select>
            </Item>
          );
        }}
      </Item>
    </div>
  );
};

export default React.memo(OtherCard);
