import { useColumnConfig } from "@zstack/zsphere-engine/src/zwatch-sns-text-template";
import type { IOption } from "@zstack/zsphere-engine/src/zwatch-sns-text-template/useColumnConfig";
import { Link } from "@zstack/zsphere-engine/utils";
import type { SNSTextTemplate } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import type { Platform, ZwatchSNSTextTemplateAlarmType } from "../constant";
import { translateAlarmType, translateAlarmTypePlatform } from "../helper";
import { useGetPlatformList } from "../hook";

import styles from "../style.module.less";

export default () => {
  const intl = useIntl();
  const platformList = useGetPlatformList();
  const options: IOption<SNSTextTemplate> = [
    {
      key: "name",
      render: (value: SNSTextTemplate) => {
        const name = value?.name ?? "";
        return (
          <div className="flex min-w-0 items-center">
            <div className="min-w-0 truncate">
              <Link
                to={{
                  microAppName: "virtualization-monitoring-om",
                  path: "zwatch-sns-text-template",
                }}
                uuid={value?.uuid}
              >
                {name}
              </Link>
            </div>
            {value?.defaultTemplate ? (
              <span className={styles["txt-bubble"]}>
                {intl.formatMessage({
                  id: "is.defaultTemplate",
                  defaultMessage: "Default",
                })}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "applicationPlatformType",
      render: (value: any) =>
        translateAlarmTypePlatform?.(
          intl,
          value?.applicationPlatformType as Platform,
        ),
      filters: platformList.map((item) => {
        return {
          text: item.lable,
          value: item.value,
        };
      }),
    },
    {
      key: "type",
      render: (value: any) =>
        translateAlarmType?.(
          intl,
          value?.type as ZwatchSNSTextTemplateAlarmType,
        ),
      filters: [
        {
          text: intl.formatMessage({
            id: "resourceAlert",
            defaultMessage: "Resource Alarm",
          }),
          value: "alarm",
        },
        {
          text: intl.formatMessage({
            id: "eventAlert",
            defaultMessage: "Event Alarm",
          }),
          value: "event",
        },
        {
          text: intl.formatMessage({
            id: "combinedAlert",
            defaultMessage: "Resource Alarm/Event Alarm",
          }),
          value: "combined",
        },
      ],
    },
  ];

  return useColumnConfig(options);
};
