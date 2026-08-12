import { Checkbox } from "@zstack/design";
import {
  InputNumber,
  ZSVForm,
  InputDebounce,
} from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { ResourceQueryType } from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

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
import Os from "../../bussiness-components/os";
import RunInPosition from "../../bussiness-components/run-position";
import ConfigProvider from "../../context";
import { getZoneUuidBySource } from "../../utils";

import styles from "./style.module.less";

interface IProps {
  form: any;
  source?: any;
}

const { Item } = Form;

export const fieldsNeedsValidateInBasic = ["name", "count"];

const BasicPart: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();

  const { isRequired, numberRange, commonNameRules, validatorUniqName } =
    useValidator(intl);

  const zoneUuid = useMemo(() => {
    return getZoneUuidBySource(source);
  }, [source]);

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
        <InputNumber
          max={2000}
          className={styles.baseFormItemNumber}
          disabled
        />
      </Item>

      {/* //选择运行位置 */}
      <RunInPosition form={form} zoneUuid={zoneUuid} source={source} />

      {/* //选择系统 */}
      {/* ZSV-9491 */}
      <ConfigProvider disabled>
        <Os form={form} source={source} />
      </ConfigProvider>

      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.poweron",
          defaultMessage: "Power Status",
        })}
        name="strategy"
        valuePropName="checked"
        style={{ marginBottom: "20px" }}
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
