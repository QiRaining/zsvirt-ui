import { Tag } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import {
  Constant,
  ItemList,
  List,
  ShareType,
  ResourceName,
} from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import type { IllustrationTypes } from "@zstack/zsphere-illustration";
import { Illustration } from "@zstack/zsphere-illustration";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { GuestToolsState } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import { compact, flatten, partition } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import {
  getGuestIcon,
  useGetGuestNameEnum,
} from "zsv_resource_shared/image/utils";

const STYLE_TAG_ICON = {
  marginRight: 4,
  verticalAlign: "text-bottom",
} as const;
const STYLE_SPAN_MARGIN = { marginLeft: 2 } as const;
const STYLE_MARGIN_RIGHT = { marginRight: 4 } as const;

interface IProps {
  detail: IVM;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  setEditConfigVisible: (visible: boolean) => void;
}

function sumArray(arr: number[]): number {
  return arr?.reduce((acc, val) => acc + val, 0);
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { currentUser } = usePlatformStore();
  const isAdmin = currentUser?.currentIdentity === "Admin" || false;
  const guestNameEnum = useGetGuestNameEnum();
  const zstateIcon = getGuestIcon(detail?.guestOsType, guestNameEnum)?.icon;
  const { getServerTime } = useTime();
  const haEnabled = detail?.vmHa?.haLevel === "NeverStop";

  const ipList = useMemo(() => {
    const usedIps = compact(
      flatten(
        detail?.vmNics?.map((item) => item.usedIps?.map(({ ip }) => ip)) ?? [],
      ),
    );
    const [ipv6List, ipv4List] = partition(usedIps, (item) =>
      item.includes(":"),
    );
    return { ipv4List, ipv6List };
  }, [detail]);

  const vmToolsVersion =
    detail.toolsInfo?.version || detail.guestToolsState?.version;

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "template.size",
          defaultMessage: "Template Capacity",
        }),
        value:
          //
          sumArray(detail?.allVolumes?.map((it) => it.size) as number[]) === 0
            ? "-"
            : formatBytesToSize(
                sumArray(
                  detail?.allVolumes?.map((it) => it.size) as number[],
                ) || 0,
              ),
      },
      {
        label: intl.formatMessage({
          id: "guestOsType",
          defaultMessage: "OS",
        }),
        value: zstateIcon && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Illustration
              style={STYLE_TAG_ICON}
              type={zstateIcon as IllustrationTypes}
              size={16}
            />
            {detail?.guestOsType}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "ipv4.address",
          defaultMessage: "IPv4 Address",
        }),
        number: ipList.ipv4List.length,
        value:
          ipList.ipv4List.length > 0 ? (
            <ItemList
              ellipsis
              toggle
              needWrap
              copyable
              value={ipList.ipv4List}
            />
          ) : undefined,
      },
      {
        label: intl.formatMessage({
          id: "ipv6.address",
          defaultMessage: "IPv6 Address",
        }),
        number: ipList.ipv6List.length,
        value:
          ipList.ipv6List.length > 0 ? (
            <ItemList
              ellipsis
              toggle
              needWrap
              copyable
              value={ipList.ipv6List}
            />
          ) : undefined,
      },
      {
        label: intl.formatMessage({
          id: "ha.mode",
          defaultMessage: "HA Mode",
        }),
        value: haEnabled
          ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
          : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      },
      {
        label: intl.formatMessage({ id: "vm.tool", defaultMessage: "VMtools" }),
        value: (
          <div className="flex">
            <div style={{ flex: 1 }}>
              <div>
                <Constant
                  value={
                    (detail.toolsState ?? GuestToolsState.Uninstall) as any
                  }
                  enumType={ConstantType.GuestToolsState}
                />
                {detail.toolsState === GuestToolsState.Installed &&
                  vmToolsVersion && (
                    <span style={STYLE_SPAN_MARGIN}>
                      {intl.formatMessage(
                        {
                          id: "vm.field.vmGuesttool.tooltip",
                          defaultMessage: "(Version {version})",
                        },
                        { version: vmToolsVersion },
                      )}
                    </span>
                  )}
              </div>
            </div>
          </div>
        ),
      },
      {
        label: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
        value: <ResourceName value={detail?.owner?.name} />,
      },
      {
        label: intl.formatMessage({
          id: "shareType",
          defaultMessage: "Sharing Mode",
        }),
        value: <ShareType type={detail?.shareType ?? -1} />,
      },
      {
        label: intl.formatMessage({ id: "tag", defaultMessage: "Tag" }),
        number: detail?.tag?.length,
        value: detail?.tag?.length ? (
          <ItemList
            ellipsis
            toggle
            value={detail.tag.map((item) => (
              <Tag
                color={item.color}
                key={item.uuid}
                style={STYLE_MARGIN_RIGHT}
              >
                {item.name}
              </Tag>
            ))}
          />
        ) : undefined,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: <LongText value={detail?.description || undefined} canModify />,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{detail.uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate ?? -1).format(
          "YYYY-MM-DD HH:mm:ss",
        ),
      },
    ],
    [detail, intl, getServerTime, zstateIcon, haEnabled, ipList],
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
        <List
          list={isAdmin ? list : list.filter((it) => it.label !== "owner")}
          bordered={false}
        />
      </DraggableCard>
    </>
  );
};

export default BasicInfo;
