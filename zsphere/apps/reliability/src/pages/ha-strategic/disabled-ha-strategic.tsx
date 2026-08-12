import cls from "classnames";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import HighAvailabilityScenario from "./components/high-availability-scenario";

import style from "./style.module.less";

interface IProps {}

const DisabledHaStrategic: React.FC<IProps> = () => {
  const intl = useIntl();

  return (
    <>
      <div className={cls(style.card, style.indented)}>
        <div className={cls(style.titleBar, "flex justify-between gap-3")}>
          <div className={cls(style.title, "flex items-center gap-2")}>
            <div className={style.rect} />
            <div>
              {intl.formatMessage({
                id: "feature.Overview",
                defaultMessage: "Overview",
              })}
            </div>
          </div>
        </div>
        <div className={style.content}>
          <ReactMarkdown>
            {intl.formatMessage({
              id: "feature.Overview.info",
              defaultMessage:
                "HA Policy is a mechanism that ensures sustained and stable running of the business if virtual machines are unexpectedly stopped because of errors occurred to compute, network, or storage resources associated with the virtual machines. By enabling this feature, you can customize VM HA policies to ensure your business continuity and stability.",
            })}
          </ReactMarkdown>
        </div>
      </div>

      <div className={cls(style.card, style.indented)}>
        <div className={cls(style.titleBar, "flex justify-between gap-2")}>
          <div className={cls(style.title, "flex items-center gap-2")}>
            <div className={style.rect} />
            <div>
              {intl.formatMessage({
                id: "current.VM.Failover.Migration.Policy",
                defaultMessage: "VM Failover Policy",
              })}
            </div>
          </div>
        </div>

        <div className={style.content}>
          <HighAvailabilityScenario />
        </div>
      </div>
    </>
  );
};

export default DisabledHaStrategic;
