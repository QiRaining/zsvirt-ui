import type { IInputUnitProps } from "@zstack/zsphere-components";
import { Form, InputUnit } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { isOfferingSize, isUint } from "@zstack/zsphere-utils";
import React, { useContext } from "react";
import { useIntl } from "react-intl";

import { ConfigContext } from "../../../../context";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  source?: any;
  form: any;
}

const { Item } = Form;

export const memorySizeUnitList: Required<IInputUnitProps>["unitList"] = [
  "MB",
  "GB",
  "TB",
];

const MemoryCard: React.FC<IProps> = () => {
  const intl = useIntl();
  const disabledConfig = useContext(ConfigContext);

  const validaMemorySize = async (_rule: any, value: any) => {
    if (!value.number && value.number !== 0) {
      throw intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      });
    }
    if (typeof value?.number !== "number") {
      return;
    }
    if (
      isUint(value?.number) &&
      isOfferingSize(`${value?.number}${value?.unit.substr(0, 1)}`)
    ) {
      return;
    }

    throw intl.formatMessage({
      id: "virtualization.memory.card.field.memory.validator.valueRange",
      defaultMessage: "Invalid capacity.",
    });
  };

  return (
    <Item
      name="memorySize"
      label={intl.formatMessage({
        id: "virtualization.memory.size",
        defaultMessage: "Memory",
      })}
      required
      rules={[{ validator: validaMemorySize }]}
      tooltip={
        disabledConfig?.memoryDisabled &&
        intl.formatMessage({
          id: "edit.vm.change.cpuNum.disabled.tooltip",
          defaultMessage:
            "Cannot modify this setting when the VM is running. Enable CPU and memory hot plugs and try again.",
        })
      }
    >
      <InputUnit
        disabled={disabledConfig?.memoryDisabled}
        unitList={memorySizeUnitList}
        min={1}
      />
    </Item>
  );
};

export default React.memo(MemoryCard);
