import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ExternalPrimaryStoragePool,
  DeleteExternalPrimaryStoragePoolInput,
} from "@zstack/zsphere-types/graphql";
import { pick as _pick } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { deleteExternalPrimaryStoragePool } from "../../../gql/external-primary-storage-pool.gql";

const Delete: React.FC<IActionWrapperProps<ExternalPrimaryStoragePool>> = ({
  source,
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    doAction<DeleteExternalPrimaryStoragePoolInput["payload"]>({
      mutation: deleteExternalPrimaryStoragePool,
      payload: {
        uuid: source?.uuid,
        config: {
          pools: (
            (source?.addonInfo?.pools as ExternalPrimaryStoragePool[]) || []
          )
            .filter((pool) => pool.name !== selectedList[0].name)
            .map((pool) => _pick(pool, ["name", "aliasName"])),
        },
      },
      name: intl.formatMessage({
        id: "delete.vhostPrimaryStoragePool",
        defaultMessage: "Delete Storage Pool",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        setVisible(false);
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "vhostPrimaryStoragePool.modal.title.confirm.delete.cephPrimaryStoragePool",
        defaultMessage: "Delete Storage Pool?",
      })}
      bannerMessage={intl.formatMessage({
        id: "vhostPrimaryStoragePool.modal.delete.alert.danger",
        defaultMessage: "Deleting a storage pool removes all records of the resources stored in the pool. Proceed with caution.",
      })}
      resourceNames={selectedList?.map((pool) => pool.name) || []}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default Delete;
