import { gql } from "@apollo/client";
import { Form, useMetricNameConfig } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ZWatchAlarmVO,
  BasicEndPoint as IBasicEndPoint,
  CreateAlarmPayload as ICreateAlarmPayload,
} from "@zstack/zsphere-types/graphql";
import { compact as _compact } from "lodash-es";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import {
  byteUnitList,
  byteOpsUnitList,
} from "../components/alarm-trigger-rule-item";
import Metrics from "../constant/Metrics.json";
import type { initialValuesByBasicConfig } from "./basic-config";
import BasicConfig from "./basic-config";

export interface IFormData {
  baseConfig?: typeof initialValuesByBasicConfig;
}

const Action: React.FC<IActionWrapperProps<ZWatchAlarmVO>> = ({
  visible,
  setVisible,
  source,
  selectedList,
}) => {
  const { formatTime } = useMetricNameConfig();
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const title = intl.formatMessage({
    id: "zwatch.alarm.create",
    defaultMessage: "New Resource Alarm",
  });

  const createAlarm = gql`
    mutation createAlarm($input: CreateAlarmInput!) {
      createAlarm(input: $input) {
        actionId
      }
    }
  `;
  const updateAlarm = gql`
    mutation updateAlarm($input: UpdateAlarmInput!) {
      updateAlarm(input: $input) {
        actionId
      }
    }
  `;

  const otherSource = useMemo(() => {
    if (source?.__typename?.endsWith("EndPoint")) {
      return {
        endpoint: source,
        componentMap: source?.componentMap,
      };
    }
    if (source?.componentMap) {
      return { componentMap: source.componentMap };
    }
    switch (source?.__typename) {
      case "VmInstance":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/VM",
          CPUNum: source?.cpuNum,
        };

      case "VpcVRouter":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/VRouter",
          CPUNum: source?.cpuNum,
        };
      case "BaremetalInstance":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/BaremetalVM",
          CPUNum: source?.hardwareInfo?.cpuNum,
        };
      case "BareMetal2Instance":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/Baremetal2VM",
          CPUNum: source?.cpuNum,
        };
      case "BackupStorage":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/BackupStorage",
        };

      case "PrimaryStorageVO":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/PrimaryStorage",
          filterMetricValues: source?.type,
        };
      case "HostVO":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/Host",
          CPUNum: source?.cpuNum,
        };
      case "VipNetwork":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/VIP",
        };
      case "L3Network":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/L3Network",
        };

      case "Listener":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/LoadBalancer",
        };

      case "BareMetal2Gateway":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/BareMetal2Gateway",
        };
      case "VRouter":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/VRouter",
        };
      case "Baremetal2VM":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/Baremetal2VM",
        };
      case "CdpTask":
        return {
          uuid: source?.uuid,
          name: source?.name,
          type: "ZStack/CdpTask",
        };

      default:
        return {};
    }
  }, [source]);

  const { uuid: sourceUuid } = otherSource;
  const onOk = useCallback(
    async (formData: any) => {
      try {
        const {
          repeatInterval,
          labels,
          actions,
          triggerRule: { threshold = 0, comparisonOperator = "GreaterThan" },
          period,
          resources,
          hostType,
          ...params
        } = formData;
        // 处理物理机为其他的情况，需要判断报警的为KVM还是神龙的物理机
        if (hostType === "KVM") {
          params.namespace = "ZStack/KVMHost";
        }

        if (hostType === "XDragon") {
          params.namespace = "ZStack/XDragonHost";
        }

        // ZSV-1166
        if (
          [
            "HostTotal",
            "ConnectedHostCount",
            "ConnectedHostInPercent",
            "DisconnectedHostCount",
            "DisconnectedHostInPercent",
          ].includes(params?.metricName) &&
          !!hostType
        ) {
          params.metricName = `${hostType}${params?.metricName}`;
        }

        // 触发报警规则
        if (period) {
          params.period = formatTime(period);
        }
        if (typeof threshold === "object") {
          const { number = 0, unit } = threshold || {};
          // @ts-expect-error
          const unitType = Metrics[params.namespace]?.[params.metricName]?.unit;
          let unitList;
          if (unitType === "byte") {
            unitList = byteUnitList;
          } else if (unitType === "byte/s") {
            unitList = byteOpsUnitList;
          } else {
            unitList = [];
          }
          const unitValue =
            unitList.find((item: any) => item.label === unit)?.value ?? 0;
          params.threshold = number * unitValue;
        } else {
          params.threshold = threshold || 0;
        }
        params.comparisonOperator = comparisonOperator;
        // 网卡的报警有些特别，网卡up是0，down是1
        if (
          ["PhysicalNetworkInterface", "LoadBalancerBackendStatus"].includes(
            params.metricName,
          )
        ) {
          params.threshold = 1;
          params.comparisonOperator = "LessThan";
        }

        // 报警周期：一次
        if (repeatInterval?.unit === "once") {
          params.repeatCount = 1;
        } else {
          params.repeatCount = -1;
          params.repeatInterval = formatTime(repeatInterval);
        }

        let _labels: Array<any> = Object.keys(labels?.[0])?.reduce<any>(
          (p, key) => {
            if (!Array.isArray(labels?.[0]?.[key])) {
              return [
                ...p,
                {
                  key,
                  op: "Equal",
                  value: labels?.[0]?.[key],
                },
              ];
            }
            const _arr = [
              {
                key,
                op: "Regex",
                value: labels?.[0]?.[key]?.join("|"),
              },
            ];
            return [...p, ..._arr];
          },
          [],
        );

        if (
          params.namespace === "ZStack/PrimaryStorage" &&
          [
            "PoolAvailableCapacityInPercent",
            "PoolUsedCapacityInPercent",
            "PoolVirtualAvailableCapacityInPercent",
          ].includes(params.metricName)
        ) {
          _labels = [
            ..._labels,
            {
              key: "PrimaryStorageUuid",
              op: "Regex",
              value: sourceUuid
                ? sourceUuid.toString()
                : _compact(resources)
                    .map((it: any) => it.sourceUuid)
                    .join("|"),
            },
          ];
        }

        const _actions: Array<any> = actions
          ?.map((action: IBasicEndPoint) => action?.topic?.uuid)
          ?.map((uuid: string) => {
            return {
              actionType: "sns",
              actionUuid: uuid,
            };
          });

        params.labels = _labels;
        params.actions = _actions;
        delete params.resourceUuid;
        delete params.pointConfigs;
        const payload: ICreateAlarmPayload = params;
        if (selectedList[0]?.uuid) {
          const { ..._payload } = payload;
          doAction({
            mutation: updateAlarm,
            payload: {
              ..._payload,
              uuid: selectedList[0].uuid,
            },
            name: intl.formatMessage({
              id: "update.alarm",
              defaultMessage: "Edit Alarm",
            }),
            type: "ZWatchAlarmVO",
            total: selectedList.length,
          });
          return;
        }
        doAction({
          mutation: createAlarm,
          payload,
          name: intl.formatMessage({
            id: "create.resourceZwatchAlarm",
            defaultMessage: "New Resource Alarm",
          }),
          total: 1,
          type: "ZWatchAlarmVO",
        });
      } catch {
        // ignore
      }
    },
    [doAction, intl, createAlarm],
  );

  return (
    <DialogForm
      form={form}
      title={title}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-200"
      onOk={onOk}
      onCancel={() => setVisible(false)}
    >
      <Form form={form}>
        <BasicConfig otherSource={otherSource} form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
