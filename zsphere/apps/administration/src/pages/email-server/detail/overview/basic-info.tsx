import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Constant, DraggableCard } from "@zstack/zsphere-components";
import type { EmailServerSetting as IEmailServerSetting } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";
import { ShareType } from "zsv_administration_shared/account-information/mf-index";

interface IProps {
  detail: IEmailServerSetting;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: () => void;
}

const BasicInfo: FC<IProps> = ({ detail, onCollapseChange, collapsed }) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "enable.state",
          defaultMessage: "State",
        }),
        value: <Constant value={detail?.state as any} />,
      },
      {
        label: intl.formatMessage({
          id: "shareType",
          defaultMessage: "Sharing Mode",
        }),
        value: <ShareType type={detail?.shareType ?? ""} />,
        auth: {
          type: "block",
          resource: "email.server",
          authKey: "all.resource",
        },
      },
      {
        label: intl.formatMessage({
          id: "owner",
          defaultMessage: "Owner",
        }),
        value: detail?.owner?.name,
        auth: {
          type: "block",
          resource: "email.server",
          authKey: "all.resource",
        },
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: detail?.description,
      },
      {
        label: "UUID",
        value: detail?.uuid,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "smtp.server",
          defaultMessage: "SMTP Server",
        }),
        value: detail?.emailPlat?.smtpServer,
      },
      {
        label: intl.formatMessage({
          id: "smtp.port",
          defaultMessage: "SMTP Port",
        }),
        value: detail?.emailPlat?.smtpPort,
      },
      {
        label: intl.formatMessage({
          id: "user.name",
          defaultMessage: "Username",
        }),
        value: detail?.emailPlat?.username,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [intl, detail],
  );

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    </>
  );
};

export default BasicInfo;
