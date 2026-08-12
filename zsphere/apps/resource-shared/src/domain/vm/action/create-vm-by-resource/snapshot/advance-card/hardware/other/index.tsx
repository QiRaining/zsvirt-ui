import { Form, Select } from "@zstack/zsphere-components";
import { CpuArchitecture } from "@zstack/zsphere-types";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

interface IProps {
  form: any;
  source: any;
}

const { Item } = Form;
const { Option } = Select;

const motherboardOptions = ["q35", "i440fx"];

const OtherCard: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();

  // 监听运行位置
  const runPathValue = Form.useWatch("runPath", form);

  // 根据 runPath/架构设置主板类型，避免在渲染阶段调用 setFieldsValue
  useEffect(() => {
    const runPath = form.getFieldValue("runPath")?.[0];
    const isArm =
      runPath?.architecture === CpuArchitecture.aarch64 ||
      source?.architecture === CpuArchitecture.aarch64;
    if (isArm) {
      form.setFieldsValue({ motherboardType: "q35" });
    }
  }, [form, source, runPathValue]);

  return (
    <div>
      <Item noStyle shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {() => {
          const runPath = form.getFieldValue("runPath")?.[0];
          const isArm =
            runPath?.architecture === CpuArchitecture.aarch64 ||
            source?.architecture === CpuArchitecture.aarch64;
          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.other.motherboard.type",
                defaultMessage: "Motherboard Type",
              })}
              name="motherboardType"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "zsv.create.instance.other.motherboard.type.tooltip",
                    defaultMessage: `### Motherboard Type

Specify the default motherboard type when starting a virtual machine. Default: i440fx.

- i440fx: A relatively traditional type of virtual machine motherboard that emulates the Intel i440FX chipset. This option provides basic BIOS compatibility for the virtual machine but has relatively weak support for hardware virtualization.
- q35: A virtual motherboard specification developed by Intel that provides more hardware virtualization features. This option supports more advanced hardware virtualization features.`,
                  })}
                </ReactMarkdown>
              }
            >
              <Select width={200}>
                {(isArm
                  ? motherboardOptions.filter((t) => t === "q35")
                  : motherboardOptions
                ).map((t) => (
                  <Option value={t} key={t}>{`${t}`}</Option>
                ))}
              </Select>
            </Item>
          );
        }}
      </Item>
    </div>
  );
};

export default React.memo(OtherCard);
