import { DraggableCard } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Status from "../../../../components/status";

import style from "./style.module.less";

interface IProps {
  detail: HostVO;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

interface IConfigInfoItem {
  label: string;
  value: string | React.ReactNode;
}

const ConfigInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const list = useMemo(() => {
    const _list: IConfigInfoItem[] = [
      {
        label: intl.formatMessage({
          id: "host.ipmi.address",
          defaultMessage: "IPMI Address",
        }),
        value: (
          <CopyableText className={style.ipmi} copyText={detail?.ipmiAddress}>
            <a
              onClick={() => {
                window.open(
                  `${window.location.protocol}//${detail.ipmiAddress}`,
                );
              }}
            >
              {detail?.ipmiAddress}
            </a>
          </CopyableText>
        ),
      },
      {
        label: intl.formatMessage({
          id: "host.ipmi.port",
          defaultMessage: "IPMI Port",
        }),
        value: detail.ipmiPort,
      },
      {
        label: intl.formatMessage({
          id: "host.ipmi.username",
          defaultMessage: "IPMI Username",
        }),
        value: detail.ipmiUsername,
      },
      {
        label: intl.formatMessage({
          id: "iommuState",
          defaultMessage: "IOMMU State",
        }),
        value:
          detail.hostIommu?.state === "Enabled"
            ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
            : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      },
    ];

    if (detail.hostIommu?.state === "Enabled") {
      _list.push({
        label: intl.formatMessage({
          id: "iommuReadyStatus",
          defaultMessage: "IOMMU Status",
        }),
        value: <Status state={detail?.hostIommu?.status as string} />,
      });
    }

    const supportEpt = detail.architecture === "x86_64";
    if (supportEpt) {
      _list.push({
        label: intl.formatMessage({
          id: "intelEptHardwareAssist",
          defaultMessage: "Intel EPT Hardware Assist",
        }),
        value: detail.hostSystemInfo?.ept
          ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
          : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      });
    }
    return _list;
  }, [detail, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default ConfigInfo;
