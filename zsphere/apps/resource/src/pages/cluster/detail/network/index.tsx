import { RadioGroup } from "@zstack/design";
import { AuthCheck } from "@zstack/virtualization-resource/src/components/no-permission-page/context";
import { useAuth, usePersistTabState } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import { merge } from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import L2NetworkList from "../../../l2-network/list";
import L3NetworkList from "../../../l3-network/list";

export interface IProps {
  current: ICluster;
  refetch: Function;
}

const radioGroupStyle = { marginBottom: 12 } as const;

const Network: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const hasL2NetworkAuth = hasAuth({
    resource: "virtualization.l2.network",
    authKey: "list",
    type: "view",
  });

  const { activeKey, onChange } = usePersistTabState(
    "network-radio",
    hasL2NetworkAuth ? ["l2", "l3"] : ["l3"],
  );
  const l2DefaultQuery = React.useMemo(() => {
    return {
      conditions: [
        {
          key: "cluster.uuid",
          value: current.uuid,
          op: Op.eq,
        },
        {
          key: "type",
          op: Op.ne,
          value: "portGroup",
        },
      ],
    };
  }, [current.uuid]);

  const l3DefaultQuery = React.useMemo(() => {
    return {
      conditions: [
        {
          key: "clusterUuid",
          value: current.uuid,
          op: Op.eq,
        },
      ],
    };
  }, [current.uuid]);

  const [l3Query, setl3Query] = useState<IQuery>(() =>
    merge({}, l3DefaultQuery),
  );

  useActionSubscribe({
    resourceTypeList: ["L2Network"],
    onFinish: () => {
      setl3Query(merge({}, l3Query, { random: genUuid() })); // refetch L3列表
    },
  });

  // if the uuid has been changed, update the query, resolve the page cache issue
  useEffect(() => {
    const newQuery = { ...l3Query };
    const clusterUuidItem = newQuery.conditions?.find(
      (item) => item.key === "clusterUuid",
    );
    if (clusterUuidItem) {
      clusterUuidItem.value = current.uuid;
      setl3Query(newQuery);
    }
  }, [current.uuid]);

  return (
    <AuthCheck
      resourceTypes={["virtualization.l2.network", "virtualization.l3.network"]}
    >
      <div>
        <RadioGroup
          variant="outline"
          value={activeKey}
          style={radioGroupStyle}
          onValueChange={onChange}
          options={[
            ...(hasL2NetworkAuth
              ? [
                  {
                    value: "l2",
                    label: intl.formatMessage(
                      {
                        id: "virtualization.cluster.detail.l2.tab.n",
                        defaultMessage: "Distributed Switch ({n})",
                      },
                      { n: current?.l2NetworkCount ?? 0 },
                    ),
                  },
                ]
              : []),
            ...(hasAuth({
              resource: "virtualization.l3.network",
              authKey: "list",
              type: "view",
            })
              ? [
                  {
                    value: "l3",
                    label: intl.formatMessage(
                      {
                        id: "virtualization.zone.detail.l3.tab.n",
                        defaultMessage: "Distributed Port Group ({n})",
                      },
                      { n: current?.l3NetworkCount ?? 0 },
                    ),
                  },
                ]
              : []),
          ]}
        />

        {activeKey === "l2" && (
          <L2NetworkList
            view="sub.virtualization.cluster"
            customView="custom"
            withResourceAttribute
            defaultQuery={l2DefaultQuery}
            source={current}
          />
        )}
        {activeKey === "l3" && (
          <L3NetworkList
            view="sub.virtualization.l2-network"
            customView="custom"
            withResourceAttribute
            defaultQuery={l3Query}
            source={current}
          />
        )}
      </div>
    </AuthCheck>
  );
};

export default Network;
