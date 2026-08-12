import { TabPane, Tabs } from "@zstack/zsphere-components";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import Audit from "./audit";
import Overview from "./overview";

import style from "./style.module.less";

interface IProps {
  current: IAccountThirdPartyAuth | IThirdPartyAuthVO;
  refetch: Function;
}

const Detail: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();

  return (
    <>
      <Tabs type="line">
        <TabPane
          className={style.tabpane}
          key="overview"
          tab={intl.formatMessage({ id: "overview", defaultMessage: "Overview" })}
        >
          <Overview current={current} refetch={refetch} />
        </TabPane>
        <TabPane
          className={style.tabpane}
          key="audit"
          tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
          auth={{
            type: "view",
            authKey: "list",
            resource: "auditing",
          }}
        >
          <Audit current={current} />
        </TabPane>
      </Tabs>
    </>
  );
};

export default Detail;
