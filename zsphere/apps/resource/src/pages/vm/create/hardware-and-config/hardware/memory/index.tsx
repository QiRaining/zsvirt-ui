import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import type { IInputUnitProps } from "@zstack/zsphere-components";
import { Form, InputUnit, Select, Switch } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { isOfferingSize, isUint } from "@zstack/zsphere-utils";
import React, { useContext } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import HotAddDescription from "../../../components/hot-add-desc";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  formCreateType?: FormCreateType;
  source?: any;
  form: any;
}

const { Item } = Form;
const { Option } = Select;

export const memorySizeUnitList: Required<IInputUnitProps>["unitList"] = [
  "MB",
  "GB",
  "TB",
];

const MemoryCard: React.FC<IProps> = ({ form, source }) => {
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
    <div className={styles.content}>
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
      <Item
        name="memoryResourceLevel"
        label={intl.formatMessage({
          id: "virtualization.memory.resource.level",
          defaultMessage: "Memory Resource Priority",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.instance.field.memory.resource.level",
              defaultMessage: `### Memory Resource Priority

1. When resource contention occurs due to high host workloads, VMs with High Resource Priority can compete for more resources than those with Normal Resource Priority.

2. We recommend that you set Memory Resource Priority to High for vital VMs.
                  `,
            })}
          </ReactMarkdown>
        }
      >
        <Select width={200}>
          <Option value="Normal">
            {intl.formatMessage({
              id: "normal",
              defaultMessage: "Normal",
            })}
          </Option>
          <Option value="High">
            {intl.formatMessage({
              id: "high",
              defaultMessage: "High",
            })}
          </Option>
        </Select>
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre: any, cur: any) => pre.hotPlug !== cur.hotPlug}
      >
        {() => {
          const hotPlug = form.getFieldValue("hotPlug");
          return (
            <Item
              className={styles.hotAdd}
              label={intl.formatMessage({
                id: "virtualization.create.instance.memory.hot.plug",
                defaultMessage: "Memory Hot Plug",
              })}
              name="memHotPlug"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "zsv.instance.field.memory.hot.plug",
                    defaultMessage: `### Memory Hot Plug

Default: enabled. Specify whether to allow online modification of VM's memory.`,
                  })}
                </ReactMarkdown>
              }
              description={<HotAddDescription />}
            >
              <Switch disabled={true} checked={hotPlug} />
            </Item>
          );
        }}
      </Item>
    </div>
  );
};

export default React.memo(MemoryCard);
