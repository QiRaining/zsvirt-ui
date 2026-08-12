import { CephPrimaryStoragePoolType } from "@zstack/zsphere-types";
import type { CephPrimaryStoragePool as ICephPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import { includes } from "lodash-es";

// verifySingle
export const verifySingle = async (selectedList: ICephPrimaryStoragePool[]) => {
  return selectedList.length === 1;
};

// verifyMulti
export const verifyMulti = async (
  selectedList: ICephPrimaryStoragePool[],
  source: any,
) => {
  const dataPools = source?.pools?.filter(
    (pool: ICephPrimaryStoragePool) => pool.type === "Data",
  );

  // 批量选择的 pool，都有数据，要禁掉
  if (
    selectedList?.every(
      (pool) => Number(pool.totalCapacity) - Number(pool.availableCapacity) > 0,
    )
  ) {
    return false;
  }

  // 全选，要禁掉
  if (dataPools?.length === selectedList?.length) {
    return false;
  }

  return selectedList.length >= 1;
};

// 删除
export const verifyDelete = async (current: ICephPrimaryStoragePool) => {
  // Data 类型的才能删除
  return includes([CephPrimaryStoragePoolType.Data], current?.type);
};
