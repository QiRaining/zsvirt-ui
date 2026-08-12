import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

const STYLE_COLOR_NEUTRAL_500 = { color: "var(--neutral-500)" } as const;

interface IProps {
  detail: IZsvRole;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch: any;
}

const BasicInfo: FC<IProps> = ({ detail, onCollapseChange, collapsed }) => {
  const intl = useIntl();

  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.user.count",
          defaultMessage: "Users",
        }),
        value: detail?.userCount,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.user.group.count",
          defaultMessage: "User Groups",
        }),
        value: detail?.userGroupCount,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: detail.description || (
          <span style={STYLE_COLOR_NEUTRAL_500}>
            {intl.formatMessage({
              id: "none",
              defaultMessage: "None",
            })}
          </span>
        ),
      },
      {
        label: "UUID",
        value: detail.uuid,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate!).format("YYYY-MM-DD HH:mm:ss"),
        key: "createDate",
      },
    ],
    [intl, getServerTime, detail],
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
