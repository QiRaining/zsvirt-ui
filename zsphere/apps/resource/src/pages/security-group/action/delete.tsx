import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SecurityGroup as ISecurityGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation } from "react-router";

const deleteSecurityGroup = gql`
  mutation deleteSecurityGroup($input: DeleteSecurityGroupInput!) {
    deleteSecurityGroup(input: $input) {
      actionId
    }
  }
`;

interface IProps {
  refetch?: Function;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: ISecurityGroup[];
  setSelectedList?: (selectedList: ISecurityGroup[]) => void;
}

const DeleteModal: React.FC<IProps> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const location = useLocation();

  const onOk = () => {
    doAction({
      mutation: deleteSecurityGroup,
      payload: selectedList.map(({ uuid }) => ({
        uuid,
      })),
      name: intl.formatMessage({
        id: "delete.securityGroup",
        defaultMessage: "Delete Security Group",
      }),
      total: selectedList.length,
      type: "SecurityGroup",
      onFinish: () => {
        if (location.pathname.indexOf("/security-group/detail") > -1) {
          navigate("/security-group", { replace: true });
        }
        setSelectedList?.([]);
        setVisible?.(false);
        refetch?.();
      },
    });
  };

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      bannerMessage={intl.formatMessage({
        id: "securityGroup.modal.delete.alert",
        defaultMessage:
          "Deleting a security group also deletes the security rules created in the group. Please exercise caution.",
      })}
      title={intl.formatMessage({
        id: "securityGroup.modal.title.confirm.delete.securityGroup",
        defaultMessage: "Delete Security Group?",
      })}
      resourceType={intl.formatMessage({
        id: "securityGroup",
        defaultMessage: "Security Group",
      })}
      resourceNames={(selectedList ?? []).map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

const DeleteAction: React.FC<IActionWrapperProps<ISecurityGroup>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  return (
    <DeleteModal
      visible={visible}
      setVisible={setVisible}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
    />
  );
};

export default DeleteAction;
