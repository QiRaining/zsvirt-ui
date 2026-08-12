enum Platform {
  Email = "Email",
  DingTalk = "DingTalk",
  MicrosoftTeams = "MicrosoftTeams",
  FeiShu = "FeiShu",
  WeCom = "WeCom",
  HTTP = "HTTP",
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
    // {
    //   value: Platform.AliyunSms,
    //   lable: intl.formatMessage({
    //     id: 'zwatchSNSTextTemplate.platform.message',
    //     defaultMessage: '短信'
    //   })
    // }
  ];
};

export { Platform, ZwatchSNSTextTemplateAlarmType, translatePlatformList };
