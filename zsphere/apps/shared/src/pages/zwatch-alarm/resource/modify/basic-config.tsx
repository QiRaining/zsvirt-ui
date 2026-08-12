import { useQuery, useApolloClient } from "@apollo/client";
import { Input, RadioGroup } from "@zstack/design";
import {
  Form,
  Select,
  useMetricNameConfig,
  ModalSelect,
  ZSVForm,
  Switch,
  TextArea,
} from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import type { EmergencyLevel } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import { usePersistFn } from "ahooks";
import type { FormInstance } from "antd/es/form";
import { flatten } from "lodash-es";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import EndPointList from "../../../zwatch-endpoint/list";
import { querySNSApplicationEndpointList } from "../../../zwatch-endpoint/list/zwatch-endpoint.gql";
import AlarmTriggerRuleItem, {
  byteUnitList,
  byteOpsUnitList,
} from "../components/alarm-trigger-rule-item";
import Level from "../components/level";
import type { IResource } from "../components/resource-selector";
import ResourceSelector from "../components/resource-selector";
import CustomSelect from "../components/time-select";
import Metrics from "../constant/Metrics.json";
import METRICS_CAT_JSON from "../constant/MetricsCat.json";

import styles from "./style.module.less";

const { Option } = Select;

const emergencyLevelList = ["Emergent", "Important", "Normal"];

const repeatIntervalItems = [
  { number: -1, unit: "once" },
  { number: 1, unit: "hour" },
];

const METRICS_CAT: any = METRICS_CAT_JSON;
const otherMetricNameList = METRICS_CAT["ZStack/Host"].Other;

export const resourceMap: any = {
  "ZStack/LoadBalancer": "ListenerUuid",
  "ZStack/VM": "VMUuid",
  "ZStack/BaremetalVM": "BaremetalVMUuid",
  "ZStack/Baremetal2VM": "Baremetal2VMUuid",
  "ZStack/VRouter": "VMUuid",
  "ZStack/BackupStorage": "BackupStorageUuid",
  "ZStack/DisasterRecoveryStorage": "BackupStorageUuid",
  "ZStack/PrimaryStorage": "PrimaryStorageUuid",
  "ZStack/Host": "HostUuid",
  "ZStack/VIP": "VipUUID",
  "ZStack/L3Network": "L3NetworkUuid",
  "ZStack/Volume": "VolumeUuid",
};

interface IProps {
  form: FormInstance;
  current: any;
  visible?: boolean;
  source?: any;
}

const BasicConfig: React.FC<IProps> = ({ form, current, visible, source }) => {
  const apolloClient = useApolloClient();
  const intl = useIntl();
  const { isRequired, commonNameRules, commonDescriptionRules } =
    useValidator(intl);
  const { translateResourceType, translateMetricName, systemAlarmUuidList } =
    useMetricNameConfig();

  const handleFieldInit = usePersistFn(() => {
    form.setFieldsValue({
      name: current.name,
      description: current.description,
      namespace: current.namespace,
      metricName: current.metricName,
      enableRecovery: current.enableRecovery,
      emergencyLevel: current.emergencyLevel,
      triggerRule: {
        threshold: formatThreshold(
          current.namespace,
          current.metricName,
          current.threshold,
        ),
        comparisonOperator: current.comparisonOperator,
      },
      repeatInterval:
        current.repeatCount !== -1
          ? { number: current.repeatCount, unit: "once" }
          : formatTime(current.repeatInterval),
      period: formatTime(current.period),
      labels: [{}],
      resources: [],
      actions: [],
    });
  });

  useEffect(() => {
    if (visible) {
      handleFieldInit();
    }
  }, [visible, handleFieldInit]);

  const { data: endpointListResp } = useQuery(querySNSApplicationEndpointList, {
    variables: {
      conditions: [
        {
          key: "topics.uuid",
          op: Op.in,
          values: current?.actions?.map((cv: any) => cv.actionUuid) || [],
        },
      ],
    },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    const actions = endpointListResp?.querySNSApplicationEndpointList?.list;
    if (actions?.length) {
      form.setFieldsValue({ actions, _originActions: actions });
    }
  }, [endpointListResp, form]);

  const handleResourcesInit = usePersistFn(
    async (aborted: { value: boolean }) => {
      const query =
        source?.componentMap[current.namespace]?.getQuery?.(current);
      if (!query) {
        return;
      }
      const isPool = [
        "PoolAvailableCapacityInPercent",
        "PoolUsedCapacityInPercent",
        "PoolVirtualAvailableCapacityInPercent",
      ].includes(current.metricName);
      const label = isPool
        ? current.labels.find((item: any) => item.key === "PoolUuid")
        : current.labels[0];
      const uuids = label?.value?.split("|");
      if (!uuids) {
        return;
      }
      let resp;
      try {
        const conditions: Array<{
          key: string;
          op: Op;
          values?: string[];
          value?: string;
        }> = [
          {
            key: "uuid",
            op: Op.in,
            values: uuids,
          },
        ];
        if (current.namespace === "ZStack/VM") {
          conditions.push({
            key: "__excludeGatewayVm__",
            op: Op.eq,
            value: "true",
          });
        }
        const { data } = await apolloClient.query({
          query,
          variables: {
            conditions,
          },
          fetchPolicy: "no-cache",
          errorPolicy: "ignore",
        });
        resp = data;
      } catch {
        return;
      }
      if (aborted.value) {
        return;
      }
      let resources = Object.values<any>(resp)[0].list;
      if (isPool) {
        const poolUuid = resources.map((item: any) => item.uuid);
        const sourceUuid = current.labels
          .find((item: any) => item.key === "PrimaryStorageUuid")
          ?.value?.split("|")[0];
        if (poolUuid.length && sourceUuid) {
          resources = [{ poolUuid, sourceUuid }];
        } else {
          resources = [];
        }
      }
      const labels = getLabels(
        current.namespace,
        current.metricName,
        resources,
      );
      form.setFieldsValue({ resources, labels });
    },
  );

  useEffect(() => {
    const aborted = { value: false };
    handleResourcesInit(aborted);
    return () => {
      aborted.value = true;
    };
  }, [handleResourcesInit]);

  const handleValuesChange = (changedValues: any, values: any) => {
    if ("resources" in changedValues) {
      const { namespace, metricName, resources } = values;
      const labels = getLabels(namespace, metricName, resources);
      form.setFieldsValue({ labels });
    }
  };

  return (
    <Form form={form} name="basicConfig" onValuesChange={handleValuesChange}>
      <ZSVForm.Card
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
      >
        <Form.Item
          name="name"
          label={intl.formatMessage({
            id: "name",
            defaultMessage: "Name",
          })}
          validateFirst
          rules={commonNameRules}
        >
          <Input className={styles["width-400"]} />
        </Form.Item>
        <Form.Item
          name="description"
          label={intl.formatMessage({
            id: "description",
            defaultMessage: "Description",
          })}
          validateTrigger="onBlur"
          rules={commonDescriptionRules}
        >
          <TextArea
            isShowLimit
            rows={3}
            className={styles["width-400"]}
            maxLength={256}
          />
        </Form.Item>
      </ZSVForm.Card>

      <ZSVForm.Card
        title={intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        })}
      >
        <Form.Item
          name="namespace"
          label={intl.formatMessage({
            id: "resourceType",
            defaultMessage: "Resource Type",
          })}
        >
          {translateResourceType(current.namespace)}
        </Form.Item>
        <Form.Item
          name="metricName"
          label={intl.formatMessage({
            id: "alarmEntry",
            defaultMessage: "Metric Item",
          })}
        >
          {translateMetricName(current.namespace, current.metricName)}
        </Form.Item>
        <Form.Item noStyle dependencies={["metricName"]}>
          {({ getFieldValue }) => {
            const metricName = getFieldValue("metricName");
            return (
              otherMetricNameList
                .filter((item: string) => item !== "PowerSupply")
                .includes(metricName) && (
                <Form.Item
                  name="hostType"
                  label={intl.formatMessage({
                    id: "hostType",
                    defaultMessage: "Host Type",
                  })}
                  initialValue="KVM"
                >
                  <RadioGroup
                    defaultValue="KVM"
                    options={[
                      { value: "KVM", label: "KVM" },
                      { value: "XDragon", label: "XDragon" },
                    ]}
                  />
                </Form.Item>
              )
            );
          }}
        </Form.Item>
        <Form.Item
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.metricName !== currentValues.metricName
          }
          noStyle
        >
          {({ getFieldValue }) => {
            return getFieldValue("namespace") && getFieldValue("metricName") ? (
              <Form.Item noStyle name="labels">
                <ResourceSelector
                  form={form}
                  isDefault={systemAlarmUuidList.includes(current.uuid)}
                  namespace={getFieldValue("namespace")}
                  metricName={getFieldValue("metricName")}
                  componentMap={source?.componentMap}
                />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>
        <Form.Item
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.metricName !== currentValues.metricName
          }
          noStyle
        >
          {({ getFieldValue }) => {
            return getFieldValue("namespace") && getFieldValue("metricName") ? (
              <Form.Item
                className={styles["trigger-rule"]}
                name="triggerRule"
                label={intl.formatMessage({
                  id: "alarmTriggerRule",
                  defaultMessage: "Alarm Trigger Rule",
                })}
                required
              >
                <AlarmTriggerRuleItem
                  namespace={getFieldValue("namespace")}
                  metricName={getFieldValue("metricName")}
                />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>
        <Form.Item
          name="repeatInterval"
          label={intl.formatMessage({
            id: "alarm.interval", //
            defaultMessage: "Alarm Interval",
          })}
          rules={[isRequired(IIsRequiredType.select)]}
        >
          <CustomSelect items={repeatIntervalItems} />
        </Form.Item>
        <Form.Item
          name="emergencyLevel"
          label={intl.formatMessage({
            id: "alarmLevel",
            defaultMessage: "Severity",
          })}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select width="s">
            {emergencyLevelList.map((item) => (
              <Option value={item} key={item}>
                <Level level={item as EmergencyLevel} />
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "alarmRecoveryNotice",
            defaultMessage: "Alarm Recovery Notification",
          })}
          name="enableRecovery"
          style={{ wordBreak: "keep-all" }}
          valuePropName="checked"
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "zwatchAlarm.field.alarmRecoveryNotice.tooltip",
                defaultMessage: `### Alarm Recovery Notification

1. If enabled, when a resource monitored by a resource alarm recovers from alarmed status, the system receives a notification.
2. The recovery notification is sent according to the default recovery message template. You can customize the message content on the Message Template page.`,
              })}
            </ReactMarkdown>
          }
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="actions"
          label={intl.formatMessage({
            id: "notice.object",
            defaultMessage: "Endpoint",
          })}
        >
          <ModalSelect
            style={{ width: 400 }}
            title={intl.formatMessage({
              id: "select.notice.object",
              defaultMessage: "Select Endpoint",
            })}
            selectType="checkbox"
            renderItemContent={(data: any) => {
              return data?.type === "SYSTEM_HTTP"
                ? intl.formatMessage({
                    id: "systemAlarmNoticeObject",
                    defaultMessage: "System Endpoint",
                  })
                : data?.name;
            }}
          >
            <EndPointList view="select.virtualization" />
          </ModalSelect>
        </Form.Item>
      </ZSVForm.Card>
    </Form>
  );
};

export default BasicConfig;

function formatTime(sec: number) {
  const units = ["s", "min", "hour"];
  let idx = 0;
  let result = sec;
  while (result % 60 === 0 && idx < units.length - 1) {
    result /= 60;
    idx++;
  }
  return { number: result, unit: units[idx] };
}

export function getLabels(
  namespace: string,
  metricName: string,
  resources: any[],
) {
  const isPool = [
    "PoolAvailableCapacityInPercent",
    "PoolUsedCapacityInPercent",
    "PoolVirtualAvailableCapacityInPercent",
  ].includes(metricName);
  let uuids = resources
    .filter((item) => item)
    .map((item: IResource) =>
      isPool ? (item.poolUuid ?? item.uuid) : item.uuid,
    );
  if (isPool) {
    uuids = flatten(uuids);
  }
  const key = isPool ? "PoolUuid" : resourceMap[namespace];
  return [uuids.length ? { [key]: uuids } : {}];
}

function formatThreshold(namespace: string, metricName: string, value: number) {
  // @ts-expect-error
  const unitType = Metrics[namespace]?.[metricName]?.unit;
  let unitList;
  if (unitType === "byte") {
    unitList = byteUnitList;
  } else if (unitType === "byte/s") {
    unitList = byteOpsUnitList;
  } else {
    return value;
  }
  let idx = 0;
  let result = Math.floor(value / 1024);
  while (result % 1024 === 0 && idx < unitList.length - 1) {
    result /= 1024;
    idx++;
  }
  return { number: result, unit: unitList[idx].label };
}
