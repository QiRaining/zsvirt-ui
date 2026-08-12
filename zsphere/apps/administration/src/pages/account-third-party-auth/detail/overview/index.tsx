import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { Action } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  AccountVO,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo } from "react";

import useActionConfig from "../../config/useActionConfig";
import { getSsoType } from "../../uitls";
import BasicInfo from "./basic-info";
import ConfigInfo from "./config-info";
import ServerInfo from "./server-info";
import SyncInfo from "./sync-info";

interface IProps {
  current: IAccountThirdPartyAuth | IThirdPartyAuthVO;
  refetch: Function;
}

const STYLE_MARGIN_BOTTOM_12 = { marginBottom: "12px" } as const;

const Overview: FC<IProps> = ({ current, refetch }) => {
  const { list, viewMap } = useActionConfig();

  const { isLdapServer, isOIDC } = getSsoType(current);

  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo {...props} current={current} />
        ),
      },
      configInfo: {
        resourceKey: "configInfo",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <ConfigInfo {...props} current={current} refetch={refetch} />
        ),
      },
      serverInfo: {
        resourceKey: "serverInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <ServerInfo {...props} current={current} />
        ),
      },
      syncInfo: {
        resourceKey: "syncInfo",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <SyncInfo {...props} current={current} refetch={refetch} />
        ),
      },
    };

    if (isLdapServer) {
      delete result.syncInfo;
    }

    if (!isLdapServer) {
      delete result.serverInfo;
    }

    return result;
  }, [current, isLdapServer, refetch]);

  const action = React.useMemo(() => {
    let view = "";

    if (isOIDC) {
      view = "virtualization.main";
    }

    if (isLdapServer) {
      view = "virtualization.ldap.main";
    }

    return { view };
  }, [isLdapServer, isOIDC]);

  const memoizedSelectedList = useMemo<[AccountVO]>(
    () => [current as unknown as AccountVO],
    [current],
  );

  return (
    <>
      <div style={STYLE_MARGIN_BOTTOM_12}>
        <Action
          view={action.view}
          menuList={list}
          viewMap={viewMap}
          position="header"
          refetch={refetch}
          selectedList={memoizedSelectedList}
        />
      </div>

      <div className="zsv-detail-container">
        <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="account-information"
          cols={2}
          dataSet={dataSet}
        />
      </div>
    </>
  );
};

export default Overview;
