import { useLazyQuery } from "@apollo/client";
import type { IDetailDrawerProps } from "@zstack/zsphere-components";
import { Detail as ZSVDetail } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import { physicalNicList } from "../../../gql/host.gql";
import { useActionConfig } from "../config";
import LLDPInfo from "./lldp";
import Overview from "./overview";

export interface IProps {
  /**
   * 是否可编辑 （为了方便其他模块引用这个详情，控制是否可编辑）
   */
  canEdit?: boolean;
  current: any;
  visible: boolean;
  onClose: () => void;
  getContainer?: DrawerProps["getContainer"];
  source?: any;
}

const Detail: React.FC<IProps> = ({
  canEdit = true,
  current: detail,
  source,
  visible,
  onClose,
  getContainer,
}) => {
  const intl = useIntl();
  const [query, { data, refetch }] = useLazyQuery(physicalNicList);
  const current = useMemo(
    () => ({
      ...detail,
      ...data?.physicalNicList?.list?.[0],
    }),
    [detail, data],
  );
  const actionConfig = useActionConfig({ source: current });

  const tabTabPanes = useMemo<IDetailDrawerProps["tabTabPanes"]>(
    () => [
      {
        key: "overview",
        tab: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        children: <Overview current={current} />,
        action: canEdit
          ? {
              view: "sub.host",
              position: "header",
              menuList: actionConfig.list,
              viewMap: actionConfig.viewMap,
              source,
              selectedList: [current],
            }
          : undefined,
      },
      {
        key: "lldp",
        tab: intl.formatMessage({ id: "LLDP", defaultMessage: "LLDP" }),
        children: <LLDPInfo canEdit={canEdit} current={current} />,
      },
    ],
    [actionConfig, canEdit, current, intl],
  );

  useActionSubscribe({
    resourceTypeList: ["HostNetworkInterface"],
    onFinish: () => {
      refetch?.();
    },
  });

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

  return (
    <ZSVDetail.Drawer
      visible={visible}
      onClose={onClose}
      tabTabPanes={tabTabPanes}
      getContainer={getContainer}
    />
  );
};

export default Detail;
