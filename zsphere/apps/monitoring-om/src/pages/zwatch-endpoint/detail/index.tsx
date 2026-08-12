import { useQuery } from "@apollo/client";
import { TabPane, Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { EndPointType as IEndPointType, Op } from "@zstack/zsphere-types";
import React, { useMemo, useReducer } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { snsApplicationEndpoint } from "../../../gql/zwatch-endpoint.gql";
import EmailAddressList from "../../zwatch-endpoint-address/list";
import SmsAddressList from "../../zwatch-endpoint-sms-address/list";
import type { ComposedEndPoint } from "../action/update-sns-at-object";
import AlarmMessage from "./alram-message";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";
import SNSAtPersonInfo from "./sns-at-person-info";
import ZWatch from "./zwatch";

const ZWatchEndpointDetail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery(snsApplicationEndpoint, {
    variables: {
      uuid,
    },
    fetchPolicy: "no-cache",
  });
  const current = React.useMemo(() => {
    return data?.snsApplicationEndpoint;
  }, [data, uuid]);

  const zwatchEndpointAddressName = useMemo(() => {
    if (current?.type === IEndPointType.Email) {
      return intl.formatMessage({
        id: "mail",
        defaultMessage: "Email Address",
      });
    }
    return intl.formatMessage({
      id: "sms.address",
      defaultMessage: "SMS Address",
    });
  }, [current, intl]);

  // 手动更新报警器列表
  const [zwatchKey, updateKey] = useReducer((x) => x + 1, 1);
  useActionSubscribe({
    resourceTypeList: ["EndPoint"],
    onProgress: (result) => {
      if (!result?.inventory) {
        updateKey();
      }
    },
    onFinish: () => {
      refetch?.();
    },
  });
  useActionSubscribe({
    resourceTypeList: [
      "SNSFeiShuAtPerson",
      "SNSDingTalkAtPerson",
      "SNSWeComAtPerson",
      "EndPointSmsAddress",
    ],
    onFinish() {
      refetch?.();
    },
  });

  return (
    <AutoSkeleton name="zwatch-endpoint-detail" loading={loading}>
      {current ? (
        <div className="main-list">
          <Header current={current} refetch={refetch} />
          <Tabs type="line">
            <TabPane
              tab={intl.formatMessage({
                id: "overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <Overview current={current} refetch={refetch} />
            </TabPane>
            {((current as ComposedEndPoint)?.atPersonList?.length ?? 0) > 0 && (
              <TabPane
                tab={intl.formatMessage({
                  id: "specifyMember",
                  defaultMessage: "Specify Member",
                })}
                key="member"
              >
                <SNSAtPersonInfo detail={current} refetch={refetch} />
              </TabPane>
            )}
            {[IEndPointType.Email, IEndPointType.AliyunSms].includes(
              current?.type,
            ) ? (
              <TabPane tab={zwatchEndpointAddressName} key="address">
                {current?.type === "Email" ? (
                  <EmailAddressList
                    view="main"
                    defaultQuery={{
                      conditions: [
                        {
                          key: "endpointUuid",
                          op: Op.eq,
                          value: current?.uuid,
                        },
                      ],
                    }}
                    currentEndpoint={current}
                  />
                ) : (
                  <SmsAddressList
                    view="main"
                    defaultQuery={{
                      conditions: [
                        {
                          key: "uuid",
                          op: Op.eq,
                          value: current?.uuid,
                        },
                      ],
                    }}
                    currentEndpoint={current}
                  />
                )}
              </TabPane>
            ) : (
              ""
            )}
            <TabPane
              tab={intl.formatMessage({
                id: "zwatchAlarm",
                defaultMessage: "Alarm",
              })}
              key="zwatch"
            >
              <ZWatch current={current} key={zwatchKey} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "recievedMessage",
                defaultMessage: "Received Messages",
              })}
              key="message"
            >
              <AlarmMessage current={current} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
              key="audit"
            >
              <Audit current={current} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default ZWatchEndpointDetail;
