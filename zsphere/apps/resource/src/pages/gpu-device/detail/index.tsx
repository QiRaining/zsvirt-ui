import { useQuery } from "@apollo/client";
import { Tabs, TabPane } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import AuditList from "zsv_auditing/auditing-sub-list";

import { gpuDeviceList } from "../../../gql/gpu-device.gql";
import Header from "./header";
import Overview from "./overview";

import style from "./style.module.less";

const HostDetail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery(gpuDeviceList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          value: uuid,
        },
      ],
    },
  });
  const { list = [] } = data?.pciDeviceList || {};
  const current = list?.[0] || {};

  return (
    <AutoSkeleton name="gpu-device-detail" loading={loading}>
      {current?.uuid ? (
        <div className={style.container}>
          <Header current={current} refetch={refetch} />
          <Tabs className={style.tabs} type="card">
            <TabPane
              tab={intl.formatMessage({
                id: "overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <Overview current={current} refetch={refetch} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
              key="audit"
              auth={{
                type: "view",
                resource: "auditing",
                authKey: "list",
              }}
            >
              <div className={style["list-content"]}>
                <AuditList
                  view="sub"
                  defaultQuery={{
                    conditions: [
                      {
                        key: "resourceUuid",
                        op: Op.eq,
                        value: current.uuid,
                      },
                    ],
                  }}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default HostDetail;
