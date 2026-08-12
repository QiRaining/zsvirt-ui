import { ResourceName, State } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/account-information";
import { State as StateEnum, AccountType, Op } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export const AccountState: React.FC<{ state: StateEnum }> = ({ state }) => {
  const intl = useIntl();

  const accountStateMap = new Map<StateEnum, React.ReactElement>([
    [
      StateEnum.Enabled,
      <State
        type="success"
        icon="play-circle-fill"
        name={intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" })}
      />,
    ],
    [
      StateEnum.Disabled,
      <State
        type="error"
        icon="stop-circle-fill"
        name={intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" })}
      />,
    ],
    [
      StateEnum.Staled,
      <State
        type="disabled"
        icon="close-circle-fill"
        name={intl.formatMessage({ id: "deleted", defaultMessage: "Deleted" })}
      />,
    ],
  ]);

  return accountStateMap.get(state) || null;
};

export default () => {
  const intl = useIntl();

  const columns = [
    {
      key: "name",
      title: intl.formatMessage({ id: "username", defaultMessage: "Username" }),
      render: (current: IAccount) => {
        return (
          <ResourceName
            value={current?.name}
            isRouterManaged
            link={{
              to: `/account-information/user`,
              microAppName: "virtualization-administration",
              uuid: current?.uuid,
            }}
          />
        );
      },
    },
    {
      key: "subAccountSource",
      filters: [
        {
          text: intl.formatMessage({
            id: "local.sub.account",
            defaultMessage: "Local",
          }),
          value: AccountType.Normal,
        },
        {
          text: intl.formatMessage({
            id: "third.party.sub.account",
            defaultMessage: "SSO",
          }),
          value: AccountType.ThirdParty,
        },
      ],
      filterCondition: (values: string[]) => {
        const SystemAdmin = values.includes(AccountType.Normal)
          ? [AccountType.SystemAdmin]
          : [];
        return {
          key: "type",
          op: Op.in,
          values: [...values, ...SystemAdmin],
        };
      },
      formatter: (current: IAccount) => {
        return current?.type === AccountType.ThirdParty
          ? intl.formatMessage({
              id: "third.party.sub.account",
              defaultMessage: "SSO",
            })
          : intl.formatMessage({
              id: "local.sub.account",
              defaultMessage: "Local",
            });
      },
    },
    {
      key: "type",
      filters: [
        {
          text: intl.formatMessage({
            id: "normal.user",
            defaultMessage: "Regular User",
          }),
          value: AccountType.Normal,
        },
        {
          text: intl.formatMessage({
            id: "admin.user",
            defaultMessage: "Admin User",
          }),
          value: AccountType.SystemAdmin,
        },
      ],
      formatter: (value: { type: string }) => {
        return value?.type === AccountType.SystemAdmin
          ? intl.formatMessage({
              id: "admin.user",
              defaultMessage: "Admin User",
            })
          : intl.formatMessage({
              id: "normal.user",
              defaultMessage: "Regular User",
            });
      },
    },
    {
      key: "volumeNum",
      formatter: (current: IAccount) => current?.accountQuotaInfo?.volumeNum,
    },
    {
      key: "priceTable",
      linkResource: {
        microAppName: "billing-management",
        path: "pricing-list",
      },
      auth: {
        type: "block",
        resource: "account.information",
        authKey: "price.table",
      },
      formatter: (current: IAccount) => {
        return current?.priceTable?.name === "global_default"
          ? intl.formatMessage({
              id: "defaultBillingPriceTable",
              defaultMessage: "Default Pricing List",
            })
          : current?.priceTable?.name;
      },
    },
    {
      key: "state",
      filters: [
        {
          text: <AccountState state={StateEnum.Enabled} />,
          value: StateEnum.Enabled,
          i18nKey: "enabled",
        },
        {
          text: <AccountState state={StateEnum.Disabled} />,
          value: StateEnum.Disabled,
          i18nKey: "disabled",
        },
        {
          text: <AccountState state={StateEnum.Staled} />,
          value: StateEnum.Staled,
          i18nKey: "deleted",
        },
      ],
      render: (current: IAccount) =>
        current.state ? (
          <AccountState state={current.state as StateEnum} />
        ) : undefined,
    },
  ] as any;

  return useColumnConfig<IAccount>(columns);
};
