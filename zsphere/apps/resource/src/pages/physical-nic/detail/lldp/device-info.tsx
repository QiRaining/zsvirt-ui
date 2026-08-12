import { useLazyQuery } from "@apollo/client";
import { useTime } from "@zstack/hooks";
import { physicalNicLLDPDevice } from "@zstack/virtualization-resource/src/gql/host.gql";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Empty, Spin, DraggableCard } from "@zstack/zsphere-components";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "../style.module.less";

// 盛科
const CENTEC_AGGREGATION_PORT_ID = 4294965248;

export interface IProps {
  current?: PhysicalNic;
}

export default function DeviceInfo({ current }: IProps) {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const [query, { data, loading }] = useLazyQuery(physicalNicLLDPDevice);

  useEffect(() => {
    if (current?.uuid) {
      query({
        variables: {
          interfaceUuid: current.uuid,
          hostId: current.hostUuid,
          lldpUuid: current.lLDPMode?.uuid,
        },
      });
    }
  }, [current, query]);

  // 盛科
  const isCentec =
    data?.physicalNicLLDPDevice?.aggregationPortId ===
    CENTEC_AGGREGATION_PORT_ID;

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "LLdp.device.chassisId",
          defaultMessage: "Chassis ID",
        }),
        value: data?.physicalNicLLDPDevice?.chassisId,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "LLdp.device.chassisId.info",
              defaultMessage: `Device ID refers to the chassis ID, which represents the bridge MAC address of the sending device.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.portId",
          defaultMessage: "Port ID",
        }),
        value: data?.physicalNicLLDPDevice?.portId,
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.managementAddress",
          defaultMessage: "Management Address",
        }),
        value: data?.physicalNicLLDPDevice?.managementAddress,
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.timeToLive",
          defaultMessage: "Time To Live",
        }),
        value: data?.physicalNicLLDPDevice?.timeToLive,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "LLdp.device.timeToLive.info",
              defaultMessage: `TTL, short for Time to Live, represents the time duration that this device's information remains alive on neighboring devices.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.portDescription",
          defaultMessage: "Port Description",
        }),
        value: data?.physicalNicLLDPDevice?.portDescription,
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.systemName",
          defaultMessage: "System Name",
        }),
        value: data?.physicalNicLLDPDevice?.systemName,
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.systemDescription",
          defaultMessage: "System Description",
        }),
        value: data?.physicalNicLLDPDevice?.systemDescription,
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.systemCapabilities",
          defaultMessage: "System Capabilities",
        }),
        value: data?.physicalNicLLDPDevice?.systemCapabilities,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "LLdp.device.systemCapabilities.info",
              defaultMessage: `System Features
System Features refer to the main functions and used features of a system, indicating its primary capabilities.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.vlanId",
          defaultMessage: "Vlan Id",
        }),
        value: data?.physicalNicLLDPDevice?.vlanId,
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.linkAggregation",
          defaultMessage: "Link Aggregation",
        }),
        value:
          !isCentec &&
          typeof data?.physicalNicLLDPDevice?.aggregationPortId === "number"
            ? intl.formatMessage({
                id: "aggregated",
                defaultMessage: "Aggregated",
              })
            : intl.formatMessage({
                id: "notAggregated",
                defaultMessage: "Not Aggregated",
              }),
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "LLdp.device.linkAggregation.info",
              defaultMessage: `Aggregate State`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.aggregationPortID",
          defaultMessage: "Aggregation port ID",
        }),
        show: !isCentec,
        value: data?.physicalNicLLDPDevice?.aggregationPortId,
      },
      {
        label: intl.formatMessage({
          id: "LLdp.device.maximumFrameSize",
          defaultMessage: "Maximum Frame Size",
        }),
        value: data?.physicalNicLLDPDevice?.mtu,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "LLdp.device.maximumFrameSize.info",
              defaultMessage: `### MTU
MTU specifies the maximum transmission unit (MTU) value for port configuration, representing the maximum frame size supported by the port, namely Maximum Frame Size.`,
            })}
          </ReactMarkdown>
        ),
      },
    ],
    [intl, data, isCentec],
  );

  return (
    <DraggableCard
      title={
        <>
          {intl.formatMessage({
            id: "LLdp.device.info",
            defaultMessage: "Peer Device Information",
          })}

          {data?.physicalNicLLDPDevice?.lastOpDate ? (
            <span className={styles.lldpTitle}>
              {intl.formatMessage({
                id: "lastUpdateDate",
                defaultMessage: "Last updated at",
              })}
              ：
              {getServerTime(data?.physicalNicLLDPDevice?.lastOpDate).format(
                "YYYY-MM-DD HH:mm:ss",
              )}
            </span>
          ) : null}
        </>
      }
    >
      <Spin spinning={loading}>
        {data?.physicalNicLLDPDevice ? (
          <List list={list} bordered={false} />
        ) : (
          <Empty
            type="Select"
            description={intl.formatMessage({
              id: "LLdp.device.info.empty.title",
              defaultMessage: "No available peer device information. Check whether LLDP is enabled on the peer device.",
            })}
          />
        )}
      </Spin>
    </DraggableCard>
  );
}
