import { useLazyQuery } from "@apollo/client";
import { hostKernelInterface } from "@zstack/virtualization-resource/src/gql/host-kernel-interface.gql";
import { useActionConfig } from "@zstack/virtualization-resource/src/pages/host-kernel-interface/config";
import type { IDetailDrawerProps } from "@zstack/zsphere-components";
import { Detail as ZSVDetail } from "@zstack/zsphere-components";
import type { HostKernelInterface as IHostKernelInterface } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import Overview from "./overview";

export interface IProps {
  detail: any;
  visible: boolean;
  onClose: () => void;
  getContainer?: () => HTMLElement;
}

interface IHostKernelInterfaceResp {
  hostKernelInterface?: IHostKernelInterface;
}

export default function Detail({
  visible,
  onClose,
  detail,
  getContainer,
}: IProps) {
  const intl = useIntl();
  const actionConfig = useActionConfig();

  const [query, { data, refetch }] =
    useLazyQuery<IHostKernelInterfaceResp>(hostKernelInterface);

  const current = useMemo<IHostKernelInterface>(() => {
    return {
      ...detail,
      ...data?.hostKernelInterface,
    };
  }, [detail, data]);

  useEffect(() => {
    if (visible && detail?.uuid) {
      query({
        variables: {
          uuid: detail.uuid,
        },
      });
    }
  }, [visible, detail?.uuid, query]);

  const tabTabPanes = React.useMemo<IDetailDrawerProps["tabTabPanes"]>(
    () => [
      {
        key: "overview",
        tab: intl.formatMessage({
          id: "virtualization.overview",
          defaultMessage: "Overview",
        }),
        action: {
          view: "main",
          position: "header",
          menuList: actionConfig.list,
          viewMap: actionConfig.viewMap,
          selectedList: [current],
          refetch,
        },
        children: <Overview current={current} />,
      },
    ],
    [actionConfig, intl, refetch, current],
  );

  return (
    <ZSVDetail.Drawer
      visible={visible}
      onClose={onClose}
      tabTabPanes={tabTabPanes}
      getContainer={getContainer}
    />
  );
}
