import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Host,
  RemoveHostFromHostGroupPayload,
} from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const Action: React.FC<IActionWrapperProps<Host>> = ({
  source,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();

  const removeHostFromHostGroup = gql`
    mutation removeHostFromHostGroup($input: RemoveHostFromHostGroupInput!) {
      removeHostFromHostGroup(input: $input) {
        actionId
      }
    }
  `;
  const doAction = useAction();
  const hostGroupUuid = source?.uuid;

  const onOk = async () => {
    const payload: RemoveHostFromHostGroupPayload[] = selectedList?.map(
      (item) => ({
        hostUuid: item.uuid,
        hostGroupUuid,
      }),
    );
    doAction({
      mutation: removeHostFromHostGroup,
      payload,
      name: intl.formatMessage({
        id: "remove.host",
        defaultMessage: "Remove Host",
      }),
      total: selectedList?.length,
      type: "HostGroup",
      onFinish: () => {
        setSelectedList?.([]);
        bus.emit("action:refetch:HostVO");
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
            id: "hostGroup.modal.remove.host.alert.warning",
            defaultMessage: `If you remove a host from the scheduling group, conflicts may occur during the execution of the VM scheduling policies associated with the group. Proceed with caution.`,
          })}
        </ReactMarkdown>
      }
      onConfirm={onOk}
      title={intl.formatMessage({
        id: "hostGroup.modal.title.confirm.remove.host",
        defaultMessage: "Remove Host?",
      })}
      resourceNames={selectedList.map((r) => r.name)}
    />
  );
};

export default Action;
