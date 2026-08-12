import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useState } from "react";

import { Platform } from "../../../constant";
import Create from "../../../create";
import EmailOrDingtalk from "./email-dingtalk";
import MicrosoftTeams from "./microsoft-teams";

interface IProps {
  detail: ISNSTextTemplate;
  refetch?: Function;
}

const AlarmInfo: FC<IProps> = ({ detail, refetch }) => {
  const { applicationPlatformType = Platform.DingTalk } = detail;
  const [visible, setVisible] = useState(false);
  const getContent = (platform: string) => {
    let content = null;
    switch (platform) {
      case Platform.Email:
      case Platform.DingTalk:
      case Platform.WeCom:
      case Platform.FeiShu:
        content = (
          <EmailOrDingtalk
            setVisible={setVisible}
            current={detail}
            refetch={refetch}
          />
        );
        break;
      case Platform.MicrosoftTeams:
      case Platform.HTTP:
        content = <MicrosoftTeams current={detail} refetch={refetch} />;
        break;
    }

    return (
      <>
        {content}
        <Create
          modalType="edit"
          visible={visible}
          setVisible={setVisible}
          selectedList={[detail]}
          source={detail}
          position="header"
          view="main.virtualization"
        />
      </>
    );
  };

  return getContent(applicationPlatformType);
};

export default AlarmInfo;
