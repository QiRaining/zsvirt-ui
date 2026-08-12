import { useQuery } from "@apollo/client";
import { queryDRSVmMigrationActivityList } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { Op } from "@zstack/zsphere-types";
import type { DRSAdvice as IDRSAdvice } from "@zstack/zsphere-types/graphql";

export default function useValidator(selectedList: IDRSAdvice[] = []) {
  const { data } = useQuery(queryDRSVmMigrationActivityList, {
    fetchPolicy: "network-only",
    variables: {
      conditions: [
        {
          key: "adviceUuid",
          values: selectedList?.map((cv) => cv?.uuid),
          op: Op.in,
        },
      ],
    },
  });
  const migrationActivitylist = data?.queryDRSVmMigrationActivityList?.list || [
    { adviceUuid: "", status: "" },
  ];
  for (const item of migrationActivitylist) {
    const isSome = selectedList?.some(
      (adviceUuid) => adviceUuid === item.adviceUuid,
    );
    if (isSome) {
      const isBad = ["Created", "InProgress"].indexOf(item?.status) > -1;
      if (isBad) {
        return true;
      }
    }
  }
  return selectedList?.length === 0;
}
