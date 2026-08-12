import { useQueryConfig } from "@zstack/zsphere-engine/src/sns-wecom-at-person";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default () => {
  const queryProps: IQueryProps = {
    resourceType: "SNSWeComAtPerson",
    needFuzzyQuery: true,
  };
  return useQueryConfig(
    [
      {
        key: "userId",
        searchKey: "userId",
      },
    ],
    queryProps,
  );
};
