import type { IDetailNavPageGroup } from "@zstack/zsphere-components";
import { DetailNav } from "@zstack/zsphere-components";
// import { useQuery } from '@apollo/client'
import { Op } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  // ClusterRelatedSummary as IClusterRelatedSummary
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
// import { getClusterRelatedSummary } from '@zstack/hardware/src/gql/cluster.gql'
import L2NetworkList from "zsv_resource/l2-network/list";

import ChassisList from "../../../baremetal-chassis/list";
import PxeServerList from "../../../baremetal-pxe-server/list";

interface IProps {
  current: ICluster;
}

const Config: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  // const { uuid } = current

  // const { data: count } = useQuery<{ getClusterRelatedSummary: IClusterRelatedSummary }>(
  //   getClusterRelatedSummary,
  //   {
  //     variables: {
  //       uuid
  //     }
  //   }
  // )
  // const { getClusterRelatedSummary: _summary } = count || {}
  // const summary = useMemo<IClusterRelatedSummary>(() => {
  //   if (_summary) {
  //     return _summary
  //   }
  //   return {
  //     host: 0,
  //     primaryStorage: 0,
  //     iscsiServer: 0,
  //     l2Network: 0,
  //     physicalNic: 0,
  //     gpu: 0,
  //     vGpu: 0,
  //     usb: 0,
  //     pci: 0
  //   }
  // }, [_summary])

  const hardwarePageList: IDetailNavPageGroup[] = [
    {
      key: "hardware.facility",
      name: intl.formatMessage({
        id: "hardwareFacility",
        defaultMessage: "Hardware",
      }),
      children: [
        {
          key: "pxe.server",
          name: intl.formatMessage({
            id: "pxeServer",
            defaultMessage: "Deployment Server",
          }),
          // count: summary.l2Network,
          showTitle: true,
          page: (
            <PxeServerList
              source={current}
              view="sub.baremetal.cluster"
              defaultQuery={{
                conditions: [
                  {
                    key: "cluster.uuid",
                    value: current.uuid,
                    op: Op.eq,
                  },
                ],
              }}
            />
          ),
        },
        {
          key: "baremetal.chassis",
          name: intl.formatMessage({
            id: "baremetalChassis",
            defaultMessage: "Bare Metal Chassis",
          }),
          // count: summary.l2Network,
          showTitle: true,
          page: (
            <ChassisList
              view="sub.baremetal.cluster"
              source={current}
              defaultQuery={{
                conditions: [
                  {
                    key: "cluster.uuid",
                    value: current.uuid,
                    op: Op.eq,
                  },
                ],
              }}
            />
          ),
        },
        {
          key: "l2Network",
          name: intl.formatMessage({
            id: "l2Network",
            defaultMessage: "Distributed Switch",
          }),
          // count: summary.l2Network,
          showTitle: true,
          page: (
            <L2NetworkList
              view="sub.baremetal.cluster"
              source={current}
              defaultQuery={{
                conditions: [
                  {
                    key: "cluster.uuid",
                    value: current.uuid,
                    op: Op.eq,
                  },
                ],
              }}
            />
          ),
        },
      ],
    },
  ];
  return (
    <>
      <DetailNav pageList={hardwarePageList} />
    </>
  );
};

export default Config;
