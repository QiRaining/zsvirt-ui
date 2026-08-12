import { Platform, ZwatchSNSTextTemplateAlarmType } from "./constant";

export const _jsonParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
};

export const _jsonStringify = (obj: any) => {
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
};

export const alarmTypeI18nMap = (intl: any) => {
  return {
    [ZwatchSNSTextTemplateAlarmType.Alarm]: intl.formatMessage({
      id: "resourceAlert",
      defaultMessage: "Resource Alarm",
    }),
    [ZwatchSNSTextTemplateAlarmType.Combined]: intl.formatMessage({
      id: "combinedAlert",
      defaultMessage: "Resource Alarm/Event Alarm",
    }),
    [ZwatchSNSTextTemplateAlarmType.Event]: intl.formatMessage({
      id: "eventAlert",
      defaultMessage: "Event Alarm",
    }),
  };
};
export const translateAlarmType = (
  intl: any,
  type: ZwatchSNSTextTemplateAlarmType,
) => {
  const map = alarmTypeI18nMap(intl);
  return map?.[type];
};

export const alarmTypePlatformI18nMap = (intl: any) => {
  return {
    [Platform.Email]: intl.formatMessage({
      id: "mailbox",
      defaultMessage: "Email",
    }),
    [Platform.AliyunSms]: intl.formatMessage({
      id: "aliyunSms",
      defaultMessage: "SMS",
    }),
    [Platform.DingTalk]: intl.formatMessage({
      id: "dingTalk",
      defaultMessage: "DingTalk",
    }),
    [Platform.FeiShu]: intl.formatMessage({
      id: "feishu",
      defaultMessage: "Lark",
    }),
    [Platform.WeCom]: intl.formatMessage({
      id: "wecom",
      defaultMessage: "WeCom",
    }),
    [Platform.HTTP]: intl.formatMessage({
      id: "zwatchSNSTextTemplate.platform.http",
      defaultMessage: "HTTP Application",
    }),
    [Platform.MicrosoftTeams]: intl.formatMessage({
      id: "microsoftTeams",
      defaultMessage: "Microsoft Teams",
    }),
  };
};
export const translateAlarmTypePlatform = (intl: any, type: Platform) => {
  const map = alarmTypePlatformI18nMap(intl);
  return map?.[type];
};
