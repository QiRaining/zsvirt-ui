import { Tabs } from "antd";
import React from "react";
import { useIntl } from "react-intl";

import GeneralOptions from "./general-options";

import style from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/config/style.module.less";

export default function AdvancedConfig() {
  const intl = useIntl();
  return (
    <div className={style.content}>
      <Tabs hideAdd className={style.tab} tabPosition="left">
        <Tabs.TabPane
          key="general.options"
          className={style["tabPane-config"]}
          tab={intl.formatMessage({
            id: "virtualization.vm.setting.normal",
            defaultMessage: "General Options",
          })}
          forceRender
        >
          <GeneralOptions />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
