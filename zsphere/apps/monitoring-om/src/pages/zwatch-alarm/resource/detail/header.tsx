import {
  DetailBreadcrumb,
  Header,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import { Tag } from "@zstack/zsphere-components";
import type { ZWatchAlarmVO as IZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import Action from "zsv_shared/zwatch-alarm/resource/action/header";

import style from "./style.module.less";

interface IProps {
  current: IZWatchAlarmVO;
  refetch?: () => void;
  source?: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch, source }) => {
  const intl = useIntl();
  const { uuid, name = "", zhName = "" } = current;
  const { translateAlarmNameByLocale, systemAlarmUuidList } =
    useMetricNameConfig();

  return (
    <div>
      <DetailBreadcrumb
        breadcrumbItems={[{ name: translateAlarmNameByLocale(name, zhName) }]}
      />
      <Header.Detail
        icon="alarm"
        title={
          <div className="flex items-center gap-2">
            {translateAlarmNameByLocale(name, zhName)!}
            {systemAlarmUuidList.includes(uuid) ? (
              <div className={style.tagWrapper}>
                <Tag round level="weak" className={style.tag}>
                  {intl.formatMessage({
                    id: "default",
                    defaultMessage: "Default",
                  })}
                </Tag>
              </div>
            ) : null}
          </div>
        }
        actions={
          <Action refetch={refetch} selectedList={[current]} source={source} />
        }
      />
    </div>
  );
};

export default DetailHeader;
