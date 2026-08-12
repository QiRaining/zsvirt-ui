import { queryDRSVmMigrationActivityList } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { Op } from "@zstack/zsphere-types";
import type { DRSAdvice as IDRSAdvice } from "@zstack/zsphere-types/graphql";

const { apolloClient } = window.g_main;

// 没有选中
const verifyNotSelect = (selectedList: IDRSAdvice[] = []): boolean => {
  return selectedList?.length <= 0 || !selectedList;
};

const verifyExecuteDispatch = async (selectedList: IDRSAdvice[] = []) => {
  const { data } = await apolloClient.query({
    query: queryDRSVmMigrationActivityList,
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
        return false;
      }
    }
  }

  return selectedList?.length !== 0;
};

export { verifyExecuteDispatch, verifyNotSelect };
