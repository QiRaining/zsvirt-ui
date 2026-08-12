import { useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { fiberChannelLunCount } from "@zstack/virtualization-resource/src/gql/fiber-channel-lun.gql";
import FCLunList from "@zstack/virtualization-resource/src/pages/fiber-channel-lun/list";
import { Op } from "@zstack/zsphere-types";
import type { FiberChannelStorage as IFiberChannelStorage } from "@zstack/zsphere-types/graphql";
import { useMount } from "ahooks";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

const RADIO_GROUP_STYLE = { marginBottom: 8 } as const;

interface IProps {
  current: Partial<IFiberChannelStorage>;
}

const FiberChannelLunList: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const [tabType, setTabType] = useState<"Used" | "UnUsed">("Used");
  const usedDefaultQuery = useMemo(() => {
    const conditions = [
      {
        key: "fiberChannelStorageUuid",
        op: Op.eq,
        value: current?.uuid,
      },
      {
        key: "__GetUsedLunByFiberChannelStorageUuids__",
        op: Op.eq,
        value: current?.uuid,
      },
    ];

    return {
      conditions,
    };
  }, [current?.uuid]);

  const unUsedDefaultQuery = useMemo(() => {
    const conditions = [
      {
        key: "fiberChannelStorageUuid",
        op: Op.eq,
        value: current?.uuid,
      },
      {
        key: "__GetUnUsedLunByFiberChannelStorageUuids__",
        op: Op.eq,
        value: current?.uuid,
      },
    ];

    return {
      conditions,
    };
  }, [current?.uuid]);

  const [getUsedFiberChannelLunCount, { data: useData }] = useLazyQuery(
    fiberChannelLunCount,
    {
      variables: usedDefaultQuery,
    },
  );

  const [getUnUsedFiberChannelLunCount, { data: unUseData }] = useLazyQuery(
    fiberChannelLunCount,
    {
      variables: unUsedDefaultQuery,
    },
  );

  useMount(() => {
    getUsedFiberChannelLunCount();
    getUnUsedFiberChannelLunCount();
  });

  return (
    <>
      <RadioGroup
        defaultValue="Used"
        style={RADIO_GROUP_STYLE}
        onValueChange={(value) => setTabType(value as "Used" | "UnUsed")}
        variant="outline"
        options={[
          {
            value: "Used",
            label: intl.formatMessage(
              { id: "Used.n", defaultMessage: "Used ({n})" },
              { n: useData?.fiberChannelLunList?.total ?? 0 },
            ),
          },
          {
            value: "UnUsed",
            label: intl.formatMessage(
              {
                id: "UnUsed.n",
                defaultMessage: "Unused ({n})",
              },
              { n: unUseData?.fiberChannelLunList?.total ?? 0 },
            ),
          },
        ]}
      />
      <FCLunList
        view="sub.fiber-channel-storage"
        source={current}
        defaultQuery={
          tabType === "Used" ? usedDefaultQuery : unUsedDefaultQuery
        }
      />
    </>
  );
};

export default FiberChannelLunList;
