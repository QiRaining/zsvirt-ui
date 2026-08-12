import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Host as IHost } from "@zstack/zsphere-types/graphql";
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

const Action: React.FC<IActionWrapperProps<IHost> & IProps> = ({
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
        id: "virtualization.host.action.detach.tag.name",
        defaultMessage: "Unbinding Tag",
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
        id: "virtualization.host.action.detach.tag.title",
        defaultMessage: "Detach Host?",
      })}
    />
  );
};

export default Action;
