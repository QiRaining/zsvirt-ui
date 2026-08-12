import type { IQuery } from "@zstack/zsphere-types";
import { Op, EndPointType } from "@zstack/zsphere-types";
import type {
  DingTalkEndPoint,
  EndPoint,
  FeiShuEndPoint,
} from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import SNSDingTalkAtPersonList from "../../sns-dingtalk-at-person/list";
import SNSFeiShuAtPersonList from "../../sns-feishu-at-person/list";
import SNSWeComAtPersonList from "../../sns-wecom-at-person/list";

interface IProps {
  detail: EndPoint;
  refetch: any;
}

const AtPersonInfo: FC<IProps> = ({ detail }) => {
  const _intl = useIntl();

  const defaultQuery = useMemo<IQuery>(
    () => ({
      conditions: [
        {
          key: "endpointUuid",
          op: Op.eq,
          value: detail?.uuid,
        },
      ],
    }),
    [detail?.uuid],
  );

  return (
    <div>
      {detail.type === EndPointType.FeiShu && (
        <SNSFeiShuAtPersonList
          defaultQuery={defaultQuery}
          view="sub.notify.person"
          source={detail as FeiShuEndPoint}
        />
      )}

      {detail.type === EndPointType.WeCom && (
        <SNSWeComAtPersonList
          defaultQuery={defaultQuery}
          view="sub.notify.person"
          source={detail as FeiShuEndPoint}
        />
      )}

      {detail.type === EndPointType.DingTalk && (
        <SNSDingTalkAtPersonList
          defaultQuery={defaultQuery}
          view="sub.notify.person"
          source={detail as DingTalkEndPoint}
        />
      )}
    </div>
  );
};

export default AtPersonInfo;
