import { Tabs as AntdTabs } from "antd";
import React, { FC } from "react";

import "./style.less";
import type { ITabProps } from "./type";

const Tabs: FC<ITabProps> = ({ tabs }) => {
  return (
    <div className="card">
      <AntdTabs
        className="card-tab"
        items={tabs.map((t, index) => ({
          label:
            index === 0 ? (
              <div className="card-title-first">
                <div className="card-title-first-text">{t.title}</div>
                {t.titleAlarm && (
                  <div className="card-title-first-icon">{t.titleAlarm}</div>
                )}
              </div>
            ) : (
              <div className="card-title">{t.title}</div>
            ),
          key: t.key,
          forceRender: true,
          children: t.content,
        }))}
      />
    </div>
  );
};

export default Tabs;
