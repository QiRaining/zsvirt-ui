import { useQuery } from "@apollo/client";
import { Spin, Header } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import {
  accountThirdPartyAuthList,
  thirdPartyAuthList,
} from "../../gql/account-third-party-auth.gql";
import Detail from "./detail";
import Empty from "./list/empty";

const SSOConfiguration: React.FC = () => {
  const intl = useIntl();

  // 查询后端LdapServer表
  const {
    loading: thirdPartyAuthLoading,
    data: thirdPartyAuthData,
    refetch: thirdPartyAuthRefetch,
  } = useQuery<
    { thirdPartyAuthList: { list: IThirdPartyAuthVO[]; total: number } },
    IQuery
  >(thirdPartyAuthList, {
    variables: {
      start: 0,
      limit: 10,
    },
  });

  // 查询后端ThirdPartyAccountSource表
  const {
    loading: accountThirdPartyAuthListLading,
    data: accountThirdPartyAuthListData,
    refetch: accountThirdPartyAuthListRefetch,
  } = useQuery<
    {
      accountThirdPartyAuthList: {
        list: IAccountThirdPartyAuth[];
        total: number;
      };
    },
    IQuery
  >(accountThirdPartyAuthList, {
    variables: {
      start: 0,
      limit: 10,
    },
  });

  const refetch = React.useCallback(() => {
    accountThirdPartyAuthListRefetch?.();
    thirdPartyAuthRefetch?.();
  }, [accountThirdPartyAuthListRefetch, thirdPartyAuthRefetch]);

  useActionSubscribe({
    resourceTypeList: [
      "AccountThirdPartyAuthVO",
      "SSOThirdPartyAuthVO",
      "ThirdPartyAuthVO",
    ],
    onFinish: () => {
      refetch();
    },
  });

  const current =
    accountThirdPartyAuthListData?.accountThirdPartyAuthList?.list?.[0] ||
    thirdPartyAuthData?.thirdPartyAuthList?.list?.[0] ||
    ({} as any);

  const hasSSO = !!current?.uuid;

  if (accountThirdPartyAuthListLading || thirdPartyAuthLoading) {
    return <Spin />;
  }

  return (
    <div className="main-list-header-tabs-container">
      <Header.List
        className={hasSSO ? "main-list-header-tabs" : "main-list-header"}
        title={intl.formatMessage({
          id: "virtualization.account.third.party.auth",
          defaultMessage: "Single Sign-On",
        })}
      />

      {hasSSO ? <Detail current={current!} refetch={refetch} /> : <Empty />}
    </div>
  );
};

export default SSOConfiguration;
