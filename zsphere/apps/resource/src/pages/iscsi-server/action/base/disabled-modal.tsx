import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { updateIscsiServers } from "../../../../gql/iscsi-server.gql";

const Action: React.FC<IActionWrapperProps<IIscsiServer>> = ({
  visible,
  refetch,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid, state: "Disabled" };
    });
    doAction({
      mutation: updateIscsiServers,
      payload,
      name: intl.formatMessage({
        id: "disable.iscsiServerStorage",
        defaultMessage: "Disable iSCSI Storage",
      }),
      total: payload?.length || 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
      type: "IscsiServer",
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "iscsiStorage.modal.title.confirm.disable.iscsiStorage",
        defaultMessage: "Disable iSCSI Storage?",
      })}
      visible={visible}
      setVisible={setVisible}
      resourceType={intl.formatMessage({
        id: "iscsiServerStorage",
        defaultMessage: "iSCSI Storage",
      })}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
