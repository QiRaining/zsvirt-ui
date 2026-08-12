import { gql, useQuery } from "@apollo/client";
import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import {
  ItemList,
  List,
  ResourceName,
  DraggableCard,
  Tag,
  useAuth,
} from "@zstack/zsphere-components";
import { AccountType, ZsvRoleQueryType } from "@zstack/zsphere-types";
import type {
  AccountVO as IAccount,
  ZsvRole,
} from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useState, useMemo } from "react";
import { useIntl } from "react-intl";
import { AccountState } from "zsv_administration_shared/account-information/mf-index";

import { twoFactorAuthenticationList } from "../../../../../gql/account.gql";
import { transformRoleName } from "../../../../role/utils";
import QRCode from "../../components/qrcode/index";

import styles from "./style.module.less";

const STYLE_COLOR_NEUTRAL_500 = { color: "var(--neutral-500)" } as const;

const globalConfig = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      uuid
      value
    }
  }
`;

interface IProps {
  detail: IAccount;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch: any;
}

const BasicInfo: FC<IProps> = ({ detail, onCollapseChange, collapsed }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const { uuid, role, roleFromAccountGroup, type } = detail;

  const { hasAuth } = useAuth();

  const isSystemAdmin = type === AccountType.SystemAdmin;

  const { data: twoFaConfig } = useQuery<{
    globalConfig?: { value?: "true" | "false" };
  }>(globalConfig, {
    variables: {
      category: "twofa",
      name: "twofa.enable",
    },
  });

  const [secret, setSecret] = useState<string>("");

  const { data: _data } = useQuery(twoFactorAuthenticationList, {
    fetchPolicy: "network-only",
    variables: {
      conditions: [
        {
          key: "accountUuid",
          value: uuid,
        },
      ],
    },
    onCompleted(data) {
      setSecret(data?.twoFactorAuthenticationList?.list?.[0]?.secret ?? "");
    },
  });

  const hasRoleAuth = hasAuth({
    type: "view",
    authKey: "list",
    resource: "virtualization.role",
  });

  const getBasicItems = (): ListItem[] => [
    ...(detail.state
      ? [
          {
            label: intl.formatMessage({ id: "state", defaultMessage: "State" }),
            value: <AccountState state={detail.state as any} />,
          },
        ]
      : []),
    {
      label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
      value:
        detail?.type === AccountType.SystemAdmin
          ? intl.formatMessage({
              id: "admin.user",
              defaultMessage: "Admin User",
            })
          : intl.formatMessage({
              id: "normal.user",
              defaultMessage: "Regular User",
            }),
    },
    {
      label: intl.formatMessage({
        id: "subAccountSource",
        defaultMessage: "Source",
      }),
      value:
        detail.type === "ThirdParty"
          ? intl.formatMessage({
              id: "third.party.sub.account",
              defaultMessage: "SSO",
            })
          : intl.formatMessage({
              id: "local.sub.account",
              defaultMessage: "Local",
            }),
    },
  ];

  const getTwoFactorItems = (): ListItem[] =>
    twoFaConfig?.globalConfig?.value === "true"
      ? [
          {
            label: intl.formatMessage({
              id: "bifactorQrode",
              defaultMessage: "Verification Code",
            }),
            value: (
              <QRCode
                value={`otpauth://totp/${detail.name}?secret=${secret}`}
                title={intl.formatMessage({
                  id: "view.qrode",
                  defaultMessage: "View QR Code",
                })}
                placement="top"
              />
            ),
          },
        ]
      : [];

  const getRoleItems = (): ListItem[] => {
    if (!hasRoleAuth) {
      return [];
    }

    if (isSystemAdmin) {
      return [
        {
          label: intl.formatMessage({
            id: "virtualization.role",
            defaultMessage: "Role",
          }),
          value: (
            <>
              {role?.length ? (
                role?.map((it: ZsvRole) => (
                  <div className="flex items-center gap-1" key={it?.uuid}>
                    <ResourceName
                      value={transformRoleName(intl, {
                        uuid: it?.uuid,
                        name: it?.name,
                      } as unknown as {
                        uuid: string;
                        name: string;
                      })}
                      link={{
                        to: `/role`,
                        microAppName: "virtualization-administration",
                        uuid: it?.uuid,
                      }}
                    />
                    {it?.type === ZsvRoleQueryType.Predefined && (
                      <Tag round level="weak">
                        {intl.formatMessage({
                          id: "default",
                          defaultMessage: "Default",
                        })}
                      </Tag>
                    )}
                  </div>
                ))
              ) : (
                <span style={STYLE_COLOR_NEUTRAL_500}>
                  {intl.formatMessage({ id: "none", defaultMessage: "None" })}
                </span>
              )}
            </>
          ),
        },
      ];
    }

    return [
      {
        label: intl.formatMessage({
          id: "virtualization.role",
          defaultMessage: "Role",
        }),
        value: (
          <div className={styles.roleList}>
            <span>
              {intl.formatMessage(
                { id: "account.role.num", defaultMessage: `User Role: {role}` },
                { role: role?.length },
              )}
            </span>
            <span className={styles.extraInfo} />
            <span>
              {intl.formatMessage(
                {
                  id: "account.role.from.account.group.num",
                  defaultMessage: `User Group Role: {roleFromAccountGroups}`,
                },
                { roleFromAccountGroups: roleFromAccountGroup?.length },
              )}
            </span>
          </div>
        ),
        children: [
          {
            label: intl.formatMessage(
              { id: "account.role", defaultMessage: `User Role ({role})` },
              { role: role?.length },
            ),
            value: role?.length ? (
              <ItemList
                toggle
                ellipsis
                needWrap
                value={role?.map((it) => (
                  <div className="flex items-center gap-1" key={it?.uuid}>
                    <ResourceName
                      value={transformRoleName(intl, {
                        uuid: it?.uuid,
                        name: it?.name,
                      })}
                      link={{
                        to: `/role`,
                        microAppName: "virtualization-administration",
                        uuid: it?.uuid,
                      }}
                    />
                    {it?.type === ZsvRoleQueryType.Predefined && (
                      <Tag round level="weak">
                        {intl.formatMessage({
                          id: "default",
                          defaultMessage: "Default",
                        })}
                      </Tag>
                    )}
                  </div>
                ))}
              />
            ) : (
              <span style={STYLE_COLOR_NEUTRAL_500}>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            ),
          },
          {
            label: intl.formatMessage(
              {
                id: "account.role.from.account.group",
                defaultMessage: `User Group Role ({roleFromAccountGroups})`,
              },
              { roleFromAccountGroups: roleFromAccountGroup?.length },
            ),
            value: roleFromAccountGroup?.length ? (
              <ItemList
                toggle
                ellipsis
                needWrap
                value={roleFromAccountGroup?.map((it) => (
                  <div className="flex items-center gap-1" key={it?.uuid}>
                    <ResourceName
                      value={transformRoleName(intl, {
                        uuid: it?.uuid,
                        name: it?.name,
                      })}
                      link={{
                        to: `/role`,
                        microAppName: "virtualization-administration",
                        uuid: it?.uuid,
                      }}
                    />
                    {it?.type === ZsvRoleQueryType.Predefined && (
                      <Tag round level="weak">
                        {intl.formatMessage({
                          id: "default",
                          defaultMessage: "Default",
                        })}
                      </Tag>
                    )}
                  </div>
                ))}
              />
            ) : (
              <span style={STYLE_COLOR_NEUTRAL_500}>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            ),
          },
        ],
      },
    ];
  };

  const getResourceItems = (): ListItem[] => [
    {
      label: intl.formatMessage({
        id: "virtualization.vm.count",
        defaultMessage: "VMs",
      }),
      value: detail.vmNum,
    },
    {
      label: intl.formatMessage({
        id: "virtualization.volume.count",
        defaultMessage: "Disks",
      }),
      value: detail.accountQuotaInfo?.volumeNum,
    },
  ];

  const getMetadataItems = (): ListItem[] => [
    {
      label: intl.formatMessage({ id: "description", defaultMessage: "Description" }),
      value: detail.description || (
        <span style={STYLE_COLOR_NEUTRAL_500}>
          {intl.formatMessage({ id: "none", defaultMessage: "None" })}
        </span>
      ),
    },
    {
      label: "UUID",
      value: detail.uuid,
      copyable: true,
    },
    {
      label: intl.formatMessage({
        id: "createDate",
        defaultMessage: "Creation Time",
      }),
      value: getServerTime(detail.createDate!).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  const list: ListItem[] = useMemo(
    () => [
      ...getBasicItems(),
      ...getTwoFactorItems(),
      ...getRoleItems(),
      ...getResourceItems(),
      ...getMetadataItems(),
    ],
    [intl, getServerTime, detail, secret, twoFaConfig],
  );

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    </>
  );
};

export default BasicInfo;
