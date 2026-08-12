import { RadioGroup } from "@zstack/design";
import BootOrder from "@zstack/virtualization-resource/src/pages/vm/components/boot-order";
import { Switch, Form, Input } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormCreateType } from "@zstack/zsphere-types";
import { ImageBootMode, ImagePlatform } from "@zstack/zsphere-types";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

// Style constants
const INPUT_WIDTH_320_STYLE = { width: 320 } as const;

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  source: any;
}

const { Item } = Form;

const BootOptions: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();
  const { numberRange } = useValidator(intl);

  // 监听 runPath 变化，设置 bootMode
  const runPath = Form.useWatch("runPath", form);

  useEffect(() => {
    if (runPath?.[0]?.architecture) {
      switch (runPath[0].architecture) {
        case "aarch64":
          form.setFieldsValue({ bootMode: ImageBootMode.UEFI });
          break;
        case "x86_64":
          form.setFieldsValue({ bootMode: ImageBootMode.Legacy });
          break;
      }
    }
  }, [runPath, form]);

  // 监听 os 变化，设置 compatibility
  const os = Form.useWatch("os", form);

  useEffect(() => {
    if (os) {
      form.setFieldsValue({
        compatibility: ["Windows 7", "WindowsServer 2008"].includes(os),
      });
    }
  }, [os, form]);

  useEffect(() => {
    const fields = {
      bootMenuSplashTimeout: 10,
      bootMode: "Legacy",
      bootOrders: ["HardDisk"],
    };

    if (["HostVO", "Cluster"].indexOf(source?.__typename) !== -1) {
      fields.bootMode =
        source?.architecture === "aarch64"
          ? ImageBootMode.UEFI
          : ImageBootMode.Legacy;
    }
    form.setFieldsValue(fields);
  }, [source, form]);

  return (
    <div className={styles.content}>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.boot.options.bootOrder",
          defaultMessage: "Boot Order",
        })}
        name="bootOrders"
      >
        <BootOrder />
      </Item>
      <Item shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {() => {
          return (
            <Item
              name="bootMode"
              label={intl.formatMessage({
                id: "biosMode",
                defaultMessage: "BIOS Mode",
              })}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "vm.field.biosMode.tooltip",
                    defaultMessage: `### BIOS Mode

When you select a BIOS mode for images of different formats, note that:
   - For qcow2 and raw images, select the BIOS mode that is consistent with the template.
   - For iso images, you can select a BIOS mode as needed. Then, the system will be booted accordingly.

The BIOS modes include Legacy and UEFI.

   - Legacy: Supports x86 architectures and all operating systems.
   - UEFI: If the CPU architecture is AArch64 or MIPS64EL, you must use UEFI. Supported operating systems include Windows and CentOS. Note if you use Windows 7 or WindowsServer 2008, CSM needs to be used.`,
                  })}
                </ReactMarkdown>
              }
            >
              <RadioGroup
                options={[
                  { value: ImageBootMode.Legacy, label: ImageBootMode.Legacy },
                  { value: ImageBootMode.UEFI, label: ImageBootMode.UEFI },
                ]}
              />
            </Item>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre.os !== cur.os ||
          pre.bootMode !== cur.bootMode ||
          pre.guest !== cur.guest
        }
      >
        {() => {
          const guest = form.getFieldValue("guest");
          const os = form.getFieldValue("os");

          return (
            <>
              <Item
                name="bootMenuSplashTimeout"
                label={intl.formatMessage({
                  id: "bootMenuSplashTimeout",
                  defaultMessage: "BIOS Post Delay",
                })}
                rules={[numberRange(1, 60)]}
              >
                <Input
                  style={INPUT_WIDTH_320_STYLE}
                  suffix={intl.formatMessage({
                    id: "second",
                    defaultMessage: " seconds",
                  })}
                />
              </Item>
              {ImagePlatform.Windows === guest &&
                form.getFieldValue("bootMode") === ImageBootMode.UEFI &&
                ["Windows", "Windows 7", "WindowsServer 2008"].includes(os) && (
                  <Item
                    name="compatibility"
                    label={intl.formatMessage({
                      id: "enableCompatibility",
                      defaultMessage: "Enable CSM",
                    })}
                    help={
                      <div className={styles.caption}>
                        <ReactMarkdown>
                          {intl.formatMessage({
                            id: "image.field.compatibility.tips",
                            defaultMessage: `If you use Windows 7 or WindowsServer 2008, CSM must be used.`,
                          })}
                        </ReactMarkdown>
                      </div>
                    }
                    icon="info"
                    iconTooltip={
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "image.field.compatibility.tooltip",
                          defaultMessage: `### Compatibility Support Module

1. The Compatibility Support Module (CSM) is used only to provide compatibility support for operating systems that do not support or cannot fully support UEFI.

2. CSM is used if you use Windows 7/2008. If you select Windows, we recommend you do not select CSM.`,
                        })}
                      </ReactMarkdown>
                    }
                    valuePropName="checked"
                  >
                    <Switch
                      checked={true}
                      disabled={["Windows 7", "WindowsServer 2008"].includes(
                        os,
                      )}
                    />
                  </Item>
                )}
            </>
          );
        }}
      </Item>
    </div>
  );
};

export default React.memo(BootOptions);
