import { Checkbox } from "@zstack/design";
import { getZoneUuidBySource } from "@zstack/virtualization-resource/src/pages/vm/create/hooks/get-zoneuuid";
import {
  Form,
  InputDebounce,
  InputNumber,
  Switch,
  ZSVForm,
} from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { ResourceQueryType } from "@zstack/zsphere-types";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import {
  Group,
  Os,
  HaAlertItem,
  RunInPosition,
} from "zsv_resource_shared/vm/mf-index";

import styles from "./style.module.less";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
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

interface IProps {
  form: any;
  source?: any;
  template?: any;
}

const { Item } = Form;

const MARGIN_BOTTOM_8_STYLE = { marginBottom: 8 } as const;

export const fieldsNeedsValidateInBasic = ["vmName", "count"];

const BasicPart: React.FC<IProps> = ({ form, source, template }) => {
  const intl = useIntl();

  const isEdit = true;

  const { isRequired, numberRange, commonNameRules, validatorUniqName } =
    useValidator(intl);

  const { currentUser } = usePlatformStore();

  const zoneUuid = useMemo(() => {
    return getZoneUuidBySource(source);
  }, [source]);

  // 监听相关字段变化，设置表单值
  const runPath = Form.useWatch("runPath", form);

  // 监听 runPath 变化，设置 ha
  useEffect(() => {
    if (runPath?.[0]?.__typename && !isEdit) {
      let ha = true;

      if (runPath?.[0]?.__typename === "HostVO") {
        ha = runPath?.[0]?.cluster?.resourceConfigValue?.haVmHaLevel !== "None";
      }

      if (runPath?.[0]?.__typename === "Cluster") {
        ha = runPath?.[0]?.resourceConfigValue?.haVmHaLevel !== "None";
      }

      form.setFieldsValue({ ha });
    }
  }, [runPath]);

  return (
    <ZSVForm.Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="vmName"
        rules={[
          ...commonNameRules,
          validatorUniqName(
            ResourceQueryType.VmInstance,
            source?.__typename === "VmInstance" ? source?.name : undefined,
            intl.formatMessage({
              id: "instance.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      >
        <InputDebounce className={styles.baseFormItem} />
      </Item>

      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.count",
          defaultMessage: "Quantity",
        })}
        name="count"
        rules={[isRequired(), numberRange(1, 2000)]}
      >
        <InputNumber max={2000} className={styles["baseFormItem-160"]} />
      </Item>

      {currentUser?.currentIdentity === "Admin" && (
        <Group form={form} zoneUuid={zoneUuid} source={source} />
      )}

      <RunInPosition
        form={form}
        zoneUuid={zoneUuid}
        source={source}
        relateSource={template}
      />

      <Os form={form} source={template} />

      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.ha.mode",
          defaultMessage: "HA",
        })}
        name="ha"
        valuePropName="checked"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.create.instance.ha.mode.tooltip",
              defaultMessage: `### HA

Specifies whether to automatically power on the virtual machine upon shutdown.

1. Off: The VM will not automatically power on upon shutdown.

2. On and with HA policy enabled:

    - VMs that shut down through a scheduled task will automatically power on.
    - VMs that shut down unexpectedly will migrate to another host to power on according to its customized HA policy.

#### Note:

1. You can set a cluster-wide VM HA through Advanced Settings in a cluster. If you set the HA for an individual VM, the individual setting prevails over the cluster setting.
2. When the HA policy is disabled, if you enable this switch, VM HA will take effect after the HA policy is enabled.`,
            })}
          </ReactMarkdown>
        }
        description={<HaAlertItem />}
      >
        <Switch />
      </Item>

      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.poweron",
          defaultMessage: "Power Status",
        })}
        name="strategy"
        valuePropName="checked"
        style={MARGIN_BOTTOM_8_STYLE}
      >
        <FormCheckbox
          label={intl.formatMessage({
            id: "virtualization.create.instance.poweron.checkbox.description",
            defaultMessage: "Power on after creation",
          })}
        />
      </Item>
    </ZSVForm.Card>
  );
};

export default React.memo(BasicPart);
