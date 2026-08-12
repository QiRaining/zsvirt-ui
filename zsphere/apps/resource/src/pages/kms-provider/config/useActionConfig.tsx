import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/kms-provider";
import { bus } from "@zstack/zsphere-utils";
import { useEffect } from "react";
import { useIntl } from "react-intl";

import {
  validateNKP,
  validateSetDefault,
  useValidateDelete,
} from "../action/validators";

const GET_DEFAULT_KMS_PROVIDER = gql`
  query getDefaultKmsProvider {
    kmsProviderList(conditions: [], limit: 100) {
      list {
        uuid
        type
        backedUp
        connected
        trustState
        isDefault
      }
    }
  }
`;

export default () => {
  const intl = useIntl();
  const validateDelete = useValidateDelete();

  const { data: defaultKmsData, refetch } = useQuery(GET_DEFAULT_KMS_PROVIDER, {
    fetchPolicy: "cache-and-network",
  });
  useEffect(() => {
    const handler = () => refetch();
    bus.addListener("action:refetch:KmsProvider", handler);
    return () => bus.removeListener("action:refetch:KmsProvider", handler);
  }, [refetch]);

  const defaultKmsProvider = defaultKmsData?.kmsProviderList?.list?.find(
    (item: any) => item.isDefault,
  );

  const rekeyDisabled = !defaultKmsProvider
    ? true
    : defaultKmsProvider.type === "NKP" && !defaultKmsProvider.backedUp
      ? true
      : defaultKmsProvider.type === "KMS" &&
          (!defaultKmsProvider.connected ||
            defaultKmsProvider.trustState !== "MUTUAL_TRUSTED")
        ? true
        : false;

  return useActionConfig([
    {
      key: "create",
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/create").default,
    },
    {
      key: "backup",
      ActionWrapper: require("../action/backup").default,
      validators: [validateNKP],
      tooltip: {
        title: intl.formatMessage({
          id: "nkp.action.disabled.tooltip",
          defaultMessage: "You can perform backup operations only on native key providers.",
        }),
      },
    },
    {
      key: "restore",
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/recover").default,
    },
    {
      key: "edit.config",
      ActionWrapper: require("../action/update").default,
    },
    {
      key: "set.default",
      ActionWrapper: require("../action/set-default").default,
      validators: [validateSetDefault],
    },
    {
      key: "delete",
      ActionWrapper: require("../action/delete").default,
      validators: [validateDelete],
      tooltip: {
        title: intl.formatMessage({
          id: "delete.kms.provider.disabled.tooltip",
          defaultMessage: "When multiple key provider exist, the default key provider cannot be deleted. Set another key provider as default before attempting to delete this one.",
        }),
      },
    },
    {
      key: "update.data.encryption.key",
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/rekey").default,
      disabled: rekeyDisabled,
    },
  ]);
};
