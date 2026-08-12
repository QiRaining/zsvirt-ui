import {
  Constant,
  Tag,
  Text,
  TableDetailLink,
} from "@zstack/zsphere-components";
import { ConstantType, ConstantEnum } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/kms-provider";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export default () => {
  const intl = useIntl();

  return useColumnConfig([
    {
      key: "name",
      render: (current) => (
        <div className={style.nameColumn}>
          <Text value={current.name}>
            <TableDetailLink currentRow={current}>
              {current.name}
            </TableDetailLink>
          </Text>
          {current.isDefault && (
            <Tag round level="weak" className={style.defaultTag}>
              {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
            </Tag>
          )}
        </div>
      ),
    },
    {
      key: "type",
      filters: [
        {
          text: intl.formatMessage({
            id: "kmsProvider.type.builtin",
            defaultMessage: "Native Key Provider",
          }),
          value: "NKP",
        },
        {
          text: intl.formatMessage({
            id: "kmsProvider.type.kms",
            defaultMessage: "Standard Key Provider",
          }),
          value: "KMS",
        },
      ],
      formatter: (current) =>
        current.type === "NKP"
          ? intl.formatMessage({
              id: "kmsProvider.type.builtin",
              defaultMessage: "Native Key Provider",
            })
          : intl.formatMessage({
              id: "kmsProvider.type.kms",
              defaultMessage: "Standard Key Provider",
            }),
    },
    {
      key: "status",
      render: (current) => {
        if (current.type === "NKP") {
          return (
            <Constant
              enumType={ConstantType.NkpBackupStatus}
              value={
                current.backedUp
                  ? ConstantEnum.NkpBackedUp
                  : ConstantEnum.NkpNotBackedUp
              }
            />
          );
        }
        return (
          <div className={style.statusColumn}>
            <Constant
              enumType={ConstantType.KmsConnectionStatus}
              value={
                current.connected
                  ? ConstantEnum.KmsConnected
                  : ConstantEnum.KmsNotConnected
              }
            />
            <div className={style.statusSeparator} />
            <Constant
              enumType={ConstantType.KmsTrustStatus}
              value={
                current.trustState === "MUTUAL_TRUSTED"
                  ? ConstantEnum.KmsTrusted
                  : current.trustState === "MUTUAL_UNTRUSTED"
                    ? ConstantEnum.KmsNotTrusted
                    : current.trustState === "MN_TRUSTS_KMS_ONLY"
                      ? ConstantEnum.KmsNotTrustedByKms
                      : current.trustState === "KMS_TRUSTS_MN_ONLY"
                        ? ConstantEnum.KmsNotTrustedByMn
                        : ConstantEnum.KmsNotTrusted
              }
            />
          </div>
        );
      },
    },
  ]);
};
