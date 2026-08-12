import { gql } from "@apollo/client";
import { Alert, Button, Checkbox, Tooltip } from "@zstack/design";
import { DialogBase, DialogSelectedResource } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import useConfirm from "../../../../utils/use-confirm";
import useModalOpenState from "../../../../utils/use-modal-show-state";

const detachBaremetalPxeServer = gql`
  mutation detachBaremetalPxeServer($input: DetachBaremetalPxeServerInput!) {
    detachBaremetalPxeServer(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IBaremetalPxeServer>> = ({
  refetch,
  source,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  view: _view,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { open, afterClose } = useModalOpenState({ visible });
  const [checked, setChecked] = useState(false);
  const { waitConfirm, confirmModal } = useConfirm({
    alertMessage: intl.formatMessage({
      id: "baremetalPxeServer.modal.title.confirm.delete.baremetalPxeServer",
      defaultMessage: "Delete Deployment Server?",
    }),
    children: intl.formatMessage({
      id: "baremetalPxeServer.modal.delete.alert.danger",
      defaultMessage:
        "Deleting deployment servers will expunge the deploying bare metal instances and disable console access to all deployed bare metal instances. Proceed with caution.",
    }),
    confirmInputText: "Delete",
  });

  const onOk = async (deletePxeServer: boolean) => {
    if (deletePxeServer) {
      await waitConfirm();
    }

    setVisible(false);

    const payload = selectedList?.map((item) => ({
      pxeServerUuid: item?.baremetalPxeServer?.uuid,
      deletePxeServer,
      clusterUuid: item?.uuid,
    }));

    doAction({
      mutation: detachBaremetalPxeServer,
      payload,
      name: intl.formatMessage({
        id: "detach.pxeServer",
        defaultMessage: "Detach Deployment Server",
      }),
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  if (!open) {
    return null;
  }

  return (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "baremetalCluster.modal.title.confirm.detach.pxeServer",
        defaultMessage: "Detach Deployment Server?",
      })}
      footer={
        <>
          <Button variant="subtle" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onOk(checked);
            }}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </>
      }
    >
      <Alert variant="error" className="mb-4">
        {intl.formatMessage({
          id: "baremetalCluster.modal.detach.pxeServer.alert.danger",
          defaultMessage:
            "Detaching deployment servers will expunge the deploying bare metal instances and disable console access to all deployed bare metal instances. Proceed with caution.",
        })}
      </Alert>
      <DialogSelectedResource
        names={selectedList.map((item) => item.name ?? item.uuid)}
      />
      <Tooltip
        content={intl.formatMessage({
          id: "baremetalCluster.modal.detach.pxeServer.extra.delete.tips",
          defaultMessage: "Selecting this checkbox will delete the deployment server.",
        })}
      >
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
          />
          {intl.formatMessage({
            id: "baremetalCluster.modal.detach.pxeServer.extra.delete",
            defaultMessage: "Also delete the deployment server",
          })}
        </label>
      </Tooltip>
      {confirmModal}
    </DialogBase>
  );
};

export default Action;
