import { gql, useLazyQuery } from "@apollo/client";
import type { IDetailDrawerProps } from "@zstack/zsphere-components";
import { Detail as ZSVDetail } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { ActionTaskState } from "@zstack/zsphere-types";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import { useActionConfig } from "../config";
import AuditSubList from "./audit";
import Overview from "./overview";
import RelatedResource from "./related-resource";

const kmsProviderList = gql`
  query kmsProviderList($uuid: CondtionValue!) {
    kmsProviderList(conditions: [{ key: "uuid", value: $uuid }]) {
      total
      list {
        uuid
        name
        description
        type
        isDefault
        connected
        endpoint
        port
        username
        trustState
        activeIdentityUuid
        activeIdentity {
          uuid
          certExpiredDate
        }
        serverCertExpiredDate
        serverCertPem
        backedUp
        createDate
      }
    }
  }
`;

export interface IProps {
  detail: any;
  visible: boolean;
  onClose: () => void;
  getContainer?: () => HTMLElement;
}

export default function Detail({
  visible,
  onClose,
  detail,
  getContainer,
}: IProps) {
  const intl = useIntl();
  const actionConfig = useActionConfig();

  const [query, { data, refetch }] = useLazyQuery(kmsProviderList, {
    fetchPolicy: "no-cache",
  });

  const current = useMemo(() => {
    return {
      ...detail,
      ...data?.kmsProviderList?.list?.[0],
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

  useActionSubscribe({
    resourceTypeList: ["KmsProvider"],
    onProgress: (result) => {
      if (
        result.listenerType === "DeleteKmsProvider" &&
        result.state === ActionTaskState.success &&
        result.id === current.uuid
      ) {
        onClose();
      }
    },
  });

  const tabTabPanes = React.useMemo<IDetailDrawerProps["tabTabPanes"]>(
    () => [
      {
        key: "overview",
        tab: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
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
      {
        key: "relatedResource",
        tab: intl.formatMessage({
          id: "related.resource",
          defaultMessage: "Associated Resource",
        }),
        children: <RelatedResource current={current} />,
      },
      {
        key: "audit",
        tab: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        children: <AuditSubList current={current} />,
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
