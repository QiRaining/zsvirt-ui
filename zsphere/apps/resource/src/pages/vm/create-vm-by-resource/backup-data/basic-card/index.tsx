import { Checkbox } from "@zstack/design";
import { getZoneUuidBySource } from "@zstack/virtualization-resource/src/pages/vm/create/hooks/get-zoneuuid";
import {
  InputNumber,
  Switch,
  Form,
  InputDebounce,
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

// Style constants
const MARGIN_BOTTOM_20PX_STYLE = { marginBottom: "20px" } as const;

interface IProps {
  form: any;
  source?: any;
}

const { Item } = Form;

export const fieldsNeedsValidateInBasic = ["name", "count"];

const BasicPart: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();
  const { currentUser } = usePlatformStore();

  const { isRequired, numberRange, commonNameRules, validatorUniqName } =
    useValidator(intl);

  const zoneUuid = useMemo(() => {
    return getZoneUuidBySource(source);
  }, [source]);

  useEffect(() => {
    if (["HostVO", "Cluster"].indexOf(source?.__typename) !== -1) {
      form.setFieldsValue({
        runPath: [source],
      });
    }
  }, [source, form]);

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <div className={styles.rect} />
        <div className={styles.text}>
          {intl.formatMessage({ id: "basic.info", defaultMessage: "Basic Info" })}
        </div>
      </div>
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={[
          ...commonNameRules,
          validatorUniqName(
            ResourceQueryType.VmInstance,
            source?.__typename === "VmInstance" ? source?.name : undefined,
            intl.formatMessage({
              id: "vm.field.name.validator.duplicate",
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
        <InputNumber max={2000} className={styles.baseFormItem} disabled />
      </Item>

      {currentUser?.currentIdentity === "Admin" && (
        <Group form={form} zoneUuid={zoneUuid} source={source} />
      )}

      {/* //选择运行位置 */}
      <RunInPosition form={form} zoneUuid={zoneUuid} source={source} />

      {/* //选择系统 */}
      <Os form={form} source={source} />

      <Item noStyle shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {() => {
          const runPath = form.getFieldValue("runPath");

          if (runPath?.[0] && runPath?.[0]?.__typename) {
            let ha = true;

            if (runPath?.[0]?.__typename === "HostVO") {
              ha =
                runPath?.[0]?.cluster?.resourceConfigValue?.haVmHaLevel !==
                "None";
            }

            if (runPath?.[0]?.__typename === "Cluster") {
              ha = runPath?.[0]?.resourceConfigValue?.haVmHaLevel !== "None";
            }

            form.setFieldValue("ha", ha);
          }

          return (
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
          );
        }}
      </Item>

      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.poweron",
          defaultMessage: "Power Status",
        })}
        name="strategy"
        valuePropName="checked"
        style={MARGIN_BOTTOM_20PX_STYLE}
      >
        <FormCheckbox
          label={intl.formatMessage({
            id: "virtualization.create.instance.poweron.checkbox.description",
            defaultMessage: "Power on after creation",
          })}
        />
      </Item>
    </div>
  );
};

export default React.memo(BasicPart);
