import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  DeleteLogServerPayload,
  LogServer as ILogServer,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { deleteLogServer } from "../../../gql/log-server.gql";
import { LogServerContext } from "../hook";

const DeleteActionModal: React.FC<IActionWrapperProps<ILogServer>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const doAction = useAction();
  const { store, setStore } = React.useContext(LogServerContext);

  const onOk = async () => {
    setVisible(false);

    const payload: DeleteLogServerPayload[] = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: deleteLogServer,
      payload,
      name: intl.formatMessage({
        id: "delete.log.server",
        defaultMessage: "Delete Log Server",
      }),
      type: "LogServer",
      total: selectedList.length,
      onFinish: () => {
        if (
          store?.logServer?.uuid &&
          selectedList.some((item) => item.uuid === store?.logServer?.uuid)
        ) {
          setStore({
            ...store,
            logServer: undefined,
          });
        }
        refetch?.();
        setSelectedList?.([]);
      },
    });

    navigate("/virtualization-administration/log-server", { replace: true });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "logServer.modal.title.confirm.delete.logServer",
        defaultMessage: "Delete Log Server?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      bannerMessage={intl.formatMessage({
        id: "log.server.action.delete.alert",
        defaultMessage: "Delete Log Server",
      })}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteActionModal;
