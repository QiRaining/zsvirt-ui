enum Platform {
  Email = "Email",
  DingTalk = "DingTalk",
  MicrosoftTeams = "MicrosoftTeams",
  FeiShu = "FeiShu",
  WeCom = "WeCom",
  HTTP = "HTTP",
  AliyunSms = "AliyunSms",
}

enum ZwatchSNSTextTemplateAlarmType {
  Alarm = "alarm",
  Event = "event",
  Combined = "combined",
}

const translatePlatformList = (intl: any) => {
  return [
    {
      value: Platform.Email,
      lable: intl.formatMessage({
        id: "zwatchSNSTextTemplate.platform.mail",
        defaultMessage: "Email",
      }),
    },
    {
      value: Platform.DingTalk,
      lable: intl.formatMessage({
        id: "zwatchSNSTextTemplate.platform.dingding",
        defaultMessage: "DingTalk",
      }),
    },
    {
      value: Platform.FeiShu,
      lable: intl.formatMessage({
        id: "zwatchSNSTextTemplate.platform.feishu",
        defaultMessage: "Lark",
      }),
    },
    {
      value: Platform.WeCom,
      lable: intl.formatMessage({
        id: "zwatchSNSTextTemplate.platform.wecom",
        defaultMessage: "WeCom",
      }),
    },
    {
      value: Platform.HTTP,
      lable: intl.formatMessage({
        id: "zwatchSNSTextTemplate.platform.http",
        defaultMessage: "HTTP Application",
      }),
    },
    {
      value: Platform.MicrosoftTeams,
      lable: intl.formatMessage({
        id: "zwatchSNSTextTemplate.platform.MicrosoftTeams",
        defaultMessage: "Microsoft Teams",
      }),
    },
    {
      value: Platform.AliyunSms,
      lable: intl.formatMessage({
        id: "zwatchSNSTextTemplate.platform.message",
        defaultMessage: "SMS",
      }),
    },
  ];
};

const translateAlarmTypeList = (intl: any) => {
  return [
    {
      value: ZwatchSNSTextTemplateAlarmType.Event,
      lable: intl.formatMessage({
        id: "eventAlert",
        defaultMessage: "Event Alarm",
      }),
    },
    {
      value: ZwatchSNSTextTemplateAlarmType.Alarm,
      lable: intl.formatMessage({
        id: "resourceAlert",
        defaultMessage: "Resource Alarm",
      }),
    },
  ];
};

export {
  Platform,
  ZwatchSNSTextTemplateAlarmType,
  translatePlatformList,
  translateAlarmTypeList,
};
