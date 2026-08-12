import dayjs from "dayjs";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Panel from "./components/panel";
import { useServerTime } from "./hooks";

import style from "./style.module.less";

/**
 * 骨架屏：模拟 "YYYY - MM - DD HH : mm : ss" 的数字块布局
 * 避免 50ms 级请求使用 Spinner 导致的闪烁
 */
const TimeSkeleton: FC = () => {
  // 模拟 10 个数字块 + 5 个分隔符的布局
  const blocks = [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  return (
    <div className="flex items-center justify-center gap-0">
      {blocks.map((width, i) =>
        width === 2 ? (
          <span
            key={i}
            className="inline-block animate-pulse rounded-xs !bg-neutral-100"
            style={{ width: 28, height: 56, margin: "0 1px" }}
          />
        ) : (
          <span key={i} className="inline-block" style={{ width: 24 }} />
        ),
      )}
    </div>
  );
};

const PanelTime: FC = () => {
  const intl = useIntl();
  const { currentTime, timezone, offset } = useServerTime();
  const formattedTime =
    currentTime && dayjs(currentTime).format("YYYY-MM-DD HH:mm:ss");

  const timeText = useMemo(() => {
    if (formattedTime) {
      const parts = formattedTime.split(/(\D)/);

      return parts.map((char, index) => {
        const isNumber = /\d/.test(char);
        return (
          <span
            key={index}
            className={isNumber ? style["number-bg"] : style["separator"]}
          >
            {char}
          </span>
        );
      });
    }
    return null;
  }, [formattedTime]);

  const zoneText = timezone ? `UTC (${offset}) ${timezone}` : "";

  return (
    <Panel
      title={intl.formatMessage({
        id: "platform.time",
        defaultMessage: "Platform Time",
      })}
    >
      <div className={style["panel-time"]}>
        {timeText ? (
          <>
            <h1>
              <span>{timeText}</span>
            </h1>
            <p>{zoneText}</p>
          </>
        ) : (
          <>
            <TimeSkeleton />
            <p className="mt-2.5">&nbsp;</p>
          </>
        )}
      </div>
    </Panel>
  );
};

export default PanelTime;
