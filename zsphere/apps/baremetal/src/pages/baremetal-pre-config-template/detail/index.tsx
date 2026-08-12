import { gql, useLazyQuery } from "@apollo/client";
import type { IDetailDrawerProps } from "@zstack/zsphere-components";
import { Detail as ZSVDetail } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { PreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import { useActionConfig } from "../config";
import Audit from "./audit";
import Overview from "./overview";

export interface IProps {
  source?: PreconfigurationTemplate;
  canEdit?: boolean;
  current: any;
  visible: boolean;
  onClose: () => void;
  getContainer?: any;
}

const QUERY_PRECONFIGURATION_TEMPLATE_LIST = gql`
  query preconfigurationTemplateList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    preconfigurationTemplateList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        uuid
        type
        isPredefined
        customParams
        owner {
          name
          uuid
        }
        state
        description
        content
        distribution
        createDate
        lastOpDate
        md5sum
      }
      total
    }
  }
`;

const PreConfigTemplateDetail: React.FC<IProps> = ({
  current: detail,
  visible,
  onClose,
  getContainer,
}) => {
  const intl = useIntl();

  const actionConfig = useActionConfig();

  const [query, { data, refetch }] = useLazyQuery(
    QUERY_PRECONFIGURATION_TEMPLATE_LIST,
  );

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
    resourceTypeList: ["PreconfigurationTemplate"],
    onFinish: () => {
      refetch?.();
    },
  });

  const current = useMemo(
    () => ({
      ...detail,
      ...data?.preconfigurationTemplateList?.list?.[0],
    }),
    [detail, data],
  );

  const tabTabPanes = useMemo<IDetailDrawerProps["tabTabPanes"]>(
    () => [
      {
        key: "overview",
        tab: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        children: <Overview current={current} />,
        action: {
          view: "main",
          position: "header",
          menuList: actionConfig.list,
          viewMap: actionConfig.viewMap,
          selectedList: [current],
        },
      },
      {
        key: "audit",
        tab: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        children: <Audit current={current} />,
      },
    ],
    [current, intl],
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

export default PreConfigTemplateDetail;
