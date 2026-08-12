import { useLazyQuery } from "@apollo/client";
import { bondList } from "@zstack/virtualization-resource/src/gql/bond.gql";
import PhysicalNicList from "@zstack/virtualization-resource/src/pages/physical-nic/list";
import type { IDetailDrawerProps } from "@zstack/zsphere-components";
import { Detail as ZSVDetail } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { Host } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import { useActionConfig } from "../config";
import Overview from "./overview";

export interface IProps {
  source?: Host;
  canEdit?: boolean;
  current: any;
  visible: boolean;
  onClose: () => void;
  getContainer?: any;
}

const BondDetail: React.FC<IProps> = ({
  current: detail,
  visible,
  onClose,
  getContainer,
}) => {
  const intl = useIntl();
  const actionConfig = useActionConfig({});
  const [query, { data, refetch }] = useLazyQuery(bondList);
  useEffect(() => {
    if (visible && detail?.uuid) {
      query({
        variables: {
          conditions: [
            {
              key: "uuid",
              op: Op.eq,
              value: detail.uuid,
            },
          ],
        },
      });
    }
  }, [query, detail?.uuid, visible]);

  useActionSubscribe({
    resourceTypeList: ["Bond"],
    onFinish: () => {
      refetch?.();
    },
  });

  const current = useMemo(
    () => ({
      ...detail,
      ...data?.bondList?.list?.[0],
    }),
    [detail, data],
  );

  const attachedPhysicalNicUuids = useMemo(() => {
    return current.slaves?.map((item: { uuid: any }) => item.uuid!);
  }, [current]);
  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "uuid",
          op: Op.in,
          values: attachedPhysicalNicUuids,
        },
        {
          key: "hostUuid",
          op: Op.eq,
          value: current?.hostUuid,
        },
      ],
      sortBy: "interfaceName",
    }),
    [attachedPhysicalNicUuids, current?.hostUuid],
  );
  const tabTabPanes = useMemo<IDetailDrawerProps["tabTabPanes"]>(
    () => [
      {
        key: "substract",
        tab: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        children: <Overview current={current} />,
        action: {
          view: "sub.host.virtualization.bond",
          position: "header",
          menuList: actionConfig.list,
          viewMap: actionConfig.viewMap,
          selectedList: [current],
        },
      },
      {
        key: "physicalCard",
        tab: intl.formatMessage({
          id: "physicalCard",
          defaultMessage: "Physical NIC",
        }),
        children: (
          <PhysicalNicList
            view="sub.bond.physicalNic"
            defaultQuery={defaultQuery}
            showDetail={false}
            source={detail}
          />
        ),
      },
    ],
    [actionConfig, current, intl],
  );

  return (
    <ZSVDetail.Drawer
      visible={visible}
      onClose={onClose}
      tabTabPanes={tabTabPanes}
      getContainer={getContainer}
    />
  );
};

export default BondDetail;
