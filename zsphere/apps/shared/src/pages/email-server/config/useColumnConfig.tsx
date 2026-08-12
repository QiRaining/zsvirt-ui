import { Text } from "@zstack/design";
import { ShareType, useShareTypeFilters } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/email-server";
import { SNSApplicationPlatformState } from "@zstack/zsphere-types";
import type { EmailServerSetting as IEmailServerSetting } from "@zstack/zsphere-types/graphql";

import style from "./style.module.less";

interface IProps {
  view: string;
  onClickName?: (row: IEmailServerSetting) => void;
}

export default (props: IProps) => {
  const { view, onClickName } = props;

  const shareTypeFilters = useShareTypeFilters(view);

  return useColumnConfig<IEmailServerSetting>([
    {
      key: "shareType",
      render: (row: IEmailServerSetting) => {
        return <ShareType type={row.shareType!} />;
      },
      filters: shareTypeFilters,
      filterEnumType: ConstantType.ShareType,
    },
    {
      key: "state",
      filterOptions: SNSApplicationPlatformState,
    },
    {
      key: "ownerName",
      render: (row: IEmailServerSetting) => <Text>{row?.owner?.name}</Text>,
    },
    {
      key: "smtpPort",
      render: (row: IEmailServerSetting) => (
        <Text>{row?.emailPlat?.smtpPort}</Text>
      ),
    },
    {
      key: "smtpServer",
      render: (row: IEmailServerSetting) => (
        <Text>{row?.emailPlat?.smtpServer}</Text>
      ),
    },
    {
      key: "username",
      render: (row: IEmailServerSetting) => (
        <Text>{row?.emailPlat?.username}</Text>
      ),
    },
    {
      key: "name",
      render: (it: IEmailServerSetting) => {
        const noRenderButtonView = [
          "select.virtualization.endpoint.create",
          "select.virtualization.endpoint.create.normal",
        ];
        return noRenderButtonView.includes(view) ? (
          <Text>{it?.name}</Text>
        ) : (
          <Text className={style.columnName}>
            <span
              onClick={() => {
                onClickName?.(it);
              }}
            >
              {it?.name}
            </span>
          </Text>
        );
      },
    },
  ]);
};
