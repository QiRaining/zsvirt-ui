import { useQueryConfig } from "@zstack/zsphere-engine/src/host";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";
import { usePlatformStore } from "@zstack/zsphere-platform-store";

export default ({
  view,
  defaultQuery,
  hidenTagSearch,
}: {
  view?: string;
  defaultQuery?: any;
  hidenTagSearch?: boolean;
}) => {
  const { currentUser } = usePlatformStore();

  const queryProps: IQueryProps = {
    resourceType: "Host",
    needFuzzyQuery: true,
    defaultQuery,
    currentUser,
    excludeKeys: ["tentant"], //  "tentant" 应为 "tenant"（租户）。此拼写错误 从后端来源，似乎就是错的，估计先不修改
  };

  const baseQuery = useQueryConfig([], queryProps);
  if (
    hidenTagSearch ||
    (view &&
      (/^(sub|select)(?!\.virtualization\.)/.test(view) ||
        ["sub.virtualization.tag"].includes(view)))
  ) {
    return baseQuery?.filter((cv) => cv?.key !== "tag" && cv?.type !== "tag");
  }

  return baseQuery;
};
