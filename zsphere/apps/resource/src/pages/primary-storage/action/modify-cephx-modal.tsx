import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { PrimaryStorageStatus } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

const updatePrimaryStorageCephx = gql`
  mutation updatePrimaryStorageCephx($input: UpdatePrimaryStorageCephxInput!) {
    updatePrimaryStorageCephx(input: $input) {
      actionId
    }
  }
`;

const reconnectPrimaryStorageList = gql`
  mutation reconnectPrimaryStorageList($input: ReconnectPrimaryStorageInput!) {
    reconnectPrimaryStorageList(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [cephxReconnect, setCephxReconnect] = useState(false);

  const onOk = () => {
    const payload = {
      uuid: selectedList?.[0]?.uuid,
      cephx: !selectedList?.[0]?.systemTag?.nocephx,
      cephxReconnect,
    };
    doAction({
      mutation: updatePrimaryStorageCephx,
      payload,
      name: intl.formatMessage({
        id: "set.cephx",
        defaultMessage: "Set Key Authentication",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        if (cephxReconnect) {
          doAction({
            mutation: reconnectPrimaryStorageList,
            payload: selectedList?.map((ps: IPrimaryStorage) => ({
              uuid: ps?.uuid,
            })),
            name: intl.formatMessage({
              id: "reconnect.primaryStorage",
              defaultMessage: "Reconnect Data Storage",
            }),
            total: 1,
            middleState: {
              type: "PrimaryStorageVO",
              field: "status",
              data: { status: PrimaryStorageStatus.Connecting },
              uuids: selectedList.map((item) => item.uuid),
            },
            onFinish: () => {
              refetch?.();
            },
          });
        }
      },
    });
    setVisible(false);
  };

  return (
    <DialogBase
      title={intl.formatMessage({
        id: "set.cephx",
        defaultMessage: "Set Key Authentication",
      })}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button variant="subtle" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button variant="primary" onClick={onOk} style={{ marginLeft: 8 }}>
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </div>
      }
    >
      <p style={{ marginBottom: 12 }}>
        {intl.formatMessage({
          id: "primaryStorage",
          defaultMessage: "Data Storage",
        })}
        : {selectedList?.[0]?.name}
      </p>
      <label
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        <input
          type="checkbox"
          checked={cephxReconnect}
          onChange={(e) => setCephxReconnect(e.target.checked)}
        />
        <span style={{ marginLeft: 8 }}>
          {intl.formatMessage({
            id: "immerReconnectPrimaryStorage",
            defaultMessage: "Reconnect Data Storage",
          })}
        </span>
      </label>
      {cephxReconnect && (
        <p
          style={{
            marginTop: 8,
            color: "var(--color-warning-600)",
            fontSize: 12,
          }}
        >
          {intl.formatMessage({
            id: "immerReconnectPrimaryStorage.tips",
            defaultMessage: "You cannot operate on resources of this data storage while reconnection is in progress.",
          })}
        </p>
      )}
    </DialogBase>
  );
};

export default Action;
