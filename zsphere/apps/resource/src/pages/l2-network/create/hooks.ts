import { gql, useLazyQuery } from "@apollo/client";
import { useMemo } from "react";

const queryResourceList = gql`
  query resourceList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $type: ResourceQueryType!
  ) {
    resourceList(
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
    ) {
      list {
        name
        uuid
      }
      total
    }
  }
`;

export const useDefaultName = (regexs: RegExp[]) => {
  const [query, { data, loading }] = useLazyQuery(queryResourceList);

  const count = useMemo(() => {
    if (data && !loading) {
      const countList: number[] = (data?.resourceList?.list ?? []).map(
        (item: { name: string; uuid: string }) => {
          const matchList = regexs.map((reg) => {
            if (!reg.test(item.name)) {
              return -1;
            }
            const match = reg.exec(item.name);
            return match?.[1] ? Number(match?.[1]) : -1;
          });
          return Math.max(...matchList);
        },
      );
      return countList?.length ? Math.max(...countList) + 1 : 0;
    }
    return;
  }, [loading, data]);

  return { query, count };
};
