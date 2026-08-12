import { gql, useLazyQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { Illustrations } from "@zstack/zsphere-illustration";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useMount } from "ahooks";
import React from "react";
import { useIntl } from "react-intl";

import AutoSkeleton from "../../../components/auto-skeleton";
import useTranslateTime from "../useTranslateTime";

import style from "./style.module.less";

interface IProps {
  [key: string]: any;
}

const queryWidgetUserInfo = gql`
  query queryWidgetUserInfo($queryType: QueryWidgetUserInfoType) {
    queryWidgetUserInfo(queryType: $queryType) {
      platformTime
    }
  }
`;

const Account: React.FC<IProps> = () => {
  const intl = useIntl();
  const { currentUser } = usePlatformStore();

  const [_queryWidgetUserInfo, { loading, data }] = useLazyQuery(
    queryWidgetUserInfo,
    {
      fetchPolicy: "no-cache",
    },
  );
  useMount(() => {
    _queryWidgetUserInfo({
      variables: {
        queryType: "Account",
      },
    });
  });
  const { platformTime } = data?.queryWidgetUserInfo ?? {};
  const timer = useTranslateTime(platformTime);

  return (
    <div
      className={style.container}
      style={{ paddingTop: loading ? "20px" : 0 }}
    >
      <AutoSkeleton name="user-info-account" loading={loading}>
        <div className={style.adminAccount}>
          <div className={style.top}>
            <div className={style.left}>
              <div className={style["head-sculpture"]}>
                <img alt="account" src={Illustrations["account"]} />
              </div>
            </div>
            <div className={style.right}>
              <div className={style.title}>
                {intl.formatMessage({
                  id: "welcomeComma",
                  defaultMessage: "Welcome, ",
                })}
                {currentUser?.username}
              </div>
            </div>
          </div>
          <div className={style.bottom}>
            <div className={style.heading}>
              <span>
                {intl.formatMessage({
                  id: "platformTime",
                  defaultMessage: "Platform Time",
                })}
              </span>
            </div>
            <div className={style.content}>
              <span>
                <span className={style["custom-icon"]}>
                  <Icon type="clock-fill" />
                </span>
                <span>{timer}</span>
              </span>
            </div>
          </div>
        </div>
      </AutoSkeleton>
    </div>
  );
};

export default Account;
