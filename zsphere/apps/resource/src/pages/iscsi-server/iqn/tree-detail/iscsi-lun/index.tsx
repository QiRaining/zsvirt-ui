import { useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { iscsiLunCount } from "@zstack/virtualization-resource/src/gql/iscsi-lun.gql";
import IscsiLunList from "@zstack/virtualization-resource/src/pages/iscsi-lun/list";
import { Op } from "@zstack/zsphere-types";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import { useMount } from "ahooks";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

const RADIO_GROUP_STYLE = { marginBottom: 8 } as const;

interface IProps {
  current: Partial<IIscsiServer>;
}

const IscsiLunSubList: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const [tabType, setTabType] = useState<"Used" | "UnUsed">("Used");
  const usedDefaultQuery = useMemo(() => {
    const conditions = [
      {
        key: "iscsiTargetUuid",
        op: Op.eq,
        value: current?.uuid,
      },
      {
        key: "__GetUsedLunByIscsiTargetUuids__",
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
        key: "iscsiTargetUuid",
        op: Op.eq,
        value: current?.uuid,
      },
      {
        key: "__GetUnUsedLunByIscsiTargetUuids__",
        op: Op.eq,
        value: current?.uuid,
      },
    ];

    return {
      conditions,
    };
  }, [current?.uuid]);

  const [getUsedIscsiLunCount, { data: useData }] = useLazyQuery(
    iscsiLunCount,
    {
      variables: usedDefaultQuery,
    },
  );

  const [getUnUsedIscsiLunCount, { data: unUseData }] = useLazyQuery(
    iscsiLunCount,
    {
      variables: unUsedDefaultQuery,
    },
  );

  useMount(() => {
    getUsedIscsiLunCount();
    getUnUsedIscsiLunCount();
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
              { n: useData?.iscsiLunList?.total ?? 0 },
            ),
          },
          {
            value: "UnUsed",
            label: intl.formatMessage(
              {
                id: "UnUsed.n",
                defaultMessage: "Unused ({n})",
              },
              { n: unUseData?.iscsiLunList?.total ?? 0 },
            ),
          },
        ]}
      />
      <IscsiLunList
        view="sub.virtualization.iqn"
        source={current}
        defaultQuery={
          tabType === "Used" ? usedDefaultQuery : unUsedDefaultQuery
        }
      />
    </>
  );
};

export default IscsiLunSubList;
