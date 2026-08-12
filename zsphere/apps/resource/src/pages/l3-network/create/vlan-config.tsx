import { RadioGroup } from "@zstack/design";
import { usePortGroupVlanMode } from "@zstack/virtualization-resource/src/pages/l3-network/hook";
import { Form } from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import { PortGroupVlanMode } from "@zstack/zsphere-types";
import { InputNumber } from "antd";
import type { Rule } from "antd/es/form";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  vlanRules?: Rule[];
}

const VlanConfig: React.FC<IProps> = ({ vlanRules = [] }) => {
  const intl = useIntl();
  const { portGroupVlanModeList } = usePortGroupVlanMode();

  const { isRequired } = useValidator(intl);

  return (
    <>
      <Form.Item
        name="vlanMode"
        label={intl.formatMessage({
          id: "vlanMode",
          defaultMessage: "VLAN Type",
        })}
      >
        <RadioGroup
          options={portGroupVlanModeList.map((it) => ({
            value: it.key,
            label: it.label,
          }))}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.vlanMode !== curr.vlanMode}
      >
        {({ getFieldValue }) => {
          const vlanMode = getFieldValue("vlanMode");

          if (vlanMode !== PortGroupVlanMode.NONE) {
            return (
              <Form.Item
                name="vlan"
                label="VLAN ID"
                required
                rules={[isRequired(IIsRequiredType.input), ...vlanRules]}
              >
                <InputNumber className="width-80" precision={0} />
              </Form.Item>
            );
          }

          return null;
        }}
      </Form.Item>
    </>
  );
};

export default VlanConfig;
