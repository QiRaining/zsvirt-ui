import {
  DetailBreadcrumb,
  Header,
  Action,
  Tag,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import type { ZWatchAlarmVO as IZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";

import style from "./style.module.less";

interface IProps {
  current: IZWatchAlarmVO;
  refetch?: () => void;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();
  const { uuid, namespace, eventName = "" } = current;
  const { list: menuList, viewMap, getItemName } = useActionConfig();

  const { translateEventName, systemAlarmUuidList } = useMetricNameConfig();

  const getTitle: Function = () => {
    // hardcode
    return translateEventName(namespace, eventName);
  };

  return (
    <div>
      <DetailBreadcrumb breadcrumbItems={[{ name: getTitle() }]} />
      <Header.Detail
        icon="alarm"
        title={
          <div className="flex items-center gap-2">
            {getTitle()}
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
          <Action
            view="main.virtualization"
            refetch={refetch}
            resource="zwatch.alarm.event"
            position="header"
            menuList={menuList}
            viewMap={viewMap}
            selectedList={[current]}
            getItemName={getItemName}
          />
        }
      />
    </div>
  );
};

export default DetailHeader;
