import { gql, useQuery } from "@apollo/client";
import {
  Spin,
  TabPane2 as TabPane,
  Tabs2 as Tabs,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import DisabledHaStrategic from "./disabled-ha-strategic";
import HAAdvanceSettings from "./ha-advance-settings";
import Header from "./header";
import MigrationStrategy from "./migration-strategy";

import style from "./style.module.less";

const _queryHAGlobalConfig = gql`
  query globalConfig {
    globalConfig(category: "ha", name: "enable") {
      name
      category
      value
      uuid
    }
  }
`;

const HaStrategic: React.FC = () => {
  const intl = useIntl();
  const [valid, setValid] = useState(false);
  const { data, loading, refetch } = useQuery(_queryHAGlobalConfig);

  useActionSubscribe({
    resourceTypeList: ["HAStrategic"],
    onFinish: () => {
      refetch();
    },
  });

  useEffect(() => {
    setValid(data?.globalConfig?.value === "true");
  }, [data]);

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="main-list-header-tabs-container main-list-header-tabs-detail">
      <Header haEnabled={valid} />
      {!valid ? (
        <div className={style.disableMain}>
          <DisabledHaStrategic />
        </div>
      ) : (
        <>
          <Tabs>
            <TabPane
              key="migrationStrategy"
              tab={intl.formatMessage({
                id: "migrationStrategy",
                defaultMessage: "Migration Policy",
              })}
            >
              <MigrationStrategy />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "ha.advance",
                defaultMessage: "Advanced Settings",
              })}
              key="ha.advance"
            >
              <HAAdvanceSettings />
            </TabPane>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default HaStrategic;
