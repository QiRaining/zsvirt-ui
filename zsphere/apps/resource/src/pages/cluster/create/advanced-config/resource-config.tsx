import { Form, Input } from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { validCpuOverProvision, validMemoryOverProvision } from "./utils";

import style from "./style.module.less";

export interface IProps {}

const ResourceConfig: React.FC<IProps> = () => {
  const intl = useIntl();

  const { isRequired } = useValidator(intl);

  return (
    <>
      <Form.Item
        label={intl.formatMessage({
          id: "cpu.overProvisioning.ratio",
          defaultMessage: "CPU Overcommit Ratio",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cluster.field.cpu.overProvisioning.ratio.tooltip",
              defaultMessage: `### CPU Overcommit Ratio

Controls the number of virtual CPUs allocated to virtual machines. The calculation formula: Physical CPU Total Threads × CPU Overcommit Ratio = Allocatable Virtual CPUs.`,
            })}
          </ReactMarkdown>
        }
        required
      >
        <Form.Item
          noStyle
          name="host-cpu.overProvisioning.ratio"
          rules={[
            isRequired(IIsRequiredType.input),
            {
              validator: (rule, value) => {
                return validCpuOverProvision(rule, value, intl);
              },
            },
          ]}
        >
          <Input className={style["width-80"]} />
        </Form.Item>
        <Form.Item noStyle> : 1</Form.Item>
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({
          id: "overProvisioning.memory",
          defaultMessage: "Memory Overcommit Ratio",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cluster.field.overProvisioning.memory.tooltip",
              defaultMessage: `### Memory Overcommit Ratio

Controls the amount of virtual memory capacity allocated to a virtual machine. The calculation formula: (Physical Memory Capacity − Reserved Capacity) × Memory Overcommit Ratio = Allocatable Virtual Memory Capacity.`,
            })}
          </ReactMarkdown>
        }
        required
      >
        <Form.Item
          noStyle
          name="mevoco-overProvisioning.memory"
          rules={[
            isRequired(IIsRequiredType.input),
            {
              validator: (rule, value) => {
                return validMemoryOverProvision(rule, value, intl);
              },
            },
          ]}
        >
          <Input className={style["width-80"]} />
        </Form.Item>
        <Form.Item noStyle> : 1</Form.Item>
      </Form.Item>
    </>
  );
};

export default ResourceConfig;
