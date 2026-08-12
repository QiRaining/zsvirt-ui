import { gql } from "@apollo/client";
import { Button, InfoPopover } from "@zstack/design";
import DrsTableInfo from "@zstack/virtualization-resource/src/pages/cluster/detail/drs/drs-table-info";
import {
  Auth,
  DraggableCard,
  State,
  useAuth,
} from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { DialogWeak, Empty } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  automationLevelList,
  monitorItemList,
  cpuUsedPercentStr,
  memoryUsedPercentStr,
  cpuAndMemoryUsedPercentStr,
  operatorMap,
} from "./drs-panel-config-info/constant";
import CreateOrModifyDRSModal from "./modify-drs";
import { reverseFormateTimer, useUnit } from "./utils";

import style from "./style.module.less";

const EMPTY_LIST: never[] = [];

const spaceStyle = { width: "100%" } as const;

export interface IProps {
  detail: ICluster;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  drs: any;
  refetch: Function;
}

const executeDRSScheduling = gql`
  mutation executeDRSScheduling($input: ExecuteDRSSchedulingInput!) {
    executeDRSScheduling(input: $input) {
      actionId
    }
  }
`;

const updateResourceConfig = gql`
  mutation updateResourceConfig($input: UpdateResourceConfigInput!) {
    updateResourceConfig(input: $input) {
      actionId
    }
  }
`;

const ConfigInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
  drs,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { hasAuth } = useAuth();
  const [createType, setCreateType] = React.useState<
    "create" | "edit" | "enable"
  >("edit");
  const [drsVisible, setDrsVisible] = React.useState<boolean>(false);
  const { unitMap } = useUnit();
  const [disableDrsVisible, setDisableDrsVisiable] =
    React.useState<boolean>(false);

  const { isSupported, detail: drsDetail, refetch: drsRefetch } = drs;
  const isEnableDrsActionDisabled = isSupported === false;

  const {
    uuid: drsUuid,
    automationLevel = automationLevelList[0],
    balancedState = "Unknown",
    // drsSchedulingInterval = 1,
    thresholdDuration = 1,
    thresholds = [],
  } = drsDetail ?? {};

  const balancedStateEle = React.useMemo(() => {
    if (!isSupported) {
      return (
        <State
          type="disabled"
          name={intl.formatMessage({
            id: "unknown",
            defaultMessage: "Unknown",
          })}
          prefix="dot"
        />
      );
    }
    const balanceStateMap: any = {
      Unknown: (
        <State
          type="disabled"
          name={intl.formatMessage({
            id: "unknown",
            defaultMessage: "Unknown",
          })}
          prefix="dot"
        />
      ),
      Balanced: (
        <State
          type="success"
          name={intl.formatMessage({
            id: "balance",
            defaultMessage: "Balance",
          })}
          prefix="dot"
        />
      ),
      Unbalanced: (
        <State
          type="error"
          name={intl.formatMessage({
            id: "unbalance",
            defaultMessage: "Imbalanced",
          })}
          prefix="dot"
        />
      ),
    };
    return balanceStateMap[balancedState];
  }, [isSupported, intl, balancedState]);

  const getDispatchModeContent = () => {
    const dispatchModeMap: any = {
      Manual: () =>
        intl.formatMessage({
          id: "manual",
          defaultMessage: "Manual",
        }),
      Automatic: () =>
        intl.formatMessage({
          id: "automatic",
          defaultMessage: "Automatic",
        }),
    };
    return dispatchModeMap[automationLevel]?.();
  };

  const getCurrentMoitorItem = () => {
    const isContains = (monitorItem: string) =>
      thresholds?.some(
        (it: { thresholdName?: string }) => it.thresholdName === monitorItem,
      );
    const isContainsCpu = isContains(cpuUsedPercentStr);
    const isContainsMemory = isContains(memoryUsedPercentStr);
    const isContainsBoth = isContainsCpu && isContainsMemory;
    if (isContainsBoth) {
      return cpuAndMemoryUsedPercentStr;
    }
    if (isContainsCpu) {
      return cpuUsedPercentStr;
    }
    if (isContainsMemory) {
      return memoryUsedPercentStr;
    }
    return cpuUsedPercentStr;
  };

  const translateMonitorItemName = () => {
    const find = monitorItemList.find(
      (it) => it.value === getCurrentMoitorItem(),
    );
    const monitorItemMap: any = {
      "drs.rateOfCpu": () =>
        intl.formatMessage({
          id: "cpuUtilization",
          defaultMessage: "CPU Utilization",
        }),
      "drs.rateOfMemory": () =>
        intl.formatMessage({
          id: "memoryUtilization",
          defaultMessage: " Memory Utilization",
        }),
      "drs.rateOfCpuAndMemory": () =>
        intl.formatMessage({
          id: "cpuOrMemoryUtilization",
          defaultMessage: "CPU/Memory Utilization",
        }),
    };
    return monitorItemMap[find!.name]?.();
  };

  const getCpuOrMemoryPercent = (monitorItem: string): string => {
    const find = thresholds?.find(
      (it: { thresholdName?: string }) => it.thresholdName === monitorItem,
    );
    if (find && find.operator) {
      return `${operatorMap?.[find?.operator]} ${find.thresholdValue}%`;
    }
    return "-";
  };

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "dispatchMode",
          defaultMessage: "DRS Mode",
        }),
        value: getDispatchModeContent(),
      },
      {
        label: intl.formatMessage({
          id: "drsResourceType",
          defaultMessage: "Resource Type",
        }),
        value: intl.formatMessage({
          id: "computeResource",
          defaultMessage: "Compute Resource",
        }),
      },
      {
        label: intl.formatMessage({
          id: "monitorItem",
          defaultMessage: "Monitoring Item",
        }),
        value: translateMonitorItemName(),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.create.field.automationLevel.drs.migrateVm.concurrent",
          defaultMessage: "VM Migration Concurrency",
        }),
        value: `${
          detail?.resourceConfigValue?.drsDrsMigrateVmConcurrent
        } ${intl.formatMessage({
          id: "virtualization.cluster.create.field.automationLevel.drs.migrateVm.concurrent.unit",
          defaultMessage: " ",
        })}`,
      },
      {
        label: intl.formatMessage({
          id: "cpuTriggerCondition",
          defaultMessage: "CPU Trigger Condition",
        }),
        value: getCpuOrMemoryPercent(cpuUsedPercentStr),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.create.field.automationLevel.drs.schedulingInterval",
          defaultMessage: "Cluster Scanning Interval",
        }),
        value: `${
          reverseFormateTimer(
            (detail?.resourceConfigValue?.drsDrsSchedulingInterval ??
              0) as number,
            unitMap,
          )?.num
        }${
          reverseFormateTimer(
            (detail?.resourceConfigValue?.drsDrsSchedulingInterval ??
              0) as number,
            unitMap,
          )?.unit
        }`,
      },
      {
        label: intl.formatMessage({
          id: "memoryTriggerCondition",
          defaultMessage: "Memory Trigger Condition",
        }),
        value: getCpuOrMemoryPercent(memoryUsedPercentStr),
      },

      {
        label: intl.formatMessage({
          id: "durationTime",
          defaultMessage: "Duration",
        }),
        value: `${
          reverseFormateTimer(thresholdDuration as number, unitMap)?.num
        }${reverseFormateTimer(thresholdDuration as number, unitMap)?.unit}`,
      },
    ],
    [
      intl,
      getDispatchModeContent,
      translateMonitorItemName,
      getCpuOrMemoryPercent,
      thresholdDuration,
    ],
  );

  const titleEle = React.useMemo(
    () => (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span>
            {intl.formatMessage({
              id: "dynamicResourceDispatchStrategy",
              defaultMessage: "DRS Policy",
            })}
          </span>
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "dynamicResourceDispatchStrategy.help",
                  defaultMessage:
                    "### Dynamic Resource Scheduling Strategy\nMonitors the CPU or memory utilization of the hosts in the cluster and dynamically schedules the application workloads of virtual machines running on the hosts based on the manual or auto-scheduling strategy that you configure. This makes the workloads running on hosts of the cluster more balanced and improves the platform stability.",
                })}
              </ReactMarkdown>
            }
          />
        </div>

        {detail?.isShowDrsTab ? (
          <div>
            <div className="flex items-center gap-2">
              <span>
                {intl.formatMessage({
                  id: "virtualization.cluster.detail.drs.field.status",
                  defaultMessage: "Status",
                })}
              </span>
              {balancedStateEle}
            </div>
          </div>
        ) : null}
      </div>
    ),
    [intl, balancedStateEle, detail?.isShowDrsTab],
  );

  const balanceScanFn = usePersistFn(() => {
    const payload = {
      uuid: drsUuid,
    };
    doAction({
      mutation: executeDRSScheduling,
      payload,
      name: intl.formatMessage({
        id: "drs.state.refresh",
        defaultMessage: "Scan Status",
      }),
      total: 1,
      onProgress: () => {
        drsRefetch?.();
      },
    });
  });

  const disableDrsFn = usePersistFn(() => {
    doAction({
      mutation: updateResourceConfig,
      payload: {
        resourceUuid: detail.uuid,
        category: "drs",
        name: "drs.enable",
        value: "false",
      },
      name: intl.formatMessage({
        id: "disable.drs",
        defaultMessage: "Disable DRS",
      }),
      total: 1,
      onProgress: () => {
        drsRefetch?.();
        refetch?.();
      },
    });
  });

  return (
    <>
      <div className="flex flex-col gap-5" style={spaceStyle}>
        {detail?.isShowDrsTab ? (
          <DraggableCard
            title={titleEle}
            isList
            onCollapseChange={onCollapseChange}
            collapsed={collapsed}
            titleActions={[
              hasAuth({
                type: "action",
                authKey: "stateScan",
                resource: "dynamic.resource.ispatch.strategy",
              }) && {
                icon: "refresh",
                tooltip: intl.formatMessage({
                  id: "drs.state.refresh",
                  defaultMessage: "Scan Status",
                }),
                title: intl.formatMessage({
                  id: "drs.state.refresh",
                  defaultMessage: "Scan Status",
                }),
                onClick: balanceScanFn,
              },
              hasAuth({
                type: "action",
                authKey: "change.strategy",
                resource: "dynamic.resource.ispatch.strategy",
              }) && {
                icon: "edit",
                title: intl.formatMessage({
                  id: "virtualization.cluster.detail.drs.modify.dynamicResourceDispatchStrategy",
                  defaultMessage: "Modify Policy",
                }),
                tooltip: intl.formatMessage({
                  id: "virtualization.cluster.detail.drs.modify.dynamicResourceDispatchStrategy",
                  defaultMessage: "Modify Policy",
                }),
                onClick: () => {
                  setCreateType("edit");
                  setDrsVisible(true);
                },
              },
              hasAuth({
                type: "action",
                authKey: "close.dynamic.resource.ispatch",
                resource: "dynamic.resource.ispatch.strategy",
              }) && {
                icon: "slash",
                title: intl.formatMessage({
                  id: "virtualization.cluster.detail.drs.disabled",
                  defaultMessage: "Disable",
                }),
                tooltip: intl.formatMessage({
                  id: "virtualization.cluster.detail.drs.disabled",
                  defaultMessage: "Disable",
                }),
                onClick: () => {
                  setDisableDrsVisiable(true);
                },
              },
            ].filter(Boolean)}
            className={style["draggable-card"]}
          >
            <List list={list} bordered={false} className={style.list} />
          </DraggableCard>
        ) : (
          <DraggableCard title={titleEle}>
            <Empty
              description={
                <div className="flex items-center gap-1">
                  <span>
                    {!detail?.isShowDrsTab && drsUuid
                      ? intl.formatMessage({
                          id: "virtualization.cluster.detail.drs.disable.descripiton",
                          defaultMessage: "DRS Policy is not enabled currently.",
                        })
                      : intl.formatMessage({
                          id: "virtualization.cluster.detail.drs.empty.descripiton",
                          defaultMessage: "DRS Policy is not enabled currently.",
                        })}
                  </span>
                  <Auth
                    type="action"
                    authKey="virtualization.enabled"
                    resource="dynamic.resource.ispatch.strategy"
                  >
                    <Button
                      className={style.btn}
                      disabled={isEnableDrsActionDisabled}
                      variant="link"
                      onClick={() => {
                        if (isEnableDrsActionDisabled) {
                          return;
                        }
                        if (drsDetail.uuid) {
                          setCreateType("enable");
                        } else {
                          setCreateType("create");
                        }
                        setDrsVisible(true);
                      }}
                    >
                      {intl.formatMessage({
                        id: "virtualization.cluster.detail.drs.go.enable",
                        defaultMessage: "Enable",
                      })}
                    </Button>
                  </Auth>
                </div>
              }
            />
          </DraggableCard>
        )}

        {detail?.isShowDrsTab && drsUuid && (
          <DrsTableInfo detail={drs.detail} />
        )}
      </div>

      <DialogWeak
        visible={disableDrsVisible}
        setVisible={setDisableDrsVisiable}
        type="warning"
        title={String(
          intl.formatMessage({
            id: "virtualization.cluster.detail.drs.disable.confirm.alertMessage",
            defaultMessage: "Disable DRS?",
          }),
        )}
        onConfirm={() => {
          disableDrsFn();
        }}
      />

      <CreateOrModifyDRSModal
        createType={createType}
        refetch={() => {
          drsRefetch?.();
          refetch?.();
        }}
        detail={drs.detail}
        visible={drsVisible}
        setVisible={setDrsVisible}
        source={detail}
        view=""
        selectedList={EMPTY_LIST}
        position="header"
      />
    </>
  );
};

export default ConfigInfo;
