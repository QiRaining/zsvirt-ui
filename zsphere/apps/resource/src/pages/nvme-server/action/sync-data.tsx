import { gql } from "@apollo/client";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

const refreshNvmeServer = gql`
  mutation refreshNvmeServer($input: RefreshNvmeServerInput!) {
    refreshNvmeServer(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<
  Pick<
    IActionWrapperProps<Partial<any>>,
    "visible" | "setVisible" | "refetch" | "selectedList"
  >
> = ({ refetch, visible, setVisible, selectedList }) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    doAction({
      mutation: refreshNvmeServer,
      payload: {
        uuid: selectedList?.[0]?.uuid,
      },
      type: "NvmeServer",
      name: intl.formatMessage({
        id: "refresh.fiber.channel.storage",
        defaultMessage: "Sync Device Info",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogWeak
      type="warning"
      title={String(
        intl.formatMessage({
          id: "sync.nvme.storage.modal.title",
          defaultMessage: "Synchronize NVMe Storage?",
        }),
      )}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default Action;
