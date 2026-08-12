import { gql } from "@apollo/client";
import type { ISelectProps } from "@zstack/zsphere-components";
import { Form, InputUnit, Select, ZSVForm } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { GlobalConfig as IGlobalConfig } from "@zstack/zsphere-types/graphql";
import { forEach, get, keys, replace, round, toNumber } from "lodash-es";
import React, { useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

const _updateGlobalConfig = gql`
  mutation updateGlobalConfig($input: UpdateGlobalConfigInput!) {
    updateGlobalConfig(input: $input) {
      actionId
    }
  }
`;

interface IProps {
  haConfigMap?: any;
  globalConfigValueMap?: any;
}

const ModifyHaAdvanceSettings: React.FC<
  IActionWrapperProps<IGlobalConfig> & IProps
> = ({
  haConfigMap,
  globalConfigValueMap,
  visible,
  setVisible,
  selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "virtualization.ha.Modify.Settings",
    defaultMessage: "Modify Settings",
  });

  const initialValues = useMemo(() => {
    return {
      "ha.vm.ha.level":
        get(globalConfigValueMap, ["ha.vm.ha.level", "value"]) === "NeverStop",
      "ha.allow.slibing.cross.clusters":
        get(globalConfigValueMap, [
          "ha.allow.slibing.cross.clusters",
          "value",
        ]) === "true",
      "ha.notification.timeliness": get(globalConfigValueMap, [
        "ha.notification.timeliness",
        "value",
      ]),
      "ha.neverStopVm.gc.maxRetryIntervalTime": {
        number: get(globalConfigValueMap, [
          "ha.neverStopVm.gc.maxRetryIntervalTime",
          "value",
        ]),
        unit: "",
      },
      "ha.neverStopVm.retry.delay": {
        number: get(globalConfigValueMap, [
          "ha.neverStopVm.retry.delay",
          "value",
        ]),
        unit: "",
      },
      "ha.neverStopVm.scan.interval": {
        number: get(globalConfigValueMap, [
          "ha.neverStopVm.scan.interval",
          "value",
        ]),
        unit: "",
      },

      "ha.host.selfFencer.storageChecker.timeout": {
        number: get(globalConfigValueMap, [
          "ha.host.selfFencer.storageChecker.timeout",
          "value",
        ]),
        unit: "",
      },
      "ha.host.check.interval": {
        number: get(globalConfigValueMap, ["ha.host.check.interval", "value"]),
        unit: "",
      },
      "ha.host.check.maxAttempts": {
        number: get(globalConfigValueMap, [
          "ha.host.check.maxAttempts",
          "value",
        ]),
        unit: "",
      },
      "ha.host.check.successInterval": {
        number: get(globalConfigValueMap, [
          "ha.host.check.successInterval",
          "value",
        ]),
        unit: "",
      },
      "ha.host.check.successRatio": {
        number: round(
          toNumber(
            get(
              globalConfigValueMap,
              ["ha.host.check.successRatio", "value"],
              0.5,
            ),
          ) * 100,
          0,
        ),
        unit: "",
      },
      "ha.host.check.successTimes": {
        number: get(globalConfigValueMap, [
          "ha.host.check.successTimes",
          "value",
        ]),
        unit: "",
      },
    };
  }, [globalConfigValueMap]);

  useEffect(() => {
    if (visible) {
      form.setFields(
        keys(initialValues).map((key) => ({
          name: key,
          value: initialValues[key],
        })),
      );
    }
  }, [initialValues, visible]);

  const submitHandle = useCallback(
    async (data: any) => {
      const params = data;
      const payload: any[] = [];

      const getValue = (key: string): string => {
        if (key === "ha.vm.ha.level") {
          if (params[key]) {
            return "NeverStop";
          }
          return "None";
        }
        if (key === "ha.allow.slibing.cross.clusters") {
          if (params[key]) {
            return "true";
          }
          return "false";
        }
        if (key === "ha.notification.timeliness") {
          return params[key];
        }
        if (key === "ha.host.check.successRatio") {
          return String(params[key]?.number / 100);
        }
        return String(params[key]?.number);
      };

      forEach(keys(params), (key) => {
        payload.push({
          category: "ha",
          name: replace(key, "ha.", ""),
          value: getValue(key),
        });
      });

      try {
        doAction({
          mutation: _updateGlobalConfig,
          payload,
          name: title,
          total: payload?.length || 1,
          // type: 'HAStrategic',
          onFinish: () => {
            refetch?.();
          },
        });
      } catch {
        //console.log(e)
      }
    },
    [doAction],
  );

  const selectList = ["-1", "0", "1", "2", "3", "4", "5"].map((t) => {
    return {
      value: t,
      displayName: t,
    };
  });

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      title={title}
      widthClassName="w-200"
      onCancel={() => setVisible(false)}
      onOk={submitHandle}
    >
      <Form form={form}>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "Advanced.VM.Settings",
            defaultMessage: "Virtual Machine",
          })}
        >
          <div className={style.config}>
            <Form.Item
              label={get(haConfigMap, ["ha.notification.timeliness", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, [
                    "ha.notification.timeliness",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              valuePropName="checked"
              name="ha.notification.timeliness"
              withBorder
            >
              <Select
                defaultValue={get(globalConfigValueMap, [
                  "ha.notification.timeliness",
                  "value",
                ])}
                style={{ width: 80 }}
              >
                {selectList?.map((it: ISelectProps) => (
                  <Select.Option key={it.value} value={it.value}>
                    {it?.displayName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={get(haConfigMap, [
                "ha.neverStopVm.gc.maxRetryIntervalTime",
                "name",
              ])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, [
                    "ha.neverStopVm.gc.maxRetryIntervalTime",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.neverStopVm.gc.maxRetryIntervalTime"
              rules={get(
                haConfigMap,
                ["ha.neverStopVm.gc.maxRetryIntervalTime", "formItem", "rules"],
                [],
              )}
              withBorder
            >
              <InputUnit
                suffix={
                  <span style={{ marginLeft: 8 }}>
                    {intl.formatMessage({ id: "second", defaultMessage: " seconds" })}
                  </span>
                }
              />
            </Form.Item>

            <Form.Item
              label={get(haConfigMap, ["ha.neverStopVm.retry.delay", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, [
                    "ha.neverStopVm.retry.delay",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.neverStopVm.retry.delay"
              rules={get(
                haConfigMap,
                ["ha.neverStopVm.retry.delay", "formItem", "rules"],
                [],
              )}
              withBorder
            >
              <InputUnit
                suffix={
                  <span style={{ marginLeft: 8 }}>
                    {intl.formatMessage({ id: "second", defaultMessage: " seconds" })}
                  </span>
                }
              />
            </Form.Item>
            <Form.Item
              label={get(haConfigMap, ["ha.neverStopVm.scan.interval", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, [
                    "ha.neverStopVm.scan.interval",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              rules={get(
                haConfigMap,
                ["ha.neverStopVm.scan.interval", "formItem", "rules"],
                [],
              )}
              name="ha.neverStopVm.scan.interval"
              withBorder
            >
              <InputUnit
                suffix={
                  <span style={{ marginLeft: 8 }}>
                    {intl.formatMessage({ id: "second", defaultMessage: " seconds" })}
                  </span>
                }
              />
            </Form.Item>
          </div>
        </ZSVForm.Card>

        <ZSVForm.Card
          title={intl.formatMessage({
            id: "Advanced.Host.Settings",
            defaultMessage: "Host",
          })}
        >
          <div className={style.config}>
            <Form.Item
              label={get(haConfigMap, [
                "ha.host.selfFencer.storageChecker.timeout",
                "name",
              ])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, [
                    "ha.host.selfFencer.storageChecker.timeout",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.selfFencer.storageChecker.timeout"
              rules={get(
                haConfigMap,
                [
                  "ha.host.selfFencer.storageChecker.timeout",
                  "formItem",
                  "rules",
                ],
                [],
              )}
              withBorder
            >
              <InputUnit
                suffix={
                  <span style={{ marginLeft: 8 }}>
                    {intl.formatMessage({ id: "second", defaultMessage: " seconds" })}
                  </span>
                }
              />
            </Form.Item>
            <Form.Item
              label={get(haConfigMap, ["ha.host.check.interval", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, ["ha.host.check.interval", "description"])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.interval"
              rules={get(
                haConfigMap,
                ["ha.host.check.interval", "formItem", "rules"],
                [],
              )}
              withBorder
            >
              <InputUnit
                suffix={
                  <span style={{ marginLeft: 8 }}>
                    {intl.formatMessage({ id: "second", defaultMessage: " seconds" })}
                  </span>
                }
              />
            </Form.Item>
            <Form.Item
              label={get(haConfigMap, ["ha.host.check.maxAttempts", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, [
                    "ha.host.check.maxAttempts",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.maxAttempts"
              rules={get(
                haConfigMap,
                ["ha.host.check.maxAttempts", "formItem", "rules"],
                [],
              )}
              withBorder
            >
              <InputUnit
                suffix={
                  <span style={{ marginLeft: 8 }}>
                    {intl.formatMessage({
                      id: "count.ci",
                      defaultMessage: "times",
                    })}
                  </span>
                }
              />
            </Form.Item>

            <Form.Item
              label={get(haConfigMap, [
                "ha.host.check.successInterval",
                "name",
              ])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, [
                    "ha.host.check.successInterval",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.successInterval"
              rules={get(
                haConfigMap,
                ["ha.host.check.successInterval", "formItem", "rules"],
                [],
              )}
              withBorder
            >
              <InputUnit
                suffix={
                  <span style={{ marginLeft: 8 }}>
                    {intl.formatMessage({ id: "second", defaultMessage: " seconds" })}
                  </span>
                }
              />
            </Form.Item>

            <Form.Item
              label={get(haConfigMap, ["ha.host.check.successRatio", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, [
                    "ha.host.check.successRatio",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.successRatio"
              rules={get(
                haConfigMap,
                ["ha.host.check.successRatio", "formItem", "rules"],
                [],
              )}
              withBorder
            >
              <InputUnit
                suffix={
                  <span style={{ marginLeft: 8 }}>
                    {intl.formatMessage({ id: "percent", defaultMessage: "%" })}
                  </span>
                }
              />
            </Form.Item>

            <Form.Item
              label={get(haConfigMap, ["ha.host.check.successTimes", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {get(haConfigMap, [
                    "ha.host.check.successTimes",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.successTimes"
              rules={get(
                haConfigMap,
                ["ha.host.check.successTimes", "formItem", "rules"],
                [],
              )}
              withBorder
            >
              <InputUnit
                suffix={
                  <span style={{ marginLeft: 8 }}>
                    {intl.formatMessage({
                      id: "count.ci",
                      defaultMessage: "times",
                    })}
                  </span>
                }
              />
            </Form.Item>
          </div>
        </ZSVForm.Card>
      </Form>
    </DialogForm>
  );
};

export default ModifyHaAdvanceSettings;
