import { useAuth } from "@zstack/zsphere-components";
import { get as _get } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { Platform, translatePlatformList } from "./constant";

export const getMicrosoftTeamsTemplate = (temp: string) => {
  temp = temp?.replace('"markdown": true', "");
  try {
    const _temp = _get(JSON.parse(temp), ["sections", "0"]);
    delete _temp.markdown;
    return JSON.stringify(_temp, null, 2);
  } catch (e) {
    console.error(e);
  }
};

//根据权限获取PlatformList列表
export const useGetPlatformList = () => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const authMap: any = {
    [Platform.DingTalk]: {
      authKey: "DingTalk",
      resource: "zwatch.sns.text.template",
      type: "block",
    },
    [Platform.FeiShu]: {
      authKey: "FeiShu",
      resource: "zwatch.sns.text.template",
      type: "block",
    },
    [Platform.WeCom]: {
      authKey: "WeCom",
      resource: "zwatch.sns.text.template",
      type: "block",
    },
    [Platform.MicrosoftTeams]: {
      authKey: "MicrosoftTeams",
      resource: "zwatch.sns.text.template",
      type: "block",
    },
  };
  return useMemo(() => {
    const platformList = translatePlatformList(intl);
    return platformList.filter((item) =>
      authMap[item.value] ? hasAuth(authMap[item.value]) : true,
    );
  }, [intl, authMap, hasAuth]);
};
