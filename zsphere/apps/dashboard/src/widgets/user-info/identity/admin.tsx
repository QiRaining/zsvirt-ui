import { gql, useLazyQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { Link } from "@zstack/zsphere-components";
import { Illustrations } from "@zstack/zsphere-illustration";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useMount } from "ahooks";
import React from "react";
import { useIntl } from "react-intl";

import AutoSkeleton from "../../../components/auto-skeleton";
import { PlatformTime } from "./platform-time";

import style from "./style.module.less";

interface IProps {
  [key: string]: any;
}

const queryWidgetUserInfo = gql`
  query queryWidgetUserInfo($queryType: QueryWidgetUserInfoType) {
    queryWidgetUserInfo(queryType: $queryType) {
      accountNum

      platformTime
    }
  }
`;

const Admin: React.FC<IProps> = () => {
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
        queryType: "Admin",
      },
    });
  });

  return (
    <div
      className={style.container}
      style={{ paddingTop: loading ? "20px" : 0 }}
    >
      <AutoSkeleton name="user-info-admin" loading={loading}>
        <div className={style.adminAccount}>
          <div className={style.top}>
            <div className={style.left}>
              <div className={style["head-sculpture"]}>
                <img alt="admin" src={Illustrations["admin2"]} />
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
                <PlatformTime
                  platformTime={data?.queryWidgetUserInfo?.platformTime ?? 0}
                />
              </span>
              <span className={style["jump-icon"]}>
                <Link
                  to="/time-server"
                  microAppName="virtualization-administration"
                  isRouterManaged
                >
                  <Icon type="arrow-right" />
                </Link>
              </span>
            </div>
          </div>
        </div>
      </AutoSkeleton>
    </div>
  );
};

export default Admin;
