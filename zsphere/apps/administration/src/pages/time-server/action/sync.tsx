import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { useBoolean } from "ahooks";
import type { FC } from "react";
import React, { Fragment } from "react";
import { useIntl } from "react-intl";

const syncTimeServer = gql`
  mutation syncTimeServer($input: SyncTimeServerInput!) {
    syncTimeServer(input: $input) {
      actionId
    }
  }
`;

const SyncAction: FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  refetch,
}) => {
  const [modalFailedVisible, { toggle: setModalFailedVisible }] =
    useBoolean(false);
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    doAction({
      mutation: syncTimeServer,
      payload: {},
      name: intl.formatMessage({
        id: "sync.ntp.action",
        defaultMessage: "Sync Time",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <Fragment>
      <DialogWeak
        title={intl.formatMessage({
          id: "sync.ntp.modal.action.title",
          defaultMessage: "Sync Time?",
        })}
        type="warning"
        visible={visible}
        setVisible={setVisible}
        onConfirm={onOk}
        description={intl.formatMessage({
          id: "sync.ntp.modal.action.info",
          defaultMessage:
            "If the system time deviates significantly from the NTP time server, you can forcefully synchronize the time, avoiding the long duration of gradual adjustment.",
        })}
      />
      <DialogWeak
        title={intl.formatMessage({
          id: "sync.ntp.modal.fail.title",
          defaultMessage: "Cannot Sync Time",
        })}
        type="warning"
        visible={modalFailedVisible}
        setVisible={setModalFailedVisible}
        onConfirm={() => setModalFailedVisible(false)}
        description={intl.formatMessage({
          id: "sync.ntp.modal.fail.info",
          defaultMessage:
            "The distributed storage is in abnormal state. Synchronize time after the distributed storage returns to normal state.",
        })}
        footer={
          <Button
            variant="primary"
            onClick={() => setModalFailedVisible(false)}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      />
    </Fragment>
  );
};

export default SyncAction;
