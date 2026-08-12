import { useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { nvmeLunCount } from "@zstack/virtualization-resource/src/gql/nvme-lun.gql";
import NvmeLunList from "@zstack/virtualization-resource/src/pages/nvme-lun/list";
import { Op } from "@zstack/zsphere-types";
import type { NvmeServer as INvmeServer } from "@zstack/zsphere-types/graphql";
import { useMount } from "ahooks";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: Partial<INvmeServer>;
  position: "nvmeServer" | "nvmeNqn";
}

const LunList: React.FC<IProps> = ({ current, position }) => {
  const intl = useIntl();
  const [tabType, setTabType] = useState<"Used" | "UnUsed">("Used");

  const usedDefaultQuery = useMemo(() => {
    const conditions =
      position === "nvmeServer"
        ? [
            {
              key: "nvmeTarget.nvmeServerUuid",
              op: Op.eq,
              value: current?.uuid,
            },
            {
              key: "__GetUsedLunByNvmeServerUuids__",
              op: Op.eq,
              value: current?.uuid,
            },
          ]
        : [
            {
              key: "nvmeTargetUuid",
              op: Op.eq,
              value: current?.uuid,
            },
            {
              key: "__GetUsedLunByNvmeTargetUuids__",
              op: Op.eq,
              value: current?.uuid,
            },
          ];

    return {
      conditions,
    };
  }, [current.uuid, position]);

  const unUsedDefaultQuery = useMemo(() => {
    const conditions =
      position === "nvmeServer"
        ? [
            {
              key: "nvmeTarget.nvmeServerUuid",
              op: Op.eq,
              value: current?.uuid,
            },
            {
              key: "__GetUnUsedLunByNvmeServerUuids__",
              op: Op.eq,
              value: current?.uuid,
            },
          ]
        : [
            {
              key: "nvmeTargetUuid",
              op: Op.eq,
              value: current?.uuid,
            },
            {
              key: "__GetUnUsedLunByNvmeTargetUuids__",
              op: Op.eq,
              value: current?.uuid,
            },
          ];

    return {
      conditions,
    };
  }, [current.uuid, position]);

  const [getUsedNvmeLunCount, { data: useData }] = useLazyQuery(nvmeLunCount, {
    variables: usedDefaultQuery,
  });

  const [getUnUsedNvmeLunCount, { data: unUseData }] = useLazyQuery(
    nvmeLunCount,
    {
      variables: unUsedDefaultQuery,
    },
  );

  useMount(() => {
    getUsedNvmeLunCount();
    getUnUsedNvmeLunCount();
  });

  return (
    <>
      <RadioGroup
        defaultValue="Used"
        style={{ marginBottom: 8 }}
        onValueChange={(value) => setTabType(value as "Used" | "UnUsed")}
        variant="outline"
        options={[
          {
            value: "Used",
            label: intl.formatMessage(
              { id: "Used.n", defaultMessage: "Used ({n})" },
              { n: useData?.nvmeLunList?.total ?? 0 },
            ),
          },
          {
            value: "UnUsed",
            label: intl.formatMessage(
              {
                id: "UnUsed.n",
                defaultMessage: "Unused ({n})",
              },
              { n: unUseData?.nvmeLunList?.total ?? 0 },
            ),
          },
        ]}
      />

      <NvmeLunList
        view="sub.nvme.target"
        source={current}
        defaultQuery={
          tabType === "Used" ? usedDefaultQuery : unUsedDefaultQuery
        }
      />
    </>
  );
};

export default LunList;
