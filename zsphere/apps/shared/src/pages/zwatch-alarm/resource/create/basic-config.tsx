import { Input, RadioGroup } from "@zstack/design";
import {
  Form,
  TextArea,
  Select,
  useAuth,
  AuthHander,
  useMetricNameConfig,
  Switch,
  ModalSelect,
  ZSVForm,
} from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import type { EmergencyLevel } from "@zstack/zsphere-types";
import type { FormInstance } from "antd/es/form";
import { compact as _compact } from "lodash-es";
import React, { useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import EndPointList from "../../../zwatch-endpoint/list";
import AlarmTriggerRuleItem, {
  comparisonOperatorList,
  byteUnitList,
  byteOpsUnitList,
} from "../components/alarm-trigger-rule-item";
import Level from "../components/level";
import MetricSelect from "../components/metric-select";
import ResourceSelector from "../components/resource-selector";
import CustomSelect from "../components/time-select";
import METRICS_JSON from "../constant/Metrics.json";
import METRICS_CAT_JSON from "../constant/MetricsCat.json";
import { getLabels, resourceMap } from "../modify/basic-config";

import styles from "./style.module.less";

const { Option } = Select;

const emergencyLevelList = ["Emergent", "Important", "Normal"];

const repeatIntervalItems = [
  { number: -1, unit: "once" },
  { number: 1, unit: "hour" },
];

type IInitialValuesType = {
  name: string;
  description: string;
  namespace: string;
  metricName: string;
  enableRecovery: boolean;
  period: { number?: number; unit: string };
  triggerRule: any;
  labels: Array<any>;
  repeatInterval: object;
  emergencyLevel: "Emergent" | "Important" | "Normal";
  actions: Array<any>;
};

export const initialValuesByBasicConfig: IInitialValuesType = {
  name: "",
  description: "",
  namespace: "",
  metricName: "",
  enableRecovery: false,
  period: { unit: "min", number: 30 },
  triggerRule: {
    threshold: undefined,
    comparisonOperator: comparisonOperatorList?.[0]?.value,
  },
  labels: [{}],
  repeatInterval: { number: 1, unit: "hour" },
  emergencyLevel: "Important",
  actions: [],
};

const METRICS: any = METRICS_JSON;
const METRICS_CAT: any = METRICS_CAT_JSON;
const otherMetricNameList = METRICS_CAT["ZStack/Host"].Other;

interface IProps {
  form: FormInstance;
  otherSource: any;
}

const BasicConfig: React.FC<IProps> = ({ form, otherSource }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const { isRequired, commonNameRules, commonDescriptionRules } =
    useValidator(intl);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const { translateResourceType, translateAlarmAuth } = useMetricNameConfig();

  // 处理从别的资源跳过来的创建
  const {
    name: sourceName,
    uuid: sourceUuid,
    type: sourceType,
    endpoint,
    filterMetricValues,
  } = otherSource as any;

  const sourceFilterMetricValues = useMemo(
    () => _compact(((filterMetricValues ?? "") as string).split(",")),
    [filterMetricValues],
  );

  const endpointName =
    endpoint?.type === "SYSTEM_HTTP"
      ? intl.formatMessage({
          id: "systemAlarmNoticeObject",
          defaultMessage: "System Endpoint",
        })
      : endpoint?.name;

  useEffect(() => {
    if (endpoint) {
      form.setFieldsValue({ actions: [endpoint] });
    }
    if (sourceUuid) {
      form.setFieldsValue({ resourceUuid: sourceUuid });
    }
    const _namespaces = Object.keys(METRICS).filter(
      (namespace) => namespace !== "ZStack/License",
    );
    if (sourceUuid) {
      form.setFieldsValue({ namespace: sourceType });
    } else {
      form.setFieldsValue({
        namespace: initialValuesByBasicConfig?.namespace || _namespaces[0],
      });
    }

    setNamespaces(_namespaces);
  }, [endpoint, form, sourceType, sourceUuid]);

  const handleValuesChange = (changedValues: any, values: any) => {
    if ("namespace" in changedValues || "metricName" in changedValues) {
      const { namespace, metricName } = values;
      const unitType = METRICS[namespace]?.[metricName]?.unit;
      let threshold;
      if (unitType === "byte") {
        threshold = { number: null, unit: byteUnitList[0].label };
      } else if (unitType === "byte/s") {
        threshold = { number: null, unit: byteOpsUnitList[0].label };
      }
      const isPool = [
        "PoolAvailableCapacityInPercent",
        "PoolUsedCapacityInPercent",
        "PoolVirtualAvailableCapacityInPercent",
      ].includes(metricName);
      form.setFieldsValue({
        resources: isPool || !sourceUuid ? [] : [{ ...otherSource }],
        labels: [
          isPool || !sourceUuid
            ? {}
            : { [resourceMap[namespace]]: [sourceUuid] },
        ],
        period: { unit: "min", number: 30 },
        triggerRule: {
          threshold,
          comparisonOperator: comparisonOperatorList?.[0]?.value,
        },
      });
    }
    if ("resources" in changedValues) {
      const { namespace, metricName, resources } = values;
      const labels = getLabels(namespace, metricName, resources);
      form.setFieldsValue({ labels });
    }
  };

  return (
    <Form
      form={form}
      name="basicConfig"
      initialValues={initialValuesByBasicConfig}
      onValuesChange={handleValuesChange}
    >
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
        {sourceUuid ? (
          <Form.Item
            name="namespace"
            label={intl.formatMessage({
              id: "resourceType",
              defaultMessage: "Resource Type",
            })}
            rules={[{ required: true }]}
          >
            {translateResourceType(sourceType as string)}
          </Form.Item>
        ) : (
          <Form.Item
            name="namespace"
            label={intl.formatMessage({
              id: "resourceType",
              defaultMessage: "Resource Type",
            })}
            required
          >
            <Select className={styles["width-400"]}>
              {namespaces?.map((cv) => {
                const auth = translateAlarmAuth(cv);
                if (auth) {
                  return hasAuth(auth) ? (
                    <Option value={cv} key={cv}>
                      <AuthHander {...auth}>
                        {translateResourceType(cv)}
                      </AuthHander>
                    </Option>
                  ) : null;
                }
                return (
                  <Option value={cv} key={cv}>
                    {translateResourceType(cv)}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        )}
        {sourceUuid && (
          <Form.Item
            name="resourceUuid"
            label={translateResourceType(sourceType as string)}
            rules={[{ required: true }]}
          >
            {sourceName}
          </Form.Item>
        )}
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.namespace !== currentValues.namespace
          }
        >
          {({ getFieldValue }) => (
            <Form.Item
              name="metricName"
              label={intl.formatMessage({
                id: "alarmEntry",
                defaultMessage: "Metric Item",
              })}
              rules={[
                {
                  required: true,
                  validateTrigger: "onBlur",
                  message: intl.formatMessage({
                    id: "global.field.validator.select.required",
                    defaultMessage: "This field is required.",
                  }),
                },
              ]}
            >
              <MetricSelect
                setFields={form.setFields}
                namespace={getFieldValue("namespace")}
                resource={sourceType as string}
                sourcefilterMetricValues={sourceFilterMetricValues}
              />
            </Form.Item>
          )}
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
          {() => {
            return form.getFieldValue("namespace") &&
              form.getFieldValue("metricName") ? (
              <Form.Item noStyle name="labels">
                <ResourceSelector
                  form={form}
                  namespace={form.getFieldValue("namespace")}
                  metricName={form.getFieldValue("metricName")}
                  resourceUuid={sourceUuid as string}
                  componentMap={otherSource?.componentMap}
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
          {() => {
            return form.getFieldValue("namespace") &&
              form.getFieldValue("metricName") ? (
              <Form.Item
                style={{ width: 750 }}
                className={styles["trigger-rule"]}
                name="triggerRule"
                label={intl.formatMessage({
                  id: "alarmTriggerRule",
                  defaultMessage: "Alarm Trigger Rule",
                })}
                required
              >
                <AlarmTriggerRuleItem
                  namespace={form.getFieldValue("namespace")}
                  metricName={form.getFieldValue("metricName")}
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
          <CustomSelect type items={repeatIntervalItems} />
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
          {endpoint ? (
            endpointName
          ) : (
            <ModalSelect
              style={{ maxWidth: 400 }}
              title={intl.formatMessage({
                id: "select.notice.object",
                defaultMessage: "Select Endpoint",
              })}
              selectType="checkbox"
              label={intl.formatMessage({
                id: "select.notice.object.add",
                defaultMessage: "Add Endpoint",
              })}
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
          )}
        </Form.Item>
      </ZSVForm.Card>
    </Form>
  );
};

export default BasicConfig;
