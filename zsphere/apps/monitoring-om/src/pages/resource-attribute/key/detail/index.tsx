import { useQuery } from "@apollo/client";
import { Tabs2 as Tabs, TabPane2 as TabPane } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { ActionTaskState, Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { queryResourceAttributeKey } from "../../../../gql/resource-attribute.gql";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";

export interface IProps {
  uuid?: string;
}

export default function Detail({ uuid }: IProps) {
  const intl = useIntl();
  const navigate = useNavigate();

  const { loading, data, refetch } = useQuery(queryResourceAttributeKey, {
    variables: {
      conditions: [
        {
          key: "uuid",
          op: Op.eq,
          value: uuid ?? "",
        },
      ],
    },
  });

  useActionSubscribe({
    resourceTypeList: ["ResourceAttributeKey"],
    onProgress: (result) => {
      refetch();
      if (
        result.listenerType === "DeleteResourceAttributeKey" &&
        result.state === ActionTaskState.success &&
        result.id === uuid
      ) {
        navigate("/resource-attribute", {
          replace: true,
        });
      }
    },
  });

  const current = data?.queryResourceAttributeKeyList?.list?.[0];

  return (
    <AutoSkeleton name="resource-attribute-key-detail" loading={loading}>
      {current ? (
        <div className="zsv-detail-container">
          <Header current={current} refetch={refetch} />
          <Tabs type="line" contentId="main-tab">
            <TabPane
              key="overview"
              tab={intl.formatMessage({
                id: "overview",
                defaultMessage: "Overview",
              })}
            >
              <Overview current={current} />
            </TabPane>
            <TabPane
              key="auditing"
              tab={intl.formatMessage({
                id: "auditing",
                defaultMessage: "Event",
              })}
            >
              <Audit current={current} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
}
