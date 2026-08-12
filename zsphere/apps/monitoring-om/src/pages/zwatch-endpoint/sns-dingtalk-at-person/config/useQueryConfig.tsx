import { useQueryConfig } from "@zstack/zsphere-engine/src/sns-dingtalk-at-person";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default () => {
  const queryProps: IQueryProps = {
    resourceType: "SNSDingTalkAtPerson",
    needFuzzyQuery: true,
  };
  return useQueryConfig(
    [
      {
        key: "phoneNumber",
        searchKey: "phoneNumber",
      },
    ],
    queryProps,
  );
};
