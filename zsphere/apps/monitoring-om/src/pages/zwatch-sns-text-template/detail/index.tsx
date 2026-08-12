import { useQuery } from "@apollo/client";
import { Tabs, TabPane } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { snsTextTemplateList } from "../../../gql/zwatch-sns-text-template.gql";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";

import style from "./style.module.less";

const Detail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery(snsTextTemplateList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          value: uuid,
        },
      ],
    },
  });
  const { list = [] } = data?.snsTextTemplateList ?? {};
  const current = list?.[0] ?? {};

  useActionSubscribe({
    resourceTypeList: ["SNSTextTemplate"],
    onProgress: () => {
      refetch?.();
    },
  });

  return (
    <AutoSkeleton name="sns-text-template-detail" loading={loading}>
      {current?.uuid ? (
        <div className="main-list">
          <Header current={current} refetch={refetch} />
          <Tabs className={style.tabs} type="line">
            <TabPane
              key="overview"
              tab={intl.formatMessage({
                id: "overview",
                defaultMessage: "Overview",
              })}
            >
              <Overview current={current} refetch={refetch} />
            </TabPane>
            <TabPane
              key="audit"
              tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
              auth={{
                type: "view",
                authKey: "list",
                resource: "auditing",
              }}
            >
              <Audit current={current} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default Detail;
