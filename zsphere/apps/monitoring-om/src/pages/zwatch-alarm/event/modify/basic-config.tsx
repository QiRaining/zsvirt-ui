import { Form, Select, useMetricNameConfig } from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import type { EmergencyLevel } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import Level from "../../components/level";
import EVENTS_JSON from "../constant/Events.json";

const { Option } = Select;

const EVENTS: any = EVENTS_JSON;

const emergencyLevelList = ["Emergent", "Important", "Normal"];

export const initialValuesByBasicConfig = {
  namespace: "",
  eventName: "",
  actions: [] as Array<{ key: string; op: string; value: string }>,
  labels: {},
  emergencyLevel: "Important" as const,
};

interface IProps {
  form: FormInstance;
  init: typeof initialValuesByBasicConfig;
}

const BasicConfig: React.FC<IProps> = ({ form, init }) => {
  const intl = useIntl();
  const location = useLocation();
  const { isRequired } = useValidator(intl);
  const [_namespaces, _setNamespaces] = useState<string[]>([]);

  const { translateNamespaceToName } = useMetricNameConfig();

  const endpoint = (location.state as any)?.endpoint;
  delete location.state;

  useEffect(() => {
    if (endpoint) {
      form.setFieldsValue({ actions: [endpoint] });
    }
  }, []);

  useEffect(() => {
    const _namaspaces: string[] = Object.keys(EVENTS);
    _setNamespaces(
      _namaspaces?.filter((ns) => !["ZStack/Scheduler"].includes(ns)),
    );
    form.setFieldsValue({ namespace: _namaspaces[0] });

    const _eventNames = Object.keys(EVENTS[_namaspaces[0]]);
    const eventName = _eventNames[0];
    form.setFieldsValue({ eventName });
  }, [form]);

  return (
    <Form
      form={form}
      name="basicConfig"
      initialValues={init || initialValuesByBasicConfig}
    >
      <Form.Item
        name="namespace"
        label={intl.formatMessage({
          id: "resourceType",
          defaultMessage: "Resource Type",
        })}
        required
      >
        {translateNamespaceToName(init?.namespace)}
      </Form.Item>
      {/* <Form.Item
        noStyle
        shouldUpdate={(p, n) => p?.namespace != n?.namespace || p?.eventName != n?.eventName}
      >
        {() =>
          !init?.namespace ? (
            <>
              <Form.Item
                name="eventName"
                label={intl.formatMessage({
                  id: 'alarmEntry',
                  defaultMessage: '报警条目'
                })}
                rules={[isRequired(IIsRequiredType.select)]}
                help={formatEventNameHelp(form.getFieldValue('eventName'))}
              >
                <Select width="l">
                  {Object.keys(EVENTS?.[form.getFieldValue('namespace')] || {})?.map(item => (
                    <Option value={item}>
                      {translateEventName(form.getFieldValue('namespace'), item)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => (
                  <Form.Item name="labels" noStyle>
                    <ResourceSelector
                      namespace={getFieldValue('namespace')}
                      eventName={getFieldValue('eventName')}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </>
          ) : null
        }
      </Form.Item> */}

      <Form.Item
        name="emergencyLevel"
        label={intl.formatMessage({
          id: "alarmLevel",
          defaultMessage: "Severity",
        })}
        rules={[isRequired(IIsRequiredType.select)]}
      >
        <Select width="s">
          {emergencyLevelList.map((item) => (
            <Option value={item} key={item}>
              <Level level={item as EmergencyLevel} />
            </Option>
          ))}
        </Select>
      </Form.Item>
      {/* {!init?.namespace ? (
        <Form.Item
          name="actions"
          label={intl.formatMessage({
            id: 'notice.object',
            defaultMessage: '通知对象'
          })}
        >
          {endpoint ? (
            endpointName
          ) : (
            <ModalSelect
              title={intl.formatMessage({
                id: 'select.notice.object',
                defaultMessage: '请选择通知对象'
              })}
              renderItemContent={(data: any) => {
                return data?.type === 'SYSTEM_HTTP'
                  ? intl.formatMessage({
                      id: 'systemAlarmNoticeObject',
                      defaultMessage: '系统报警通知对象'
                    })
                  : data?.name
              }}
            >
              <EndPointList columnConfig={useColumnConfig()} view="select.virtualization" />
            </ModalSelect>
          )}
        </Form.Item>
      ) : null} */}
    </Form>
  );
};

export default BasicConfig;
