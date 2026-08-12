import { InfoPopover, Text } from "@zstack/design";
import { State, Tag } from "@zstack/zsphere-components";
import type { Color } from "@zstack/zsphere-utils";
import cls from "classnames";
import * as _ from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

interface IProps {
  strategicData?: any[];
}

interface IScenarioProps {
  title: React.ReactNode | string;
  label?: React.ReactNode | string;
  // stateType?: IType
  migrate?: boolean;
  statuses: Array<{
    text: React.ReactNode | string;
    theme: Color.ITheme;
    statusName: React.ReactNode | string;
    tooltip?: React.ReactNode | string;
  }>;
  showfooterTooltip?: boolean;
}

const Scenario: React.FC<IScenarioProps> = ({
  title,
  statuses,
  label,
  migrate,
  showfooterTooltip,
}) => {
  const intl = useIntl();

  return (
    <div>
      <div className={style.contentCard}>
        <div className={style.titleWrapper}>
          <div className={style.title}>{title}</div>
          <div className={style.dividerDashed} />
        </div>
        {statuses.map((status, idx) => (
          <div
            key={idx}
            className={cls(style.content, "flex items-center gap-2")}
          >
            <div className={cls(style.textWrapper, "flex items-center")}>
              <Text className={style.text}>{status.text}</Text>
              {status?.tooltip && (
                <InfoPopover
                  content={<ReactMarkdown>{status?.tooltip}</ReactMarkdown>}
                />
              )}
            </div>
            <Tag style={{ marginLeft: "5px" }} theme={status?.theme}>
              {status.statusName}
            </Tag>
          </div>
        ))}
        <div className={style.dividerSolid} />
        <div className={cls(style.resultcontent, "flex items-center gap-2")}>
          <div className={cls(style.textWrapper, "flex items-center")}>
            <Text className={style.text}>
              {label ||
                intl.formatMessage({
                  id: "vm.Migration.on.Failure",
                  defaultMessage: "Fail Over",
                })}
            </Text>

            {showfooterTooltip && (
              <InfoPopover
                content={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "vm.Migration.on.Failure.tooltip",
                      defaultMessage: `### Fail Over

If you enable failover, once the failover condition is met, virtual machines with HA enabled will be started on another host.`,
                    })}
                  </ReactMarkdown>
                }
              />
            )}
          </div>

          <State
            type={migrate ? "success" : "error"}
            name={
              migrate
                ? intl.formatMessage({
                    id: "Migrate",
                    defaultMessage: "Yes",
                  })
                : intl.formatMessage({
                    id: "DoNotMigrate",
                    defaultMessage: "No",
                  })
            }
          />
        </div>
        {/* <Field
          label={
            label ||
            intl.formatMessage({
              id: 'vm.Migration.on.Failure',
              defaultMessage: '故障时迁移虚拟机'
            })
          }
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: 'vm.Migration.on.Failure.tooltip',
                defaultMessage: `### 故障时迁移虚拟机

启用后，若满足高可用故障迁移条件，开启高可用的虚拟机将迁移至其他主机 HA 启动。`
              })}
            </ReactMarkdown>
          }
        >
          <State
            type={migrate ? 'success' : 'error'}
            name={
              migrate
                ? intl.formatMessage({
                    id: 'Migrate',
                    defaultMessage: '迁移'
                  })
                : intl.formatMessage({
                    id: 'DoNotMigrate',
                    defaultMessage: '不迁移'
                  })
            }
          />
        </Field> */}
      </div>
    </div>
  );
};

const HighAvailabilityScenario: React.FC<IProps> = ({ strategicData = [] }) => {
  const intl = useIntl();

  const scenarios = useMemo<IScenarioProps[]>(() => {
    let hostStorageState: boolean = false;
    let hostBusinessNic: boolean = false;

    if (strategicData && strategicData?.length > 0) {
      hostStorageState = !!_.some(
        strategicData,
        (e) => e.fencerName === "hostStorageState" && e.state === "Enable",
      );

      hostBusinessNic = !!_.some(
        strategicData,
        (e) => e.fencerName === "hostBusinessNic" && e.state === "Enable",
      );
    }

    const _scenarios: IScenarioProps[] = [
      {
        title: intl.formatMessage({
          id: "scenarioOne",
          defaultMessage: "Scenario A",
        }),
        migrate: hostBusinessNic,
        statuses: [
          {
            text: intl.formatMessage({
              id: "HostManagementNetworkStatus",
              defaultMessage: "Management Network Connectivity Status",
            }),
            theme: "green" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Normal",
              defaultMessage: "Normal",
            }),
            tooltip: intl.formatMessage({
              id: "HostManagementNetworkStatus.tooltip",
              defaultMessage: `### Management Network Connectivity Status

1. Management network connectivity status indicates the status of the network that connects the management node and the host where virtual machines reside.

2. This status may turn Abnormal if errors occur to the management node or to the management network.`,
            }),
          },
          {
            text: intl.formatMessage({
              id: "HostStorageConnectionStatus",
              defaultMessage: "Storage Network Connectivity Status",
            }),
            theme: "green" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Normal",
              defaultMessage: "Normal",
            }),
            tooltip: intl.formatMessage({
              id: "HostStorageConnectionStatus.tooltip",
              defaultMessage: `### Storage Network Connectivity Status

1. Detects the connectivity status of the network that virtual machines use to access the data storage where the system disk of these virtual machines reside.

2. This status may turn Abnormal if errors occur to the data storage or to the storage network.

3. Note: Only shared storage is detected. Local storage is not supported.`,
            }),
          },
          {
            text: intl.formatMessage({
              id: "HostBusinessNetworkCardStatus",
              defaultMessage: "Business NIC Status",
            }),
            theme: "red" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Fault",
              defaultMessage: "Fault",
            }),
            tooltip: intl.formatMessage({
              id: "HostBusinessNetworkCardStatus.tooltip",
              defaultMessage: `### Business NIC Status

Business NIC status may turn Abnormal if errors occur to the host business NIC or the switch port directly connecting to the host business NIC that is associated with the distributed switch of virtual machines.`,
            }),
          },
        ],
      },
      {
        title: intl.formatMessage({
          id: "scenarioTwo",
          defaultMessage: "Scenario B",
        }),
        migrate: hostStorageState,
        statuses: [
          {
            text: intl.formatMessage({
              id: "HostManagementNetworkStatus",
              defaultMessage: "Management Network Connectivity Status",
            }),
            theme: "green" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Normal",
              defaultMessage: "Normal",
            }),
            //             tooltip: intl.formatMessage({
            //               id: 'HostManagementNetworkStatus.tooltip',
            //               defaultMessage: `
            // ### 管理网络连接状态

            //     - 管理网络连接状态是云主机所在物理机与管理节点之间的网络连接状态。
            //     - 若管理节点自身故障、或管理网络中断，均会导致管理网络连接状态故障。`
            //             })
          },
          {
            text: intl.formatMessage({
              id: "HostStorageConnectionStatus",
              defaultMessage: "Storage Network Connectivity Status",
            }),
            theme: "red" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Fault",
              defaultMessage: "Fault",
            }),
            // tooltip: intl.formatMessage({
            //   id: 'HostStorageConnectionStatus.tooltip',
            //   defaultMessage: `### 存储网络连接状态
            //   1. 检测云主机访问其系统盘所在主存储资源的网络连接状态。

            //   2. 若云主机系统盘所在主存储自身故障、或存储网络中断，均会导致云主机存储网络连接状态故障。

            //   3. 注意：

            //      - 仅支持检测共享存储，暂不支持本地存储。
            //      - SharedBlock 存储环境下，存储网络连接状态故障时默认会自动迁移。`
            // })
          },
          {
            text: intl.formatMessage({
              id: "HostBusinessNetworkCardStatus",
              defaultMessage: "Business NIC Status",
            }),
            theme: "green" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Normal",
              defaultMessage: "Normal",
            }),
            // tooltip: intl.formatMessage({
            //   id: 'HostBusinessNetworkCardStatus.tooltip',
            //   defaultMessage: `### 业务网卡状态
            //   若业务云主机二层网络关联的物理机业务网卡/业务网卡直连的交换机网口发生故障，均会导致云主机业务网卡故障。`
            // })
          },
        ],
      },
      {
        title: intl.formatMessage({
          id: "scenarioThree",
          defaultMessage: "Scenario C",
        }),
        migrate: hostStorageState || hostBusinessNic,
        statuses: [
          {
            text: intl.formatMessage({
              id: "HostManagementNetworkStatus",
              defaultMessage: "Management Network Connectivity Status",
            }),
            theme: "green" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Normal",
              defaultMessage: "Normal",
            }),
            //             tooltip: intl.formatMessage({
            //               id: 'HostManagementNetworkStatus.tooltip',
            //               defaultMessage: `
            // ### 管理网络连接状态

            //     - 管理网络连接状态是云主机所在物理机与管理节点之间的网络连接状态。
            //     - 若管理节点自身故障、或管理网络中断，均会导致管理网络连接状态故障。`
            //             })
          },
          {
            text: intl.formatMessage({
              id: "HostStorageConnectionStatus",
              defaultMessage: "Storage Network Connectivity Status",
            }),
            theme: "red" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Fault",
              defaultMessage: "Fault",
            }),
            // tooltip: intl.formatMessage({
            //   id: 'HostStorageConnectionStatus.tooltip',
            //   defaultMessage: `### 存储网络连接状态
            //   1. 检测云主机访问其系统盘所在主存储资源的网络连接状态。

            //   2. 若云主机系统盘所在主存储自身故障、或存储网络中断，均会导致云主机存储网络连接状态故障。

            //   3. 注意：

            //      - 仅支持检测共享存储，暂不支持本地存储。
            //      - SharedBlock 存储环境下，存储网络连接状态故障时默认会自动迁移。`
            // })
          },
          {
            text: intl.formatMessage({
              id: "HostBusinessNetworkCardStatus",
              defaultMessage: "Business NIC Status",
            }),
            theme: "red" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Fault",
              defaultMessage: "Fault",
            }),
            // tooltip: intl.formatMessage({
            //   id: 'HostBusinessNetworkCardStatus.tooltip',
            //   defaultMessage: `### 业务网卡状态
            //   若业务云主机二层网络关联的物理机业务网卡/业务网卡直连的交换机网口发生故障，均会导致云主机业务网卡故障。`
            // })
          },
        ],
      },
      {
        title: intl.formatMessage({
          id: "scenarioFour",
          defaultMessage: "Scenario D",
        }),
        statuses: [
          {
            text: intl.formatMessage({
              id: "HostManagementNetworkStatus",
              defaultMessage: "Management Network Connectivity Status",
            }),
            theme: "red" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Fault",
              defaultMessage: "Fault",
            }),
            //             tooltip: intl.formatMessage({
            //               id: 'HostManagementNetworkStatus.tooltip',
            //               defaultMessage: `
            // ### 管理网络连接状态

            //     - 管理网络连接状态是云主机所在物理机与管理节点之间的网络连接状态。
            //     - 若管理节点自身故障、或管理网络中断，均会导致管理网络连接状态故障。`
            //             })
          },
          {
            text: intl.formatMessage({
              id: "HostStorageConnectionStatus",
              defaultMessage: "Storage Network Connectivity Status",
            }),
            theme: "green" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Normal",
              defaultMessage: "Normal",
            }),
            // tooltip: intl.formatMessage({
            //   id: 'HostStorageConnectionStatus.tooltip',
            //   defaultMessage: `### 存储网络连接状态
            //   1. 检测云主机访问其系统盘所在主存储资源的网络连接状态。

            //   2. 若云主机系统盘所在主存储自身故障、或存储网络中断，均会导致云主机存储网络连接状态故障。

            //   3. 注意：

            //      - 仅支持检测共享存储，暂不支持本地存储。
            //      - SharedBlock 存储环境下，存储网络连接状态故障时默认会自动迁移。`
            // })
          },
          {
            text: intl.formatMessage({
              id: "HostBusinessNetworkCardStatus",
              defaultMessage: "Business NIC Status",
            }),
            theme: "green" as Color.ITheme,
            statusName: intl.formatMessage({
              id: "status.Normal",
              defaultMessage: "Normal",
            }),
            // tooltip: intl.formatMessage({
            //   id: 'HostBusinessNetworkCardStatus.tooltip',
            //   defaultMessage: `### 业务网卡状态
            //   若业务云主机二层网络关联的物理机业务网卡/业务网卡直连的交换机网口发生故障，均会导致云主机业务网卡故障。`
            // })
          },
        ],
      },
    ];

    return _scenarios;
  }, [intl, strategicData]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {scenarios?.map(({ title, statuses, migrate }, idx) => (
          <Scenario
            key={title}
            title={title}
            statuses={statuses}
            migrate={migrate}
            showfooterTooltip={idx === 0}
          />
        ))}
      </div>
    </>
  );
};

export default HighAvailabilityScenario;
