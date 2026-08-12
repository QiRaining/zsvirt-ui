import { useQueryConfig } from "@zstack/zsphere-engine/src/zwatch-alarm-resource";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";
import { getLocaleFromStorage } from "@zstack/zsphere-utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "Alarm",
    needFuzzyQuery: true,
    defaultQuery,
  };
  // 名称搜索，需要按中英文语言环境对应搜索
  const locale = getLocaleFromStorage() || "zh-CN";
  return useQueryConfig(
    [
      {
        key: "name",
        searchKey: locale === "zh-CN" ? "__systemTag__" : "name",
      },
    ],
    queryProps,
  );
};
