import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { Constant, List, Empty } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { ConstantType } from "@zstack/zsphere-constant";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

import CreatePxeModal from "../../../baremetal-pxe-server/action/create-modal";

import style from "./style.module.less";

interface IProps {
  clusterDetail: ICluster;
  refetch?: () => void;
}

const ConfigInfo: React.FC<IProps> = ({
  clusterDetail,
  refetch: bmClusterRefetch,
}: IProps) => {
  const intl = useIntl();
  const { getServerTime } = useTime();
  const [createPxeVisible, setCreatePxeVisible] = useState(false);

  useActionSubscribe({
    resourceTypeList: ["BaremetalPxeServer"],
    onFinish: () => {
      bmClusterRefetch?.();
    },
  });

  const memoizedSelectedList = useMemo(() => [clusterDetail], [clusterDetail]);

  const detail = clusterDetail?.baremetalPxeServer;

  const list: ListItem[] = [
    {
      label: intl.formatMessage({
        id: "baremetal.pex.server.hostname",
        defaultMessage: "Deployment Server IP",
      }),
      value: <CopyableText>{detail?.hostname}</CopyableText>,
    },
    {
      label: intl.formatMessage({
        id: "connect.status",
        defaultMessage: "Connection Status",
      }),
      value: (
        <Constant
          value={detail?.status as unknown as ConstantEnum}
          enumType={ConstantType.BaremetalPxeServerStatus}
        />
      ),
    },
    {
      label: intl.formatMessage({
        id: "baremetal.pex.server.sshPort",
        defaultMessage: "SSH Port",
      }),
      value: detail?.sshPort,
    },
    {
      label: intl.formatMessage({
        id: "baremetal.pex.server.storagePath",
        defaultMessage: "Storage Path",
      }),
      value: detail?.storagePath,
    },
    {
      label: intl.formatMessage({
        id: "totalCapacity",
        defaultMessage: "Total Capacity",
      }),
      value: formatStorage(detail?.totalCapacity || 0),
    },
    {
      label: intl.formatMessage({
        id: "availableCapacity",
        defaultMessage: "Physical Available",
      }),
      value: formatStorage(detail?.availableCapacity || 0),
    },
    {
      label: intl.formatMessage({
        id: "dhcpInterface",
        defaultMessage: "DHCP Listening NIC",
      }),
      value: detail?.dhcpInterface,
    },
    {
      label: intl.formatMessage({
        id: "dhcpRangeBegin",
        defaultMessage: "DHCP Start IP",
      }),
      value: detail?.dhcpRangeBegin,
    },
    {
      label: intl.formatMessage({
        id: "dhcpRangeEnd",
        defaultMessage: "DHCP End IP",
      }),
      value: detail?.dhcpRangeEnd,
    },
    {
      label: intl.formatMessage({
        id: "create.dates",
        defaultMessage: "Creation Time",
      }),
      value: getServerTime(detail?.createDate).format("YYYY-MM-DD HH:mm:ss"),
    },
    // {
    //   label: intl.formatMessage({ id: 'last.op.date', defaultMessage: '最后操作时间' }),
    //   value: getServerTime(detail?.lastOpDate).format('YYYY-MM-DD HH:mm:ss')
    // }
  ];

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "deploy.server",
          defaultMessage: "Deployment Server",
        })}
        isList
      >
        {!detail ? (
          <Empty
            className={style.empty}
            text={intl.formatMessage(
              {
                id: "no.deploy.server",
                defaultMessage: "No available deployment servers. {goToConfig}",
              },
              {
                goToConfig: (
                  <a
                    type="text"
                    onClick={() => {
                      setCreatePxeVisible(true);
                    }}
                  >
                    {intl.formatMessage({
                      id: "go.to.config",
                      defaultMessage: "Attach",
                    })}
                  </a>
                ),
              },
            )}
          />
        ) : (
          <List list={list} bordered={false} />
        )}
      </DraggableCard>
      <CreatePxeModal
        visible={createPxeVisible}
        setVisible={setCreatePxeVisible}
        refetch={() => {
          bmClusterRefetch?.();
        }}
        source={clusterDetail}
        view="sub.baremetal.cluster"
        position="header"
        selectedList={memoizedSelectedList}
      />
    </>
  );
};

export default ConfigInfo;
