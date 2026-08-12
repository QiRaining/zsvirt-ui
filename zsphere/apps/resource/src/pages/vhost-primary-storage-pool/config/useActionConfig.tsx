import { useActionConfig } from "@zstack/zsphere-engine/src/vhost-primary-storage-pool";
import type { ExternalPrimaryStoragePool } from "@zstack/zsphere-types/graphql";

import { verifySingle, verifyMulti, verifyAdd } from "../action/validator";

export default () => {
  return useActionConfig<ExternalPrimaryStoragePool>([
    {
      key: "virtualization.add.storagePool",
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/add").default,
      preValidators: [verifyAdd],
      // 暂时注释掉，以免后续又需要
      // tooltip({ source }) {
      //   if (source.config?.pools?.length === 1) {
      //     return intl.formatMessage({
      //       id: 'add.pool.only_support_one',
      //       defaultMessage: '本期暂时只支持添加一个 Vhost 存储池'
      //     })
      //   }
      // }
    },
    {
      preValidators: [verifySingle],
      key: "virtualization.set.displayName",
      ActionWrapper: require("../action/update").default,
    },
    {
      preValidators: [verifyMulti],
      validators: [],
      key: "virtualization.delete",
      ActionWrapper: require("../action/delete").default,
    },
  ]);
};
