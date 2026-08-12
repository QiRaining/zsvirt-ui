import { gql } from "@apollo/client";
import { Checkbox, RadioGroup } from "@zstack/design";
import { Form, Input } from "@zstack/zsphere-components";
import { Switch } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  ImageBootMode,
  ImagePlatform,
  SystemTagActionType,
} from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { isEqual, compact } from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import BootOrder, { BootOrderKey } from "../../components/boot-order";
import { useResourceConfigQuery } from "../../hooks/use-resource-config-query";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }
>(({ checked, onChange, label, className, style, disabled }, ref) => {
  const id = React.useId();
  return (
    <div
      className={`flex items-center ${className ?? ""}`.trim()}
      style={style}
    >
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(val) => onChange?.(val === true)}
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

const editVmGuestToolConfig = gql`
  mutation editVmGuestToolConfig($input: EditGuestToolConfigInput!) {
    editVmGuestToolConfig(input: $input) {
      actionId
    }
  }
`;

const STYLE_BOOT_ONCE = { marginTop: "-16px" } as const;

const Edit: React.FC<{
  platform?: string;
  guestOsType?: string;
  bootMode?: string;
  visible?: boolean;
  form: any;
  tpmEnabled?: boolean;
  architecture?: string;
}> = ({
  platform,
  guestOsType,
  bootMode,
  visible,
  form,
  tpmEnabled,
  architecture,
}) => {
  const intl = useIntl();
  const [showCSM, setShowCSM] = useState<boolean>(false);
  const { numberRange } = useValidator(intl);

  // 监听 bootMode 变化，当添加 TPM 后强制设置为 UEFI
  const currentBootMode = Form.useWatch("bootMode", form);
  useEffect(() => {
    if (tpmEnabled && currentBootMode !== ImageBootMode.UEFI) {
      form.setFieldsValue({
        bootMode: ImageBootMode.UEFI,
        __needSetQ35__: true,
      });
    }
  }, [tpmEnabled, currentBootMode, form]);

  useEffect(() => {
    if (visible) {
      const flag =
        bootMode?.includes("UEFI") &&
        ImagePlatform.Windows === platform &&
        ["Windows", "Windows 7", "WindowsServer 2008"].includes(guestOsType!);

      setShowCSM(flag as boolean);
    }
  }, [guestOsType, platform, bootMode]);

  const changeBootMode = (value: string) => {
    if (
      value === "UEFI" &&
      ImagePlatform.Windows === platform &&
      ["Windows", "Windows 7", "WindowsServer 2008"].includes(guestOsType!)
    ) {
      setShowCSM(true);
      if (["Windows 7", "WindowsServer 2008"].includes(guestOsType!)) {
        form.setFieldsValue({ compatibility: true });
      }
    } else {
      setShowCSM(false);
      form.setFieldsValue({ compatibility: false });
    }
    if (value === ImageBootMode.UEFI) {
      form.setFieldsValue({ __needSetQ35__: true });
    }
    // 当切换到 Legacy 模式时，自动关闭 Secure Boot
    if (value === ImageBootMode.Legacy) {
      form.setFieldsValue({ secureBoot: false });
    }
  };

  return (
    <>
      <Form.Item
        label={intl.formatMessage({
          id: "boot.order",
          defaultMessage: "Boot Order",
        })}
        name="bootOrders"
        required
      >
        <BootOrder />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) => prev.bootOrders !== cur.bootOrders}
      >
        {({ getFieldValue }) => {
          const dataSource = getFieldValue("bootOrders");
          return dataSource?.[0] === BootOrderKey.CdRom ||
            dataSource?.[0] === BootOrderKey.Network ? (
            <Form.Item
              name="bootOrderOnce"
              valuePropName="checked"
              label=" "
              style={STYLE_BOOT_ONCE}
            >
              <FormCheckbox
                label={
                  <span>
                    {intl.formatMessage({
                      id: "set.vmBootOrderFromCdRomOnce",
                      defaultMessage:
                        "The setting can only take effect for the next VM reboot. Afterwards, VM instances will be booted from hard disks.",
                    })}
                  </span>
                }
              />
            </Form.Item>
          ) : null;
        }}
      </Form.Item>
      {showCSM && (
        <Form.Item
          name="compatibility"
          label={intl.formatMessage({
            id: "compatibility",
            defaultMessage: "CSM",
          })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "vm.field.compatibility.tooltip",
                defaultMessage: `### Compatibility Support Module

1. The Compatibility Support Module (CSM) is used only to provide compatibility support for operating systems that do not support or cannot fully support UEFI.

2. CSM is used if you use Windows 7/2008. If you select Windows, we recommend you do not select CSM.`,
              })}
            </ReactMarkdown>
          }
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      )}
      <Form.Item
        name="bootMode"
        label={intl.formatMessage({
          id: "biosMode",
          defaultMessage: "BIOS Mode",
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "vm.field.biosMode.validator.required",
              defaultMessage: "Select a BIOS mode.",
            }),
          },
        ]}
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
        description={intl.formatMessage({
          id: "vm.field.biosMode.description",
          defaultMessage: "Mismatched BIOS mode may cause virtual machines to malfunction.",
        })}
      >
        <RadioGroup
          onValueChange={(value) => changeBootMode(value)}
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
        />
      </Form.Item>

      {/* Secure Boot - 仅在 UEFI 模式下显示 */}
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) =>
          prev.bootMode !== cur.bootMode || prev.secureBoot !== cur.secureBoot
        }
      >
        {() => {
          const isArm = architecture === "aarch64";
          const showSecureBoot =
            form.getFieldValue("bootMode") === ImageBootMode.UEFI && !isArm;
          if (!showSecureBoot) {
            return null;
          }

          return (
            <Form.Item
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
            </Form.Item>
          );
        }}
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "bootMenuSplashTimeout",
          defaultMessage: "BIOS Post Delay",
        })}
        name="bootMenuSplashTimeout"
        rules={[numberRange(1, 60)]}
      >
        <Input
          type="number"
          className="width-320"
          suffix={intl.formatMessage({ id: "second", defaultMessage: " seconds" })}
        />
      </Form.Item>
      {ImagePlatform.Windows === platform && (
        <Form.Item
          name="biosSync"
          label={intl.formatMessage({
            id: "bios.time.sync",
            defaultMessage: "Time Synchronization for BIOS",
          })}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      )}
    </>
  );
};

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const [form] = Form.useForm();

  const vm = selectedList?.[0];
  const [resourceConfig] = useResourceConfigQuery(
    vm?.uuid,
    ["vm"],
    ["bootMenuSplashTimeout", "enable.uefi.secure.boot"],
    visible,
  );

  const { systemTag, guestOsType, platform } = vm;
  const bootMode = systemTag?.bootMode || ImageBootMode.Legacy;
  const tpmEnabled = (vm as any)?.tpmList?.length > 0;
  const secureBoot =
    resourceConfig?.["enable.uefi.secure.boot"]?.value === "true";
  const [initialValues, setInitialValues] = useState<{ [prop: string]: any }>(
    {},
  );

  useEffect(() => {
    if (visible && vm) {
      const currentBootMode =
        bootMode === ImageBootMode.UEFI_WITH_CSM
          ? ImageBootMode.UEFI
          : bootMode;
      // 如果 bootMode 不是 UEFI，Secure Boot 应该默认为 false
      const secureBootValue =
        currentBootMode === ImageBootMode.UEFI ? secureBoot : false;

      const value = {
        __needSetQ35__: false,
        bootOrders: vm?.bootOrder?.orders ?? [],
        bootMode: currentBootMode,
        compatibility: bootMode === ImageBootMode.UEFI_WITH_CSM,
        bootMenuSplashTimeout: String(
          +resourceConfig?.bootMenuSplashTimeout?.value / 1000,
        ),
        biosSync: vm?.systemTag?.clockTrack === "host",
        secureBoot: secureBootValue,
      };
      setInitialValues(value);
      form.setFieldsValue(value);
    }
  }, [visible, vm, resourceConfig, secureBoot, bootMode]);

  const onOk = async (values: any) => {
    // 修复：条件渲染的 Form.Item（secureBoot / biosSync / bootOrderOnce / compatibility）
    // 在未挂载时不会出现在 values 中，导致 diff 时 undefined !== false 误判，
    // 进而把 "undefined" / "guest" 等无意义值写回后端。
    // 这里用 initialValues 做兜底，并对布尔字段做归一化。
    const definedEntries = Object.entries(values).filter(
      ([, v]) => v !== undefined,
    );
    const merged: any = {
      ...initialValues,
      ...Object.fromEntries(definedEntries),
    };
    const toBool = (v: unknown) => v === true;
    merged.secureBoot = toBool(merged.secureBoot);
    merged.biosSync = toBool(merged.biosSync);
    merged.compatibility = toBool(merged.compatibility);
    merged.bootOrderOnce = toBool(merged.bootOrderOnce);

    const payload: any = [];
    if (!isEqual(merged.bootOrders, initialValues.bootOrders)) {
      payload.push({
        setVmBootOrderPayload: {
          uuid: vm?.uuid,
          bootOrder: merged.bootOrders.filter(
            (it: BootOrderKey) => it !== BootOrderKey.Empty,
          ),
          systemTags:
            merged?.bootOrders?.[0] !== "HardDisk"
              ? [`bootOrderOnce::${merged.bootOrderOnce}`]
              : [],
        },
      });
    }

    const _bootMode =
      merged.bootMode === ImageBootMode.UEFI && merged.compatibility
        ? ImageBootMode.UEFI_WITH_CSM
        : merged.bootMode;
    if (!isEqual(_bootMode, initialValues.bootMode)) {
      payload.push({
        setVmBootModePayload: {
          uuid: vm?.uuid,
          bootMode: _bootMode,
        },
      });
    }

    if (merged.bootMenuSplashTimeout !== initialValues?.bootMenuSplashTimeout) {
      payload.push({
        updateResourceConfigPayload: {
          uuid: "xxx",
          name: "bootMenuSplashTimeout",
          category: "vm",
          resourceUuid: vm?.uuid,
          value: String(+merged.bootMenuSplashTimeout * 1000),
        },
      });
    }

    if (merged.biosSync !== initialValues.biosSync) {
      payload.push({
        setVmBIOSTrackPayload: {
          uuid: vm?.uuid,
          clockTrack: merged.biosSync ? "host" : "guest",
        },
      });
    }

    if (merged.secureBoot !== initialValues.secureBoot) {
      payload.push({
        updateResourceConfigPayload: {
          name: "enable.uefi.secure.boot",
          category: "vm",
          resourceUuid: vm?.uuid,
          value: String(merged.secureBoot),
        },
      });
    }

    if (
      form.getFieldValue("__needSetQ35__") &&
      vm?.systemTag?.vmMachineType !== "q35"
    ) {
      payload.push({
        setSystemTagPayload: {
          tag: "vmMachineType::q35",
          originTag: "vmMachineType",
          resourceType: "VmInstanceVO",
          resourceUuid: vm?.uuid,
          actionType: SystemTagActionType.Update,
        },
      });
    }

    if (compact(Object.values(payload))?.length === 0) {
      return;
    }

    doAction({
      mutation: editVmGuestToolConfig,
      payload,
      name: intl.formatMessage({
        id: "edit.boot.config",
        defaultMessage: "Modify Boot Options",
      }),
      total: 1,
      onProgress: () => {},
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "edit.boot.config",
        defaultMessage: "Modify Boot Options",
      })}
      form={form}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form}>
        <Edit
          form={form}
          platform={platform}
          bootMode={bootMode}
          guestOsType={guestOsType}
          visible={visible}
          tpmEnabled={tpmEnabled}
          architecture={vm?.architecture}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
