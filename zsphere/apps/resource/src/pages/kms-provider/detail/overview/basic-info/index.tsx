import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import {
  Constant,
  DraggableCard,
  List,
  Text,
  Tag,
} from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import type { Item } from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "../../../config/style.module.less";

interface IProps {
  current: Item;
}

const BasicInfo: React.FC<IProps> = ({ current, ...props }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const list = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [
      {
        label: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        value: (
          <div className={style.nameColumn}>
            <Text value={current?.name} />
            {current?.isDefault && (
              <Tag round level="weak" className={style.defaultTag}>
                {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
              </Tag>
            )}
          </div>
        ),
      },
      {
        label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
        value:
          current &&
          (current.type === "NKP"
            ? intl.formatMessage({
                id: "kmsProvider.type.builtin",
                defaultMessage: "Native Key Provider",
              })
            : intl.formatMessage({
                id: "kmsProvider.type.kms",
                defaultMessage: "Standard Key Provider",
              })),
      },
      {
        label: intl.formatMessage({
          id: "common.status",
          defaultMessage: "Status",
        }),
        value: (() => {
          if (!current) {
            return null;
          }
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
        })(),
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: current?.description,
      },
      {
        label: intl.formatMessage({ id: "uuid", defaultMessage: "UUID" }),
        copyable: true,
        value: current?.uuid,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value:
          current?.createDate &&
          getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ];

    if (current?.type === "KMS") {
      items.splice(
        3,
        0,
        {
          label: intl.formatMessage({
            id: "ip.address.or.domain.name",
            defaultMessage: "IP Address/Domain Name",
          }),
          copyable: true,
          value: current?.endpoint,
        },
        {
          label: intl.formatMessage({ id: "port", defaultMessage: "Port" }),
          value: current?.port,
        },
        {
          label: intl.formatMessage({
            id: "kmsProvider.activeIdentity.certExpiredDate",
            defaultMessage: "Platform Certificate Validity",
          }),
          value:
            current?.activeIdentity?.certExpiredDate &&
            getServerTime(current.activeIdentity.certExpiredDate).format(
              "YYYY-MM-DD HH:mm:ss",
            ),
        },
        {
          label: intl.formatMessage({
            id: "kmsProvider.serverCertExpiredDate",
            defaultMessage: "KMS Certificate Validity",
          }),
          value:
            current?.serverCertExpiredDate &&
            getServerTime(current.serverCertExpiredDate).format(
              "YYYY-MM-DD HH:mm:ss",
            ),
        },
      );
    }

    return items;
  }, [current, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      {...props}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
