import { gql } from "@apollo/client";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  IscsiServer as IIscsiServer,
  RefreshIscsiServerPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const _refreshIscsiServers = gql`
  mutation refreshIscsiServers($input: RefreshIscsiServerInput!) {
    refreshIscsiServers(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IIscsiServer>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    setVisible(false);
    const payload: RefreshIscsiServerPayload[] = selectedList.map(
      ({ uuid }) => ({
        uuid,
      }),
    );
    doAction({
      mutation: _refreshIscsiServers,
      payload,
      name: intl.formatMessage({
        id: "sync.iscsiServerStorage",
        defaultMessage: "Sync iSCSI Storage",
      }),
      type: "IscsiServer",
      total: selectedList?.length || 1,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogWeak
      type="warning"
      title={String(
        intl.formatMessage({
          id: "iSCSIServer.modal.title.confirm.sync.iscsiServerStorage",
          defaultMessage: "Synchronize iSCSI Storage?",
        }),
      )}
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      onCancel={() => setVisible(false)}
    />
  );
};

export default Action;
