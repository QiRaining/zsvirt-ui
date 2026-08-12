import { useActionConfig } from "@zstack/zsphere-engine/src/ceph-primary-storage-pool";
import type { CephPrimaryStoragePool as ICephPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { verifySingle, verifyMulti, verifyDelete } from "../action/validator";

export default () => {
  const intl = useIntl();

  return useActionConfig<ICephPrimaryStoragePool>([
    {
      key: "virtualization.add.storagePool",
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/add-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "set.displayName",
      ActionWrapper: require("../action/update-modal").default,
    },
    {
      preValidators: [verifyMulti],
      validators: [verifyDelete],
      key: "virtualization.delete.pool",
      ActionWrapper: require("../action/delete-modal").default,
      tooltip({ selectedList, source }) {
        const item = selectedList?.[0];
        if (item?.type !== "Data") {
          return;
        }

        const dataPools = source?.pools?.filter(
          (pool: ICephPrimaryStoragePool) => pool.type === "Data",
        );

        // 全选
        if (dataPools?.length === selectedList?.length) {
          return {
            title: intl.formatMessage({
              id: "cephPrimaryStoragePool.delete_button_disabled.at_least_one",
              defaultMessage: "Please keep at least one storage pool.",
            }),
          };
        }

        // 批量选择的 pool，都有数据
        if (
          selectedList?.every(
            (pool) => Math.floor(Number(pool.diskUtilization)) > 0,
          )
        ) {
          return {
            title: intl.formatMessage({
              id: "cephPrimaryStoragePool.delete_button_disabled.all_existed_data",
              defaultMessage: "Data detected in the selected storage pool. Deletion is not possible.",
            }),
          };
        }

        // 选择的 pool，有数据
        if (Number(item?.totalCapacity) - Number(item?.availableCapacity) > 0) {
          return {
            title: intl.formatMessage({
              id: "cephPrimaryStoragePool.delete_button_disabled.existed_data",
              defaultMessage: "Data detected in this storage pool, unable to delete...",
            }),
          };
        }
      },
    },
  ]);
};
