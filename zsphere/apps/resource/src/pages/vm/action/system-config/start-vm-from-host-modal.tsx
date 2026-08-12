import { gql } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, HostQueryType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { get as _get } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import List from "../../../host/list";

const startVmFromHost = gql`
  mutation startVmFromHost($input: StartVmInstanceFromHostInput!) {
    startVmFromHost(input: $input) {
      actionId
    }
  }
`;
const StartVmFromHostAction: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const vmInstanceUuid = selectedList?.[0]?.uuid;

  const onOk = (values: any) => {
    doAction({
      mutation: startVmFromHost,
      payload: {
        uuid: vmInstanceUuid,
        hostUuid: _get(values, [0, "uuid"]),
      },
      name: intl.formatMessage({
        id: "start.vm.fromHost",
        defaultMessage: "Specify Host to Start",
      }),
      total: selectedList.length,
      type: "VmInstance",
    });
  };

  if (selectedList?.[0]?.vmGroup?.vmSchedulingRuleCount) {
    return (
      <DialogWeak
        title={String(
          intl.formatMessage({
            id: "vm.modal.title.cannot.startVmFromSepcifiedHost",
            defaultMessage: "Cannot Specify Host to Start",
          }),
        )}
        type="warning"
        onConfirm={() => {
          setVisible(false);
        }}
        visible={visible}
        setVisible={setVisible}
        description={intl.formatMessage({
          id: "vm.modal.startVmFromSepcifiedHost.attachedVmSchedulingRule",
          defaultMessage:
            "The virtual machine is associated with a VM scheduling policy and is scheduled primarily based on the policy. You cannot specify a host for the virtual machine to run.",
        })}
      />
    );
  }

  return (
    <ModalSelect
      title={intl.formatMessage({
        id: "virtualization.assign.start.host",
        defaultMessage: "Specify Host to Start",
      })}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      selectType="radio"
      showSelect={false}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <List
        view="select"
        defaultQuery={{
          extraConditions: [
            { key: "vmInstanceUuid", op: Op.eq, value: vmInstanceUuid },
          ],
          type: HostQueryType.StartingVmCandidate,
        }}
      />
    </ModalSelect>
  );
};

export default StartVmFromHostAction;
