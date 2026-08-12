import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { SNSTextTemplate } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import type { ZwatchSNSTextTemplateAlarmType } from "../../constant";
import { Platform } from "../../constant";
import { translateAlarmType, translateAlarmTypePlatform } from "../../helper";

interface IProps {
  detail: SNSTextTemplate;
  refetch?: () => void;
}

const BasicInfo: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();
  const { uuid, createDate, type, applicationPlatformType, sign, description } =
    detail;

  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(() => {
    let arr = [
      {
        label: intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        }),
        value: translateAlarmTypePlatform(
          intl,
          applicationPlatformType as Platform,
        ),
      },
      {
        label: intl.formatMessage({
          id: "alarmType",
          defaultMessage: "Alarm Type",
        }),
        value: translateAlarmType(intl, type as ZwatchSNSTextTemplateAlarmType),
      },
    ];
    if (applicationPlatformType === Platform.AliyunSms) {
      arr.push({
        label: intl.formatMessage({
          id: "signatureName",
          defaultMessage: "Signature",
        }),
        value: sign,
      });
    }
    arr = arr.concat([
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: description,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(createDate ?? "").format("YYYY-MM-DD HH:mm:ss"),
      },
    ]);
    return arr;
  }, [detail, intl, getServerTime]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        collapsed={false}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    </>
  );
};

export default BasicInfo;
