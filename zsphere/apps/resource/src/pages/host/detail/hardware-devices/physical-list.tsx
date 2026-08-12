import { useQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { bondResouceCount } from "@zstack/virtualization-resource/src/gql/bond.gql";
import BondList from "@zstack/virtualization-resource/src/pages/bond/list";
import PhysicalNicList from "@zstack/virtualization-resource/src/pages/physical-nic/list";
import type { Host } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

const RADIO_GROUP_STYLE = { marginBottom: 12 } as const;

interface IProps {
  source: Host;
  getDetailContainer: any;
}

export const PhysicalList: React.FC<IProps> = ({
  source,
  getDetailContainer,
}) => {
  const intl = useIntl();
  const [tab, setTab] = useState<"bond" | "physical.networkInterface">(
    "physical.networkInterface",
  );

  const tabMap = useMemo(
    () => ({
      "physical.networkInterface": intl.formatMessage({
        id: "physical.networkInterface",
        defaultMessage: "Physical NIC",
      }),
      bond: intl.formatMessage({
        id: "AggPort",
        defaultMessage: "Bond",
      }),
    }),
    [intl],
  );

  const count = useQuery(bondResouceCount, {
    variables: {
      hostUuid: source.uuid,
    },
  });

  const countMap = {
    bond: count.data?.bondResouceCount?.bond ?? 0,
    "physical.networkInterface": count.data?.bondResouceCount?.nic ?? 0,
  };

  const queryCondition = useMemo(() => {
    return [
      {
        key: "hostUuid",
        value: source?.uuid,
      },
    ];
  }, [source]);

  return (
    <>
      <RadioGroup
        style={RADIO_GROUP_STYLE}
        defaultValue={tab}
        onValueChange={(value) => {
          setTab(value as "bond" | "physical.networkInterface");
          window.history.replaceState(
            {
              ...window.history.state,
              sortBy: undefined,
              sortDirection: undefined,
            },
            "",
          );
        }}
        variant="outline"
        options={Object.entries(tabMap).map(([value, text]) => ({
          value,
          label: `${text} (${countMap[value as "bond"]})`,
        }))}
      />
      {tab === "physical.networkInterface" && (
        <PhysicalNicList
          source={source}
          view="sub.host.virtualization"
          defaultQuery={{
            conditions: queryCondition,
            sortBy: "interfaceName",
          }}
          getDetailContainer={getDetailContainer}
        />
      )}
      {tab === "bond" && (
        <BondList
          source={source}
          view="sub.host.virtualization"
          actionRefetch={count.refetch}
          defaultQuery={{
            conditions: queryCondition,
          }}
          getDetailContainer={getDetailContainer}
        />
      )}
    </>
  );
};
