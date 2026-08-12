import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmSchedulingRule } from "@zstack/zsphere-types/graphql";
import { sumBy as _sumBy, uniqBy as _uniqBy } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router";

const Action: React.FC<IActionWrapperProps<VmSchedulingRule>> = ({
  visible,
  setVisible,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();

  const deleteVmSchedulingRule = gql`
    mutation deleteVmSchedulingRule($input: DeleteVmSchedulingRuleInput!) {
      deleteVmSchedulingRule(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: deleteVmSchedulingRule,
      payload,
      name: intl.formatMessage({
        id: "delete.vmSchedulingRule",
        defaultMessage: "Delete VM Scheduling Policy",
      }),
      total: selectedList.length,
      type: "VmSchedulingRule",
      onFinish: () => {
        if (window.location.pathname.includes("/vm-scheduling-rule/detail")) {
          navigate(-1);
        }
      },
    });
  };

  return (
    <DialogP1
      title={intl.formatMessage({
        id: "vmSchedulingRule.modal.title.confirm.delete.vmSchedulingRule",
        defaultMessage: "Delete VM Scheduling Policy?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vmSchedulingRule.modal.delete.alert.danger",
            defaultMessage: `If you delete the VM scheduling policy, the associated virtual machines will not be scheduled based on the policy. Proceed with caution.`,
          })}
        </ReactMarkdown>
      }
      resourceType={intl.formatMessage({
        id: "vmSchedulingRule",
        defaultMessage: "VM Scheduling Policy",
      })}
      relatedResources={[
        {
          name: intl.formatMessage({
            id: "vm",
            defaultMessage: "Virtual Machine",
          }),
          count: _sumBy(
            _uniqBy(
              selectedList?.map((it) => it?.vmGroup),
              "uuid",
            ),
            "vmCount",
          ),
        },
      ]}
      resourceNames={selectedList.map((r) => r.name)}
      onConfirm={onOk}
    />
  );
};

export default Action;
