import { gql } from "@apollo/client";
import { Modal } from "@zstack/zsphere-components";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  BackupStorage as IBackupStorage,
  ReclaimSpaceFromImageStorePayload as IReclaimSpaceFromImageStorePayload,
} from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

interface IInventory {
  freedSpaceInBytes: number;
}

const ReclaimAction: React.FC<IActionWrapperProps<IBackupStorage>> = ({
  visible,
  refetch,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const filterSelectedList = selectedList.filter(
    (item) => item.type === "ImageStoreBackupStorage",
  );

  const reclaimSpaceFromImageStore = gql`
    mutation reclaimSpaceFromImageStore(
      $input: ReclaimSpaceFromImageStoreInput!
    ) {
      reclaimSpaceFromImageStore(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    const uuids = filterSelectedList?.map((item) => item.uuid) || [];
    const payload: IReclaimSpaceFromImageStorePayload[] = uuids.map((uuid) => {
      return { uuid };
    });
    const inventoriesResult: IInventory[] = [];

    doAction({
      mutation: reclaimSpaceFromImageStore,
      payload,
      name: intl.formatMessage({
        id: "data.reclaim",
        defaultMessage: "Cleanup Data",
      }),
      total: filterSelectedList.length,
      onProgress: (result: ITaskResult) => {
        if (result.inventory) {
          inventoriesResult.push(result.inventory);
        }
      },
      onFinish: (_result: IActionResult) => {
        if (inventoriesResult.length === 0) {
          return;
        }
        const total = inventoriesResult?.reduce<number>((sum, current) => {
          return sum + current.freedSpaceInBytes;
        }, 0);
        Modal.renderResult({
          title: intl.formatMessage({
            id: `clear.data`,
            defaultMessage: "Clear Data",
          }),
          resultTitle: intl.formatMessage(
            {
              id: "cleanup.success.tip",
              defaultMessage: "Released {total} space.",
            },
            {
              total: formatStorage(total),
            },
          ),
          resultType: "success",
          okText: intl.formatMessage({ id: "ok", defaultMessage: "OK" }),
          onOk() {
            refetch?.();
          },
        });

        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "backupStorage.modal.reclaim.data.alert.info",
            defaultMessage: `1. The expunged, invalid data will be removed in the image storage to release more storage spaces.
2. During data cleanup, avoid performing any data write operations.`,
          })}
        </ReactMarkdown>
      }
      title={intl.formatMessage({
        id: "backupStorage.modal.title.confirm.clear.data",
        defaultMessage: "Cleanup Data?",
      })}
      resourceNames={(filterSelectedList || []).map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default ReclaimAction;
