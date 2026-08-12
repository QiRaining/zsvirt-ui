import { gql, useQuery } from "@apollo/client";
import { Checkbox } from "@zstack/design";
import {
  Form,
  InputDebounce,
  InputNumber,
  Switch,
  ZSVForm,
} from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { Op, ResourceQueryType } from "@zstack/zsphere-types";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

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
import { usePlatformStore } from "@zstack/zsphere-platform-store";

import { getZoneUuidBySource } from "../hooks/get-zoneuuid";
import Group from "./group";
import HaAlertItem from "./ha-alert";
import Os from "./os";
import RunInPosition from "./run-position";

import styles from "./style.module.less";

interface IProps {
  form: any;
  source?: any;
  isEdit?: boolean;
}

const { Item } = Form;

export const fieldsNeedsValidateInBasic = ["name", "count"];

const queryResourceList = gql`
  query resourceList($conditions: [Condition!], $type: ResourceQueryType!) {
    resourceList(conditions: $conditions, type: $type) {
      list {
        name
        uuid
      }
      total
    }
  }
`;

const BasicPart: React.FC<IProps> = ({ form, source, isEdit = false }) => {
  const intl = useIntl();

  const { isRequired, numberRange, commonNameRules, validatorUniqName } =
    useValidator(intl);

  const { currentUser } = usePlatformStore();

  const { data: vmData } = useQuery(queryResourceList, {
    variables: {
      type: "VmInstance",
      conditions: [
        {
          key: "state",
          value: "Destroyed",
          op: Op.ne,
        },
      ],
    },
  });

  const zoneUuid = useMemo(() => getZoneUuidBySource(source), [source]);

  useEffect(() => {
    if (["HostVO", "Cluster"].includes(source?.__typename)) {
      form.setFieldsValue({
        runPath: [source],
      });
    }
  }, [source, form]);

  // 使用 Form.useWatch 监听字段变化，避免在渲染时调用 setState
  const runPath = Form.useWatch("runPath", form);

  // Handle HA mode setting based on runPath changes
  useEffect(() => {
    if (runPath?.[0] && runPath?.[0]?.__typename && !isEdit) {
      let ha = true;

      if (runPath?.[0]?.__typename === "HostVO") {
        ha = runPath?.[0]?.cluster?.resourceConfigValue?.haVmHaLevel !== "None";
      }

      if (runPath?.[0]?.__typename === "Cluster") {
        ha = runPath?.[0]?.resourceConfigValue?.haVmHaLevel !== "None";
      }
      form.setFieldsValue({ ha });
    }
  }, [runPath, form, isEdit, source]);

  const validateNameUniqueness = async (_rule: any, value: string) => {
    if (vmData && form.getFieldValue("count") > 1) {
      const vmDataList = vmData.resourceList.list;
      for (let i = 0; i < vmDataList.length; i++) {
        const nameReg = new RegExp(`^${value}(-(\\d+))$`);
        if (
          nameReg.test(vmDataList[i].name) &&
          Number(vmDataList[i].name.split("-").pop()) <=
            form.getFieldValue("count")
        ) {
          throw intl.formatMessage({
            id: "instance.field.name.validator.duplicate",
            defaultMessage: "This name is already in use. Enter a different name.",
          });
        }
      }
    }
    return;
  };

  return (
    <ZSVForm.Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        dependencies={["count"]}
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
          {
            validator: validateNameUniqueness,
          },
        ]}
      >
        <InputDebounce className={styles.baseFormItem} />
      </Item>
      {!isEdit && (
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
      )}

      {/* //选择分组,只有admin才有 */}
      {currentUser?.currentIdentity === "Admin" && (
        <Group form={form} zoneUuid={zoneUuid} source={source} />
      )}

      {/* //选择运行位置 */}
      <RunInPosition form={form} zoneUuid={zoneUuid} source={source} />

      {/* //选择系统 */}
      <Os form={form} source={source} />

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
        description={<HaAlertItem isEdit={isEdit} />}
      >
        <Switch />
      </Item>

      {!isEdit && (
        <Item
          label={intl.formatMessage({
            id: "virtualization.create.instance.poweron",
            defaultMessage: "Power Status",
          })}
          name="strategy"
          valuePropName="checked"
        >
          <FormCheckbox
            label={intl.formatMessage({
              id: "virtualization.create.instance.poweron.checkbox.description",
              defaultMessage: "Power on after creation",
            })}
          />
        </Item>
      )}
    </ZSVForm.Card>
  );
};

export default React.memo(BasicPart);
