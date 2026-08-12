import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import {
  ItemList,
  List,
  ResourceName,
  DraggableCard,
  Tag,
} from "@zstack/zsphere-components";
import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { transformRoleName } from "../../../../role/utils";

interface IProps {
  detail: IUserGroup;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch: any;
}

const STYLE_TEXT_NEUTRAL_500 = { color: "var(--neutral-500)" } as const;

const BasicInfo: FC<IProps> = ({ detail, onCollapseChange, collapsed }) => {
  const intl = useIntl();

  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.group.user.count",
          defaultMessage: "Users",
        }),
        value: detail.groupUserCount,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.role",
          defaultMessage: "Role",
        }),
        number: detail.role?.length,
        value: detail.role?.length ? (
          <ItemList
            toggle
            ellipsis
            needWrap
            value={detail?.role?.map((role) => {
              return (
                <div className="flex items-center gap-1" key={role?.uuid}>
                  <ResourceName
                    value={transformRoleName(intl, {
                      uuid: role?.uuid,
                      name: role?.name,
                    })}
                    link={{
                      to: `/role`,
                      microAppName: "virtualization-administration",
                      uuid: role?.uuid,
                    }}
                  />
                  {role?.type === ZsvRoleQueryType.Predefined && (
                    <Tag round level="weak">
                      {intl.formatMessage({
                        id: "default",
                        defaultMessage: "Default",
                      })}
                    </Tag>
                  )}
                </div>
              );
            })}
          />
        ) : (
          <span style={STYLE_TEXT_NEUTRAL_500}>
            {intl.formatMessage({
              id: "none",
              defaultMessage: "None",
            })}
          </span>
        ),
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: detail.description || (
          <span style={STYLE_TEXT_NEUTRAL_500}>
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
