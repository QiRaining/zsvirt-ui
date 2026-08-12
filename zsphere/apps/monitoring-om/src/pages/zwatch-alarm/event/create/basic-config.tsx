import {
  ModalSelect,
  AuthHander,
  Form,
  Select,
  useAuth,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import type { EmergencyLevel } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import EndPointList from "../../../zwatch-endpoint/list";
import Level from "../../components/level";
import ResourceSelector from "../components/resource-selector";
import EVENTS_JSON from "../constant/Events.json";

const { Option } = Select;

const emergencyLevelList = ["Emergent", "Important", "Normal"];

interface LabelItem {
  key: string;
  op: string;
  value: string;
}

type IInitalValuesType = {
  namespace: string;
  eventName: string;
  actions: Array<LabelItem>;
  labels: object;
  emergencyLevel: "Emergent" | "Important" | "Normal";
};

export const initialValuesByBasicConfig: IInitalValuesType = {
  namespace: "",
  eventName: "",
  actions: [],
  labels: {},
  emergencyLevel: "Important",
};

const EVENTS: any = EVENTS_JSON;
interface IProps {
  form: FormInstance;
  init: IInitalValuesType;
  otherSource: any;
}

const BasicConfig: React.FC<IProps> = ({ form, init: _init, otherSource }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [namespaces, setNamespaces] = useState<string[]>([]);

  const {
    translateEventType,
    translateAlarmAuth,
    translateEventName,
    formatEventNameHelp,
  } = useMetricNameConfig();

  const { endpoint } = otherSource as any;

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
  }, []);

  useEffect(() => {
    const _namaspaces: string[] = Object.keys(EVENTS);
    setNamespaces(_namaspaces);
    form.setFieldsValue({ namespace: _namaspaces[0] });

    const _eventNames = Object.keys(EVENTS[_namaspaces[0]]);
    const eventName = _eventNames[0];
    form.setFieldsValue({ eventName });
  }, [form]);

  return (
    <Form
      form={form}
      name="basicConfig"
      initialValues={initialValuesByBasicConfig}
    >
      <Form.Item
        name="namespace"
        label={intl.formatMessage({
          id: "resourceType",
          defaultMessage: "Resource Type",
        })}
      >
        <Select
          width="s"
          onChange={(v) => {
            form.setFieldsValue({
              eventName: Object.keys(EVENTS?.[v as string])?.[0],
            });
          }}
        >
          {namespaces?.map((cv) => {
            const auth = translateAlarmAuth(cv);
            if (auth) {
              return hasAuth(auth) ? (
                <Option value={cv} key={cv}>
                  <AuthHander {...auth}>{translateEventType(cv)}</AuthHander>
                </Option>
              ) : null;
            }
            return (
              <Option value={cv} key={cv}>
                {translateEventType(cv)}
              </Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(p, n) =>
          p?.namespace != n?.namespace || p?.eventName != n?.eventName
        }
      >
        {() => (
          <>
            <Form.Item
              name="eventName"
              label={intl.formatMessage({
                id: "alarmEntry",
                defaultMessage: "Metric Item",
              })}
              // rules={[isRequired(IIsRequiredType.select)]}
              help={formatEventNameHelp(form.getFieldValue("eventName"))}
            >
              <Select width="l">
                {Object.keys(
                  EVENTS?.[form.getFieldValue("namespace")] || {},
                )?.map((item) => (
                  <Option value={item} key={item}>
                    {translateEventName(form.getFieldValue("namespace"), item)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => (
                <Form.Item name="labels" noStyle>
                  <ResourceSelector
                    namespace={getFieldValue("namespace")}
                    eventName={getFieldValue("eventName")}
                  />
                </Form.Item>
              )}
            </Form.Item>
          </>
        )}
      </Form.Item>

      <Form.Item
        name="emergencyLevel"
        label={intl.formatMessage({
          id: "alarmLevel",
          defaultMessage: "Severity",
        })}
        // rules={[isRequired(IIsRequiredType.select)]}
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
            style={{ maxWidth: 320 }}
            title={intl.formatMessage({
              id: "select.notice.object",
              defaultMessage: "Select Endpoint",
            })}
            renderItemContent={(data: any) => {
              return data?.type === "SYSTEM_HTTP"
                ? intl.formatMessage({
                    id: "systemAlarmNoticeObject",
                    defaultMessage: "System Endpoint",
                  })
                : data?.name;
            }}
            label={intl.formatMessage({
              id: "select.notice.object.add",
              defaultMessage: "Add Endpoint",
            })}
            selectType="checkbox"
          >
            <EndPointList view="select.virtualization" />
          </ModalSelect>
        )}
      </Form.Item>
    </Form>
  );
};

export default BasicConfig;
