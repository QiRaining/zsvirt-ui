import { RadioGroup } from "@zstack/design";
import {
  Form,
  TextArea,
  Select,
  AuthHander,
  useAuth,
  InputDebounce,
  ZSVForm,
} from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { VmSchedulingRuleMode } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import {
  renderVmSchedulingRuleMode,
  translateVmSchedulingRuleTypeOptions,
} from "zsv_reliability_shared/vm-scheduling-rule/vm-group/utils";

import { VmSchedulingRuleType } from "../../vm-scheduling-rule/create/types";
import { typeAuthMap } from "../config/useColumnConfig";

const { Item } = Form;

const { Card } = ZSVForm;

const BasicPart: React.FC = () => {
  const intl = useIntl();
  const { commonNameRules, commonDescriptionRules } = useValidator(intl);
  const vmSchedulingRuleTypeOptions =
    translateVmSchedulingRuleTypeOptions(intl);
  const { hasAuth } = useAuth();

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={commonNameRules}
      >
        <InputDebounce className="width-320" />
      </Item>

      <Item
        name="description"
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
        rules={commonDescriptionRules}
      >
        <TextArea rows={3} isShowLimit maxLength={256} className="width-320" />
      </Item>

      <Form.Item
        name="type"
        label={intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vmSchedulingRule.field.type.tooltip",
              defaultMessage: `### Type

Supports four types of VM scheduling policies: VM Exclusive from Each Other, VM Affinitive to Each Other, VMs Affinitive to Hosts, and VMs Exclusive from Hosts. Each policy has two execution mechanisms: Hard and Soft. Virtual machines are scheduled based on their associated scheduling policies and policy execution mechanisms:

- VM Exclusive from Each Other: Virtual machines in the same VM scheduling group should not/must not run on the same host.
- VM Affinitive to Each Other: Virtual machines in the same VM scheduling group should/must run on the same host.
- VMs Exclusive from Hosts: Given any one of the virtual machines in a VM scheduling group and any one of the hosts in a host scheduling group, the virtual machine should not/must not run the host.
- VMs Affinitive to Hosts: Given any one of the virtual machines in a VM scheduling group and any one of the hosts in a host scheduling group, the virtual machine should/must run the host.`,
            })}
          </ReactMarkdown>
        }
      >
        <Select width="l">
          {vmSchedulingRuleTypeOptions.map((it) => {
            if (
              [
                VmSchedulingRuleType.VmAffinityHost,
                VmSchedulingRuleType.VmAntiAffinityHost,
              ].includes(it.value)
            ) {
              return (
                hasAuth(typeAuthMap[it.value]) && (
                  <Select.Option key={it.value} value={it.value}>
                    <AuthHander {...typeAuthMap[it.value]}>
                      {it.label}
                    </AuthHander>
                  </Select.Option>
                )
              );
            }
            return (
              <Select.Option key={it.value} value={it.value}>
                {it.label}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item
        name="excuteMode"
        label={intl.formatMessage({
          id: "excuteMode",
          defaultMessage: "Execution Mechanism",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vmSchedulingRule.field.excuteMode.tooltip",
              defaultMessage: `### Execution Mechanism

A VM scheduling policy can be executed based on either of the following mechanisms:

- Hard: Virtual machines are forcibly assigned hosts based on the associated VM scheduling policies. For example, if you associate the VM Exclusive from Each Other policy with a VM scheduling group and select the Hard mechanism for the policy, any two of the virtual machines in the scheduling group are not allowed to run on the same host. If no host is available to be scheduled based on the policy for a virtual machine, the virtual machine will end up failure upon startup.

- Soft: Virtual machines are primarily assigned hosts based on the associated VM scheduling policies. For example, if you associate the VM Exclusive from Each Other policy with a VM scheduling group and select the Soft mechanism for the policy, any two of the virtual machines in the scheduling group will primarily not run on the same host. If no host is available to be scheduled based on the policy for a virtual machine, the virtual machine will attempt to run on a host that does not satisfy the policy.
`,
            })}
          </ReactMarkdown>
        }
      >
        <RadioGroup
          options={[
            {
              value: VmSchedulingRuleMode.HARD,
              label: renderVmSchedulingRuleMode(
                intl,
                VmSchedulingRuleMode.HARD,
              ),
            },
            {
              value: VmSchedulingRuleMode.SOFT,
              label: renderVmSchedulingRuleMode(
                intl,
                VmSchedulingRuleMode.SOFT,
              ),
            },
          ]}
        />
      </Form.Item>
    </Card>
  );
};

export default React.memo(BasicPart);
