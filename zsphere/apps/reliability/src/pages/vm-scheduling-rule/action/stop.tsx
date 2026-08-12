import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmSchedulingRuleState } from "@zstack/zsphere-types";
import type {
  ChangeVmSchedulingRuleStatePayload,
  VmSchedulingRule,
} from "@zstack/zsphere-types/graphql";
import {
  map as _map,
  filter as _filter,
  sumBy as _sumBy,
  uniqBy as _uniqBy,
} from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const StopAction: React.FC<IActionWrapperProps<VmSchedulingRule>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const changeVmSchedulingRuleState = gql`
    mutation changeVmSchedulingRuleState(
      $input: ChangeVmSchedulingRuleStateInput!
    ) {
      changeVmSchedulingRuleState(input: $input) {
        actionId
      }
    }
  `;

  const onOk = () => {
    const uuids = _map(
      _filter(selectedList, ["state", VmSchedulingRuleState.Enabled]),
      "uuid",
    );
    const payload: ChangeVmSchedulingRuleStatePayload[] = uuids?.map((uuid) => {
      return { uuid, state: "disable" };
    });

    doAction({
      mutation: changeVmSchedulingRuleState,
      payload,
      name: intl.formatMessage({
        id: "disable.vmSchedulingRule",
        defaultMessage: "Disable VM Scheduling Policy",
      }),
      total: uuids?.length,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP1
      title={intl.formatMessage({
        id: "vmSchedulingRule.modal.title.confirm.disable.vmSchedulingRule",
        defaultMessage: "Disable VM Scheduling Policy?",
      })}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vmSchedulingRule.modal.stop.alert.danger",
            defaultMessage: `If you disable the VM scheduling policy, the associated virtual machines will not be scheduled based on the policy. Proceed with caution.`,
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
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default StopAction;
