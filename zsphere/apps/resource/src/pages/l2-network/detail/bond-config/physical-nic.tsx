import { RadioGroup } from "@zstack/design";
import HostList from "@zstack/virtualization-resource/src/pages/host/list";
import UplinkGroupList from "@zstack/virtualization-resource/src/pages/uplink-group/list";
import { Auth } from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import { HostQueryType, Op } from "@zstack/zsphere-types";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const DIV_MARGIN_TOP_STYLE = { marginTop: "20px" } as const;
const RADIO_GROUP_STYLE = { marginBottom: 12 } as const;

interface IProps {
  current: IL2Network;
  addedUplinkGroupCount?: number;
  notAddedBondCount?: number;
}

const Instance: React.FC<IProps> = ({
  current,
  addedUplinkGroupCount,
  notAddedBondCount,
}) => {
  const intl = useIntl();
  const [tabType, setTabType] = useState<"added" | "notAdded">("added");

  const uplinkGroupDefaultQuery = useMemo<IQuery>(() => {
    return {
      conditions: [
        {
          key: "l2NetworkUuid",
          op: Op.eq,
          value: current.uuid,
        },
      ],
    };
  }, [current.uuid]);

  const notAddedBondDefaultQuery = useMemo<IQuery>(() => {
    return {
      type: HostQueryType.GetHostNotInVSwitch,
      extraConditions: [
        {
          key: "vswitchUuid",
          value: current?.uuid,
          op: Op.eq,
        },
        {
          key: "bondingName",
          value: current?.physicalInterface,
          op: Op.eq,
        },
      ],
      conditions: [
        {
          key: "clusterUuid",
          op: Op.in,
          values: current?.attachedClusterUuids ?? [],
        },
      ],
    };
  }, [current]);

  return (
    <Auth resource="physicalNic" authKey="hostInfo" type="block">
      <div className={style.container} style={DIV_MARGIN_TOP_STYLE}>
        <RadioGroup
          variant="outline"
          defaultValue="added"
          style={RADIO_GROUP_STYLE}
          onValueChange={(val) => setTabType(val as "added" | "notAdded")}
          options={[
            {
              value: "added",
              label: intl.formatMessage(
                {
                  id: "virtualization.vswitch.added.host.tab.n",
                  defaultMessage: "Joined host ({n})",
                },
                {
                  n: addedUplinkGroupCount,
                },
              ),
            },
            {
              value: "notAdded",
              label: intl.formatMessage(
                {
                  id: "virtualization.vswitch.not.added.host.tab.n",
                  defaultMessage: "Unjoined Host ({n})",
                },
                {
                  n: notAddedBondCount,
                },
              ),
            },
          ]}
        />

        {tabType === "added" && (
          <UplinkGroupList
            view="main"
            source={current}
            defaultQuery={uplinkGroupDefaultQuery}
          />
        )}
        {tabType === "notAdded" && (
          <HostList
            hidenTagSearch
            view="sub.virtualization.not.in.vswitch"
            source={current}
            defaultQuery={notAddedBondDefaultQuery}
          />
        )}
      </div>
    </Auth>
  );
};

export default Instance;
