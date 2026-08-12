import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  VmInstance,
  RemoveVmFromVmGroupPayload,
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const Action: React.FC<IActionWrapperProps<VmInstance>> = ({
  source,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();

  const removeVmFromVmGroup = gql`
    mutation removeVmFromVmGroup($input: RemoveVmFromVmGroupInput!) {
      removeVmFromVmGroup(input: $input) {
        actionId
      }
    }
  `;
  const doAction = useAction();
  const vmGroupUuid = source?.uuid;

  const onOk = async () => {
    const payload: RemoveVmFromVmGroupPayload[] = selectedList?.map((item) => ({
      vmUuid: item.uuid,
      vmGroupUuid,
    }));
    doAction({
      mutation: removeVmFromVmGroup,
      payload,
      name: intl.formatMessage({
        id: "remove.vm",
        defaultMessage: "Remove Virtual Machine",
      }),
      total: selectedList?.length,
      type: "VmGroup",
      onFinish: () => {
        setSelectedList?.([]);
        bus.emit("action:refetch:VmInstance");
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vmGroup.modal.remove.vm.alert.warning",
            defaultMessage: `If you remove a virtual machine from the scheduling group, the virtual machine will not be scheduled based on the policies associated with the group. Proceed with caution.`,
          })}
        </ReactMarkdown>
      }
      onConfirm={onOk}
      title={intl.formatMessage({
        id: "vmGroup.modal.title.confirm.remove.vm",
        defaultMessage: "Remove Virtual Machine?",
      })}
      resourceNames={selectedList.map((r) => r.name)}
    />
  );
};

export default Action;
