import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import {
  List,
  Constant,
  Link,
  DraggableCard,
} from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { EndPointType } from "@zstack/zsphere-types";
import type {
  EmailEndPoint,
  DingTalkEndPoint as IDingTalkEndPoint,
  EndPoint as IEndPoint,
  SmsEndPoint as ISmsEndPoint,
} from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { getEndpointLocaleLabel } from "../../action/schema";
import type { ComposedEndPoint } from "../../action/update-sns-at-object";
import useEndPointTypeMap from "../../hooks/use-end-point-type-map";
import Modify from "../../modify";

import style from "./style.module.less";

interface IProps {
  detail: IEndPoint;
  refetch: any;
  className?: string;
}

const BasicInfo: FC<IProps> = ({ detail, className }) => {
  const intl = useIntl();
  const endPointTypeMap = useEndPointTypeMap({ hasSystem: true });
  const { uuid, createDate, type, topic, description } = detail;
  const { atAll, atPersonList } = detail as ComposedEndPoint;
  const [visible, setVisible] = useState<boolean>(false);
  const { getServerTime } = useTime();

  const obj: string = useMemo(() => {
    if (atAll) {
      return intl.formatMessage({
        id: "zwatch.endpoint.atAll",
        defaultMessage: "@All",
      });
    }
    if (atPersonList?.length) {
      return intl.formatMessage({
        id: "zwatch.endpoint.atPerson",
        defaultMessage: "@Specified Member",
      });
    }
    return intl.formatMessage({
      id: "zwatch.endpoint.no_specify",
      defaultMessage: "@Nobody",
    });
  }, [detail]);

  const list: ListItem[] = useMemo(() => {
    let arr: ListItem[] = [
      {
        label: intl.formatMessage({
          id: "enable.state",
          defaultMessage: "State",
        }),
        value: <Constant value={detail?.state as any} />,
      },
      {
        label: intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        }),
        value: endPointTypeMap.get(type as EndPointType),
      },
    ];
    if (type === EndPointType.Email) {
      arr.push({
        label: intl.formatMessage({
          id: "snsEmailPlatform",
          defaultMessage: "Email Server",
        }),
        value: (
          <Link
            to="/email-server"
            microAppName="virtualization-administration"
            key={1}
          >
            {`${(detail as EmailEndPoint).platform?.name}`}
          </Link>
        ),
      });
    }
    if (type === EndPointType.AliyunSms) {
      arr.push({
        label: intl.formatMessage({
          id: "accesskey.key",
          defaultMessage: "AccessKey ID ",
        }),
        value: (detail as ISmsEndPoint)?.accessKey?.akey,
      });
    }
    if (
      type &&
      ![EndPointType.Email, EndPointType.AliyunSms, EndPointType.SNMP].includes(
        type,
      )
    ) {
      arr = arr.concat([
        {
          label: intl.formatMessage({
            id: "address",
            defaultMessage: "Address",
          }),
          value: (detail as IDingTalkEndPoint)?.url,
          copyable: true,
        },
      ]);
    }
    if (type && [EndPointType.FeiShu, EndPointType.DingTalk].includes(type)) {
      arr.push({
        label: intl.formatMessage({
          id: "securitySetting",
          defaultMessage: "Security Setting",
        }),
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zwatch.endpoint.securitySetting.tooltip",
              defaultMessage: `### Security Setting

Select the security settings that you set for the robot on the 3rd-party platform.

- Signature: Paste the signature key below to ensure that third-party applications receive alarm messages correctly.
- Other: Set a security policy other than Signature for the robot on the 3rd-party platform, choose this option.
    - Custom Keywords: Alarm messages must contain at least one custom keyword to be sent successfully. If you choose this method, make sure you add "Alarm" as the keyword. Otherwise, alarm messages will fail to send.
    - IP Address:  Only requests from within the specified IP address range will be processed by third-party applications. If you choose this method, add the management node IP address and VIP of the platform to the bot's IP allowlist to ensure that third-party applications receive alert messages correctly.`,
            })}
          </ReactMarkdown>
        ),
        value: (detail as IDingTalkEndPoint)?.secret
          ? intl.formatMessage({
              id: "securitySetting.signature",
              defaultMessage: "Signature",
            })
          : intl.formatMessage({
              id: "securitySetting.other",
              defaultMessage: "Other",
            }),
      });
      if (detail.secret) {
        arr.push({
          label: intl.formatMessage({
            id: "common.secret",
            defaultMessage: "Key",
          }),
          value: <Text password>{(detail as IDingTalkEndPoint)?.secret}</Text>,
        });
      }
    }
    if (
      type &&
      [EndPointType.FeiShu, EndPointType.DingTalk, EndPointType.WeCom].includes(
        type,
      )
    ) {
      arr = arr.concat([
        {
          label: intl.formatMessage({
            id: "zwatch.endpoint.notify_member",
            defaultMessage: "Mention Member",
          }),
          value: obj,
          icon: "info",
          iconTooltip: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "zwatch.endpoint.field.notify_member.tooltip",
                defaultMessage: `### Mention Member
A DingTalk, Lark, or WeCom endpoint sends alarm messages to the 3rd-party platform through a group robot. The group robot can use an "@" symbol to mention group members who need to pay attention to the messages.

1.  @Nobody: When an alarm is triggered, the robot only sends an alarm message to the group without @ anyone.

2. @All: When an alarm is triggered, the robot sends an alarm message to the group and @ all group members to pay attention to it.
3. @Specified Members: When an alarm is triggered, the robot sends an alarm message to the group and @ the specified members to pay attention to it.`,
              })}
            </ReactMarkdown>
          ),
        },
      ]);
    }
    if (
      type &&
      [
        EndPointType.Email,
        EndPointType.DingTalk,
        EndPointType.MicrosoftTeams,
        EndPointType.FeiShu,
        EndPointType.WeCom,
      ].includes(type)
    ) {
      arr.push({
        label: intl.formatMessage({
          id: "endpointLocale",
          defaultMessage: "Message Language",
        }),
        value: getEndpointLocaleLabel(intl, topic?.locale),
      });
    }

    if (type === EndPointType.SNMP) {
      arr.push({
        label: intl.formatMessage({
          id: "snmp.trap",
          defaultMessage: "SNMP Trap Receiver",
        }),
        value: detail?.platform?.name,
        children: [
          {
            label: intl.formatMessage({
              id: "ip.address",
              defaultMessage: "IP Address",
            }),
            value: detail?.platform?.snmpAddress,
            copyable: true,
          },
          {
            label: intl.formatMessage({ id: "port", defaultMessage: "Port" }),
            value: detail?.platform?.snmpPort,
            copyable: true,
          },
        ],
      });
    }

    arr = arr.concat([
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value:
          detail?.type === "SYSTEM_HTTP"
            ? intl.formatMessage({
                id: "system.defined.endpoint.description",
                defaultMessage: "endpoint for reporting system defined alarms",
              })
            : description || null,
      },
      {
        label: intl.formatMessage({
          id: "UUID",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{uuid}</CopyableText>,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ]);
    return arr;
  }, [detail, intl]);
  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        className={cls(style.container, className)}
        isList
        collapsed={false}
        titleActions={
          detail?.type === "SYSTEM_HTTP"
            ? []
            : [
                {
                  icon: "edit",
                  tooltip: intl.formatMessage({
                    id: "edit.config",
                    defaultMessage: "Modify Configuration",
                  }),
                  onClick() {
                    setVisible(true);
                  },
                },
              ]
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <Modify
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

export default BasicInfo;
