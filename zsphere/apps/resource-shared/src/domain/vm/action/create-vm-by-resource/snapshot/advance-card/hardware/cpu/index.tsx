import { InputNumber } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormCreateType } from "@zstack/zsphere-types";
import * as _ from "lodash-es";
import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";

import { ConfigContext } from "../../../../context";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form?: any;
  source: any;
}

const winLists = [
  "WindowsServer 2008",
  "WindowsServer 2012",
  "WindowsServer 2016",
  "WindowsServer 2019",
  "WindowsServer 2022",
];

const { Item } = Form;

const MAX_CPU_NUM = 1024;

const CPUCard: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();

  const isEdit = source?.__typename === "VmInstance";

  const disabledConfig = useContext(ConfigContext);

  const { isRequired, numberRange } = useValidator(intl);

  useEffect(() => {
    if (!isEdit) {
      const guest = form.getFieldValue("guest");
      const os = form.getFieldValue("os");

      if (guest === "Linux") {
        form.setFieldsValue({
          hotPlug: true,
        });
      }

      if (guest === "Windows") {
        form.setFieldsValue({
          hotPlug: !!_.includes(winLists, os),
        });
      }
      if (guest === "Other") {
        form.setFieldsValue({
          hotPlug: false,
        });
      }
    }
  }, [form, isEdit]);

  const onCpuNumChange = (val: number | string) => {
    const nicMultiQueueNumKeys = _.keys(form.getFieldValue()).filter(
      (it) => it.indexOf("nicMultiQueueNum-") === 0,
    );
    let kvmAutoSetVmNicMultiqueue = false;
    const runPath = form.getFieldValue("runPath");
    let nicMultiQueueNumValue = val;
    if (runPath?.[0] && runPath?.[0]?.__typename) {
      if (runPath?.[0]?.__typename === "HostVO") {
        kvmAutoSetVmNicMultiqueue =
          runPath?.[0]?.cluster?.resourceConfigValue
            ?.kvmAutoSetVmNicMultiqueue !== "false";
      }
      if (runPath?.[0]?.__typename === "Cluster") {
        kvmAutoSetVmNicMultiqueue =
          runPath?.[0]?.resourceConfigValue?.kvmAutoSetVmNicMultiqueue !==
          "false";
      }
    }

    if (kvmAutoSetVmNicMultiqueue && val) {
      nicMultiQueueNumValue = (val as number) < 12 ? String(val) : "12";
    }

    form.setFields([
      ...nicMultiQueueNumKeys.map((key) => ({
        name: key,
        value: nicMultiQueueNumValue.toString(),
      })),
      { name: "sockedNum", key: val },
    ]);
  };

  useEffect(() => {
    if (!isEdit) {
      onCpuNumChange(4); // 创建页面中 初始化nicMultiQueueNum
    }
  }, [isEdit]);

  return (
    <div className={styles.content} key="cpuCard">
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.cpu.core.num",
          defaultMessage: "Cores",
        })}
        name="totalCoreNum"
        rules={[isRequired(), numberRange(1, MAX_CPU_NUM)]}
        required
        tooltip={
          disabledConfig.cpuNumDisabled &&
          intl.formatMessage({
            id: "edit.vm.change.cpuNum.disabled.tooltip",
            defaultMessage:
              "Cannot modify this setting when the VM is running. Enable CPU and memory hot plugs and try again.",
          })
        }
      >
        <InputNumber
          disabled={disabledConfig.cpuNumDisabled}
          className={styles.cpuNum}
          onChange={onCpuNumChange}
          min={1}
          max={MAX_CPU_NUM}
        />
      </Item>
    </div>
  );
};

export default React.memo(CPUCard);
