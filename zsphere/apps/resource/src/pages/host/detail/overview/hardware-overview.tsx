import { useQuery } from "@apollo/client";
import { Divider } from "@zstack/design";
import { physicalNicCount } from "@zstack/virtualization-resource/src/gql/host.gql";
import NumaTopologyModal from "@zstack/virtualization-resource/src/pages/host/action/numa-topology/numa-topology-modal";
import {
  Constant,
  DraggableCard,
  List,
  useSetTab,
} from "@zstack/zsphere-components";
import { ConstantEnum } from "@zstack/zsphere-constant";
import type {
  HostVO,
  PhysicalNicCountResp,
} from "@zstack/zsphere-types/graphql";
import { Space } from "antd";
import { get } from "lodash-es";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  detail: HostVO;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const PhysicalNicCountField: FC<{ uuid: string }> = ({ uuid }) => {
  const { setTabMultiple } = useSetTab();

  const intl = useIntl();
  const { data } = useQuery<{ physicalNicCount: PhysicalNicCountResp }>(
    physicalNicCount,
    {
      variables: {
        hostUuid: uuid,
      },
    },
  );
  const nicCount = get(data, "physicalNicCount", {
    up: 0,
    down: 0,
  } as PhysicalNicCountResp);
  const goToPhysicalNic = () => {
    setTabMultiple([
      { contentId: "main-tab", newKey: "hardware.devices" },
      { contentId: "host-hardware-divices", newKey: "host.netcard" },
    ]);
  };

  return (
    <div className={styles.physicalNicCountField}>
      <Space size={4} split={<Divider type="vertical" />} align="center">
        <Space size={4} align="center">
          <Constant value={ConstantEnum.UP} />
          <span>{nicCount.up}</span>
        </Space>
        <Space size={4} align="center">
          <Constant value={ConstantEnum.DOWN} />
          <span>{nicCount.down}</span>
        </Space>
      </Space>

      <span className={styles.link} onClick={goToPhysicalNic}>
        {intl.formatMessage({
          id: "view",
          defaultMessage: "View",
        })}
      </span>
    </div>
  );
};

const NUMAField: FC<{ uuid: string; name: string }> = ({ uuid, name }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      <span onClick={() => setVisible(true)} className="action-link">
        {intl.formatMessage({
          id: "read.pnuma.topology",
          defaultMessage: "View pNUMA Topology",
        })}
      </span>
      <NumaTopologyModal
        hostName={name}
        hostUuid={uuid}
        visible={visible}
        setVisible={setVisible}
      />
    </>
  );
};

const HardwareOverview: FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();

  const list = useMemo(() => {
    const { hostSystemInfo, architecture, cpuNum, uuid, name } = detail;

    const {
      systemProductName,
      systemSerialNumber,
      hostCpuModelName,
      cpuGHz,
      cpuSocketCoreThread,
      cpuProcessorNum,
    } = hostSystemInfo || {};

    const cpuLogicNum =
      (cpuSocketCoreThread?.sockets || 1) *
        (cpuSocketCoreThread?.coresPerSocket || 1) ||
      cpuProcessorNum ||
      cpuNum;

    return [
      {
        label: intl.formatMessage({
          id: "host.model",
          defaultMessage: "Host Model",
        }),
        value: systemProductName,
      },
      {
        label: intl.formatMessage({
          id: "SN.serialNumber",
          defaultMessage: "Serial Number",
        }),
        value: systemSerialNumber,
      },
      {
        label: intl.formatMessage({
          id: "cpu.model",
          defaultMessage: "CPU Model",
        }),
        value: hostCpuModelName,
      },
      {
        label: intl.formatMessage({ id: "cpu.ghz", defaultMessage: "CPU Clock Speed" }),
        value: cpuGHz ? `${cpuGHz} GHz` : "",
      },
      {
        label: intl.formatMessage({
          id: "cpu.physical.core.count",
          defaultMessage: "Physical CPU Cores",
        }),
        value: intl.formatMessage(
          { id: "n.core", defaultMessage: "{n} cores" },
          {
            n: cpuLogicNum || 0,
          },
        ),
      },
      {
        label: intl.formatMessage({
          id: "cpu.logical.core.count",
          defaultMessage: "Logical CPU Cores",
        }),
        value: intl.formatMessage(
          { id: "n.core", defaultMessage: "{n} cores" },
          {
            n: cpuNum || 0,
          },
        ),
      },
      {
        label: intl.formatMessage({
          id: "cpu.architecture",
          defaultMessage: "CPU Architecture",
        }),
        value: architecture,
      },
      {
        label: intl.formatMessage({
          id: "physical.nic",
          defaultMessage: "Physical NIC",
        }),
        value: <PhysicalNicCountField uuid={uuid} />,
      },
      {
        label: intl.formatMessage({ id: "numa", defaultMessage: "NUMA" }),
        value: <NUMAField uuid={uuid || ""} name={name || ""} />,
      },
    ];
  }, [detail, intl]);
  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "hardware.overview",
        defaultMessage: "Hardware Overview",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default HardwareOverview;
