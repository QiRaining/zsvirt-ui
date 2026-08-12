import type {
  ExternalPrimaryStoragePool,
  PrimaryStorage,
} from "@zstack/zsphere-types/graphql";

// verifySingle
export const verifySingle = async (
  selectedList: ExternalPrimaryStoragePool[],
) => {
  return selectedList.length === 1;
};

// verifyMulti
export const verifyMulti = async (
  selectedList: ExternalPrimaryStoragePool[],
) => {
  return selectedList.length >= 1;
};

export const verifyAdd = async (
  selectedList: ExternalPrimaryStoragePool[],
  source: PrimaryStorage,
) => {
  if (!source) {
    return false;
  }
  // 本期暂时只支持添加一个 pool
  //
  if (source.config?.pools?.length === 1) {
    return false;
  }

  return true;
};
