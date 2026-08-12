import { RadioGroup } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { InputDebounce, TextArea } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { VmSchedulingRuleMode } from "@zstack/zsphere-types";
import type { VmSchedulingRule } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { renderVmSchedulingRuleType } from "zsv_reliability_shared/vm-scheduling-rule/vm-group/utils";

import style from "./style.module.less";

const { Item } = Form;
interface IProps {
  form: any;
  current?: VmSchedulingRule;
}

const BasicPart: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { commonNameRules, commonDescriptionRules } = useValidator(intl);

  return (
    <div className={style.card} id="vmSchedulingRuleModal2">
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={commonNameRules}
      >
        <InputDebounce className={style["width-320"]} />
      </Item>

      <Item
        name="description"
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
        rules={commonDescriptionRules}
      >
        <TextArea
          rows={3}
          isShowLimit
          maxLength={256}
          className={style["width-320"]}
        />
      </Item>

      <Item
        name="rule"
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
        {current ? renderVmSchedulingRuleType(intl, current) : ""}
      </Item>
      <Item
        name="mode"
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
              label: intl.formatMessage({
                id: "vmSchedulingRuleMode.force",
                defaultMessage: "Hard",
              }),
            },
            {
              value: VmSchedulingRuleMode.SOFT,
              label: intl.formatMessage({
                id: "vmSchedulingRuleMode.priority",
                defaultMessage: "Soft",
              }),
            },
          ]}
        />
      </Item>
    </div>
  );
};

export default React.memo(BasicPart);
