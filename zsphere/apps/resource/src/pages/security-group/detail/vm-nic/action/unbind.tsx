import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  VmNic as IVmNic,
  SecurityGroup as ISecurityGroup,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const deleteVmNicFromSecurityGroup = gql`
  mutation deleteVmNicFromSecurityGroup(
    $input: DeleteVmNicFromSecurityGroupInput!
  ) {
    deleteVmNicFromSecurityGroup(input: $input) {
      actionId
    }
  }
`;

interface IProps extends Omit<IActionWrapperProps<IVmNic>, "view"> {
  securityGroup: ISecurityGroup;
}

const DeleteVmNicFromSecurityGroupAction: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  securityGroup: current,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    doAction({
      mutation: deleteVmNicFromSecurityGroup,
      payload: [
        {
          securityGroupUuid: current.uuid,
          vmNicUuids: selectedList.map(({ uuid }) => uuid),
        },
      ],
      name: intl.formatMessage({
        id: "unbind.vmNic",
        defaultMessage: "Disassociate VM NIC",
      }),
      total: 1,
      type: "VmNic",
      onFinish: () => {
        setSelectedList?.([]);
        setVisible?.(false);
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "securityGroup.modal.title.confirm.unbind.vmNic",
        defaultMessage: "Disassociate VM NIC?",
      })}
      resourceNames={(selectedList ?? []).map(
        (item) => item.internalName ?? item.name ?? item.uuid,
      )}
      onConfirm={onOk}
    />
  );
};

export default DeleteVmNicFromSecurityGroupAction;
