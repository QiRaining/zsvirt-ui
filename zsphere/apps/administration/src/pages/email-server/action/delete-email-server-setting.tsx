import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  DeleteSNSEmailPlatformPayload,
  EmailServerSetting as IEmailServerSetting,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { deleteSNSEmailServer } from "../../../gql/email-server-setting.gql";
import { EmailServerContext } from "../hook";

const DeleteActionModal: React.FC<IActionWrapperProps<IEmailServerSetting>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { store, setStore } = React.useContext(EmailServerContext);

  const onOk = async () => {
    if (selectedList?.length) {
      setVisible(false);
      const payload: DeleteSNSEmailPlatformPayload[] = selectedList.map(
        ({ uuid }) => ({ uuid }),
      );
      doAction({
        mutation: deleteSNSEmailServer,
        name: intl.formatMessage({
          id: "delete.emailServer",
          defaultMessage: "Delete Email Server",
        }),
        payload,
        type: "EmailServerSetting",
        total: selectedList.length,
        onFinish: () => {
          if (
            store?.emailServer?.uuid &&
            selectedList.some((item) => item.uuid === store?.emailServer?.uuid)
          ) {
            setStore({
              ...store,
              emailServer: undefined,
            });
          }
          refetch?.();
          setSelectedList?.([]);
        },
      });
    }
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "emailServer.modal.title.confirm.delete.emailServer",
        defaultMessage: "Delete Email Server?",
      })}
      resourceType={intl.formatMessage({
        id: "emailServer",
        defaultMessage: "Email Server",
      })}
      resourceNames={(selectedList || []).map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteActionModal;
