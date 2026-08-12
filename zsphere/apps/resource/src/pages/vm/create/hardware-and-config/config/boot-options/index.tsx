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

const INPUT_WIDTH_160_STYLE = { width: 160 } as const;

const BootOptions: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();
  const { numberRange } = useValidator(intl);

  const bootMode = Form.useWatch("bootMode", form);
  const tpmEnabled = Form.useWatch("tpmEnabled", form);
  const guest = Form.useWatch("guest", form);
  const os = Form.useWatch("os", form);

  // 记录切换到 Win11 之前的 bootMode 默认值，用于恢复
  const prevBootModeRef = React.useRef<string>(ImageBootMode.Legacy);

  useEffect(() => {
    const fields = {
      bootMenuSplashTimeout: 10,
      bootMode: "Legacy",
      bootOrders: ["HardDisk"],
      secureBoot: false,
    };

    if (["HostVO", "Cluster"].indexOf(source?.__typename) !== -1) {
      fields.bootMode =
        source?.architecture === "aarch64"
          ? ImageBootMode.UEFI
          : ImageBootMode.Legacy;
    }
    prevBootModeRef.current = fields.bootMode;
    form.setFieldsValue(fields);
  }, [source]);

  // Win11 联动：选择 Win11 时自动设为 UEFI + SecureBoot 开启；切换为非 Win11 时恢复
  const isWin11 = guest === "Windows" && os === "Windows 11";
  const prevIsWin11Ref = React.useRef(false);

  useEffect(() => {
    const runPath = form.getFieldValue("runPath")?.[0];
    const isArm =
      runPath?.architecture === "aarch64" || source?.architecture === "aarch64";
    if (isArm) {
      return;
    }

    if (isWin11 && !prevIsWin11Ref.current) {
      // 记录当前 bootMode，以便恢复
      const currentBootMode = form.getFieldValue("bootMode");
      if (currentBootMode !== ImageBootMode.UEFI) {
        prevBootModeRef.current = currentBootMode || ImageBootMode.Legacy;
      }
      // 切换到 Win11：设为 UEFI + SecureBoot
      form.setFieldsValue({
        bootMode: ImageBootMode.UEFI,
        motherboardType: "q35",
        secureBoot: true,
      });
    } else if (!isWin11 && prevIsWin11Ref.current) {
      // 从 Win11 切换为非 Win11：恢复 bootMode + 关闭 SecureBoot
      form.setFieldsValue({
        bootMode: prevBootModeRef.current,
        secureBoot: false,
      });
    }
    prevIsWin11Ref.current = isWin11;
  }, [isWin11, form, source]);

  // 处理根据runPath架构设置bootMode和motherboardType
  useEffect(() => {
    const runPath = form.getFieldValue("runPath");

    if (runPath?.[0]?.architecture) {
      switch (runPath[0].architecture) {
        case "aarch64":
          form.setFieldsValue({
            bootMode: ImageBootMode.UEFI,
            motherboardType: "q35",
          });
          break;
        case "x86_64":
          form.setFieldsValue({ bootMode: ImageBootMode.Legacy });
          break;
      }
    }
  }, [form]);

  // 当已添加 TPM 时，强制 BIOS 模式为 UEFI
  useEffect(() => {
    if (!tpmEnabled) {
      return;
    }
    if (bootMode !== ImageBootMode.UEFI) {
      form.setFieldsValue({
        bootMode: ImageBootMode.UEFI,
        motherboardType: "q35",
      });
    }
  }, [bootMode, form, tpmEnabled]);

  // 仅在 UEFI 模式下才保留 Secure Boot，切换回 Legacy 时自动关闭
  useEffect(() => {
    if (bootMode !== ImageBootMode.UEFI) {
      form.setFieldsValue({ secureBoot: false });
    }
  }, [bootMode, form]);

  // 处理根据操作系统设置compatibility
  useEffect(() => {
    const guest = form.getFieldValue("guest");
    const os = form.getFieldValue("os");

    if (guest && os) {
      form.setFieldsValue({
        compatibility: ["Windows 7", "WindowsServer 2008"].includes(os),
      });
    }
  }, [form]);

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
            {
              value: ImageBootMode.Legacy,
              label: ImageBootMode.Legacy,
              disabled: tpmEnabled,
              tooltip: tpmEnabled
                ? intl.formatMessage({
                    id: "vm.create.bootMode.legacy.disabled.by.tpm",
                    defaultMessage: "After adding a TPM, the BIOS mode is restricted to UEFI only.",
                  })
                : undefined,
            },
            { value: ImageBootMode.UEFI, label: ImageBootMode.UEFI },
          ]}
          onValueChange={(val) => {
            if (val === ImageBootMode.UEFI) {
              form.setFieldsValue({ motherboardType: "q35" });
            }
          }}
        />
      </Item>

      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre.bootMode !== cur.bootMode ||
          pre.tpmEnabled !== cur.tpmEnabled ||
          pre.guest !== cur.guest ||
          pre.os !== cur.os ||
          pre.runPath !== cur.runPath
        }
      >
        {() => {
          const runPath = form.getFieldValue("runPath")?.[0];
          const isArm =
            runPath?.architecture === "aarch64" ||
            source?.architecture === "aarch64";
          const showSecureBoot =
            form.getFieldValue("bootMode") === ImageBootMode.UEFI && !isArm;
          if (!showSecureBoot) {
            return null;
          }

          return (
            <Item
              name="secureBoot"
              label={intl.formatMessage({
                id: "secureBoot",
                defaultMessage: "Secure Boot",
              })}
              valuePropName="checked"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "vm.field.secureBoot.tooltip",
                    defaultMessage: `### Secure Boot

When enabled, the system validates the digital signature of all boot components (such as boot loaders, OS Kernels) during VM startup. Only trusted software with valid signatures can be loaded.`,
                  })}
                </ReactMarkdown>
              }
            >
              <Switch />
            </Item>
          );
        }}
      </Item>

      <Item
        name="bootMenuSplashTimeout"
        label={intl.formatMessage({
          id: "bootMenuSplashTimeout",
          defaultMessage: "BIOS Post Delay",
        })}
        rules={[numberRange(1, 60)]}
      >
        <Input
          style={INPUT_WIDTH_160_STYLE}
          suffix={intl.formatMessage({
            id: "second",
            defaultMessage: " seconds",
          })}
        />
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
