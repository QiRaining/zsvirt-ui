import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVmInstance } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

const detachTag = gql`
  mutation ($input: DetachTagInput!) {
    detachTag(input: $input) {
      actionId
    }
  }
`;
interface IProps {}

const Action: React.FC<IActionWrapperProps<IVmInstance> & IProps> = ({
  source,
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();

  const doAction = useAction();
  const onOk = async () => {
    const resourceUuids = _.map(selectedList, "uuid");
    const payload = [
      {
        resourceUuids,
        tagUuid: source?.uuid,
      },
    ];

    doAction({
      mutation: detachTag,
      payload,
      name: intl.formatMessage({
        id: "virtualization.vm.action.detach.tag.name",
        defaultMessage: "Untag",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      onConfirm={() => {
        onOk();
      }}
      visible={visible}
      setVisible={setVisible}
      resourceNames={(selectedList ?? []).map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "tag",
        defaultMessage: "Tag",
      })}
      title={intl.formatMessage({
        id: "virtualization.vm.action.detach.tag.title",
        defaultMessage: "Disassociate Virtual Machine?",
      })}
    />
  );
};

export default Action;
