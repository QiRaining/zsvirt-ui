import { gql, useQuery } from "@apollo/client";
import { Text, Tooltip } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { formatGroupName } from "@zstack/virtualization-resource/src/pages/directory/utils";
import type { ListItem } from "@zstack/zsphere-components";
import {
  Constant,
  DraggableCard,
  ItemList,
  List,
  ShareType,
} from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { ConstantType } from "@zstack/zsphere-constant";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import { Illustration } from "@zstack/zsphere-illustration";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import { compact, flatten, partition } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const ICON_STYLE = { marginRight: 4, verticalAlign: "text-bottom" } as const;
import {
  getGuestIcon,
  useGetGuestNameEnum,
} from "zsv_resource_shared/image/utils";

import style from "./style.module.less";

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

interface IProps {
  detail: IVM;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  setEditConfigVisible: (visible: boolean) => void;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const guestNameEnum = useGetGuestNameEnum();

  const zstateIcon = getGuestIcon(detail?.guestOsType, guestNameEnum)?.icon;

  const { data, loading: globalHaLoading } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "ha",
      name: "enable",
    },
  });

  const globalHaConfig = data?.globalConfig?.value;

  const globalHaEnabled = globalHaLoading || globalHaConfig === "true";

  const haEnabled = detail.vmHa?.haLevel === "NeverStop";

  const runtime = useMemo(() => {
    if (!detail.uptime) {
      return null;
    }
    const uptimeTimestamp = dayjs(detail.uptime).valueOf();
    if (!uptimeTimestamp) {
      return null;
    }
    const currentTimestamp = getServerTime().valueOf();
    const millseconds = currentTimestamp - uptimeTimestamp;
    const seconds = Math.floor(millseconds / 1000);
    return formatSecToPeriod(seconds, intl);
  }, [detail.uptime, getServerTime, intl]);

  const ipList = useMemo(() => {
    const usedIps = compact(
      flatten(
        detail?.vmNics?.map((item) => item.usedIps?.map(({ ip }) => ip)) ?? [],
      ),
    );
    const [ipv6List, ipv4List] = partition(usedIps, (item: string) =>
      item.includes(":"),
    );
    return { ipv4List, ipv6List };
  }, [detail]);

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "common.state",
          defaultMessage: "Status",
        }),
        value: (
          <Constant
            value={detail?.state as unknown as ConstantEnum}
            enumType={ConstantType.VmInstanceState}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "guestOsType",
          defaultMessage: "OS",
        }),
        value: zstateIcon && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Illustration style={ICON_STYLE} type={zstateIcon} size={16} />
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
          id: "runtime",
          defaultMessage: "Uptime",
        }),
        value: runtime || "-",
      },
      {
        label: intl.formatMessage({
          id: "high.availability",
          defaultMessage: "High Availability",
        }),
        value: (
          <div className={style.haAlert}>
            {haEnabled
              ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
              : intl.formatMessage({ id: "close", defaultMessage: "Disabled" })}
            {haEnabled && !globalHaEnabled ? (
              <Tooltip
                title={intl.formatMessage({
                  id: "vm.field.ha.alert.global.policy.disabled",
                  defaultMessage:
                    "The HA policy is not enabled on the platform. VM HA will take effect after HA policy is enabled.",
                })}
              >
                <Icon className={style.haAlertIcon} type="alert-triangle-fill" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "consoleAddress",
          defaultMessage: "Console Address",
        }),
        value:
          detail?.consoleAddress && detail.consoleAddress.length > 0 ? (
            <CopyableText>{detail.consoleAddress.join(",")}</CopyableText>
          ) : undefined,
      },
      {
        label: intl.formatMessage({
          id: "owner",
          defaultMessage: "Owner",
        }),
        value: <Text>{detail?.owner?.name}</Text>,
      },
      {
        label: intl.formatMessage({
          id: "groupBy",
          defaultMessage: "Group",
        }),
        auth: {
          type: "block",
          authKey: "vm.directory.tree",
          resource: "vm",
        },
        value: (
          <Text>
            {formatGroupName(
              detail?.group?.groupName,
              detail?.group?.uuid,
              intl,
            )}
          </Text>
        ),
      },
      {
        label: intl.formatMessage({
          id: "shareMode",
          defaultMessage: "Sharing Mode",
        }),
        auth: {
          type: "block",
          authKey: "share.type",
          resource: "common",
        },
        value: <ShareType type={detail?.shareType ?? -1} />,
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
      //  去除所有最后操作时间
    ],
    [
      detail,
      intl,
      getServerTime,
      zstateIcon,
      globalHaEnabled,
      haEnabled,
      ipList,
      runtime,
    ],
  );

  return (
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
  );
};

export default BasicInfo;
