import { useQuery, gql } from "@apollo/client";
import { Op } from "@zstack/zsphere-types";
import type { EndPoint as IEndPoint } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import AlarmMessage from "zsv_shared/alarm-message/list";

const globalConfig = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      value
    }
  }
`;

interface IProps {
  current: Partial<IEndPoint>;
}

enum MessageType {
  AlarmAndEvent = "AlarmAndEvent",
  ThirdParty = "ThirdParty",
}

const AlarmMessageTab: React.FC<IProps> = ({ current }) => {
  const _intl = useIntl();
  const [_currentMessageType, _setCurrentMessageType] = useState(
    MessageType.AlarmAndEvent,
  );

  // 判断第三方消息报警消息是否显示
  const [_showThirdparty, _setShowThirdparty] = useState("false");
  const { data: _data } = useQuery(globalConfig, {
    variables: {
      category: "zwatch",
      name: "thirdpartyAlert.enable",
    },
    onCompleted(data) {
      console.log("data?.globalConfig?.value::", data?.globalConfig?.value);
      setShowThirdparty(data?.globalConfig?.value);
    },
  });

  return (
    <AlarmMessage
      view="sub"
      source={current}
      defaultQuery={{
        type: "endpointAlarm",
        extraConditions: [
          {
            key: "endpointTopicUuid",
            op: Op.eq,
            value: current?.topic?.uuid,
          },
        ],
      }}
    />
  );
};

export default AlarmMessageTab;
