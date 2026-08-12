import { gql, useQuery } from "@apollo/client";
import { InfoPopover, Text } from "@zstack/design";
import { ZSVForm, Switch } from "@zstack/zsphere-components";
import type { ISelectProps } from "@zstack/zsphere-components";
import {
  Field,
  Form,
  InputUnit,
  Select,
  Tag,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  HAStrategic,
  GlobalConfig as IGlobalConfig,
} from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";
import React, { useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

interface IProps {
  haConfigMap?: any;
  globalConfigValueMap?: any;
}

const GET_HA_STRATEGIC = gql`
  query haStrategic($conditions: [Condition!]) {
    haStrategic(conditions: $conditions) {
      haStrategic {
        fencerName
        state
        uuid
      }
    }
  }
`;
const ENABLE_HA_STRATEGIC = gql`
  mutation enableHAStrategic($input: HAStrategicInput!) {
    enableHAStrategic(input: $input) {
      actionId
    }
  }
`;

const ModifyHaStrategic: React.FC<
  IActionWrapperProps<IGlobalConfig> & IProps
> = ({
  haConfigMap,
  globalConfigValueMap,
  source,
  visible,
  setVisible,
  selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const { data: strategicData } = useQuery<{ haStrategic: HAStrategic }>(
    GET_HA_STRATEGIC,
    {
      variables: {
        conditions: [
          {
            key: "fencerName",
            op: Op.in,
            values: ["hostStorageState", "hostBusinessNic"],
          },
        ],
      },
    },
  );

  const { hostStorageState, hostBusinessNic } = useMemo(() => {
    const strategic = strategicData?.haStrategic?.haStrategic;

    const _hostStorageState = _.find(
      strategic,
      (e) => e.fencerName === "hostStorageState",
    );
    const _hostBusinessNic = _.find(
      strategic,
      (e) => e.fencerName === "hostBusinessNic",
    );

    return {
      hostStorageState: _hostStorageState,
      hostBusinessNic: _hostBusinessNic,
    };
  }, [strategicData?.haStrategic?.haStrategic]);

  const title = intl.formatMessage({
    id: "virtualization.enable.high.availability.strategy",
    defaultMessage: "Enable HA Policy",
  });

  const initialValues = useMemo(() => {
    //
    // 场景2.3默认打开
    // 检查存储网络故障策略是否启用
    // const hasHostStorageState = !!hostStorageState && hostStorageState?.state === 'Enable'
    const hasHostStorageState = true;
    // 检查业务网卡故障策略是否启用
    const hasHostBusinessNic =
      !!hostBusinessNic && hostBusinessNic?.state === "Enable";
    // 如果任一策略启用，则同时故障场景也启用
    const hasBoth = hasHostStorageState || hasHostBusinessNic;

    return {
      // 存储网络故障策略
      hostStorageState: hasHostStorageState,
      // 业务网卡故障策略
      hostBusinessNic: hasHostBusinessNic,
      // 同时故障场景策略
      hostBusinessNic_hostStorageState: hasBoth,
      "ha.host.selfFencer.interval": {
        number: _.get(globalConfigValueMap, [
          "ha.host.selfFencer.interval",
          "value",
        ]),
        unit: "",
      },
      "ha.host.selfFencer.maxAttempts": {
        number: _.get(globalConfigValueMap, [
          "ha.host.selfFencer.maxAttempts",
          "value",
        ]),
        unit: "",
      },

      "ha.vm.ha.level":
        _.get(globalConfigValueMap, ["ha.vm.ha.level", "value"]) ===
        "NeverStop",
      "ha.allow.slibing.cross.clusters":
        _.get(globalConfigValueMap, [
          "ha.allow.slibing.cross.clusters",
          "value",
        ]) === "true",
      "ha.notification.timeliness": _.get(globalConfigValueMap, [
        "ha.notification.timeliness",
        "value",
      ]),
      "ha.neverStopVm.gc.maxRetryIntervalTime": {
        number: _.get(globalConfigValueMap, [
          "ha.neverStopVm.gc.maxRetryIntervalTime",
          "value",
        ]),
        unit: "",
      },
      "ha.neverStopVm.retry.delay": {
        number: _.get(globalConfigValueMap, [
          "ha.neverStopVm.retry.delay",
          "value",
        ]),
        unit: "",
      },
      "ha.neverStopVm.scan.interval": {
        number: _.get(globalConfigValueMap, [
          "ha.neverStopVm.scan.interval",
          "value",
        ]),
        unit: "",
      },

      "ha.host.selfFencer.storageChecker.timeout": {
        number: _.get(globalConfigValueMap, [
          "ha.host.selfFencer.storageChecker.timeout",
          "value",
        ]),
        unit: "",
      },
      "ha.host.check.interval": {
        number: _.get(globalConfigValueMap, [
          "ha.host.check.interval",
          "value",
        ]),
        unit: "",
      },
      "ha.host.check.maxAttempts": {
        number: _.get(globalConfigValueMap, [
          "ha.host.check.maxAttempts",
          "value",
        ]),
        unit: "",
      },
      "ha.host.check.successInterval": {
        number: _.get(globalConfigValueMap, [
          "ha.host.check.successInterval",
          "value",
        ]),
        unit: "",
      },
      "ha.host.check.successRatio": {
        number: _.round(
          _.toNumber(
            _.get(
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
        number: _.get(globalConfigValueMap, [
          "ha.host.check.successTimes",
          "value",
        ]),
        unit: "",
      },
    };
  }, [hostStorageState, hostBusinessNic, globalConfigValueMap]);

  useEffect(() => {
    if (visible) {
      form.setFields(
        _.keys(initialValues).map((key) => ({
          name: key,
          value: initialValues[key],
        })),
      );
    }
  }, [initialValues, visible]);

  const submitHandle = useCallback(
    async (data: any) => {
      const {
        hostBusinessNic: _hostBusinessNic,
        hostBusinessNic_hostStorageState: _hostBusinessNic_hostStorageState,
        hostStorageState: _hostStorageState,
        ...params
      } = data;

      const payload = [
        {
          name: "enable",
          category: "ha",
          value: "true",
        },
      ];
      const haStrategicForPayload = [];

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

      _.forEach(_.keys(params), (key) => {
        payload.push({
          category: "ha",
          name: _.replace(key, "ha.", ""),
          value: getValue(key),
        });
      });

      if (_hostBusinessNic && _hostStorageState) {
        haStrategicForPayload.push({
          state: "Enable",
          uuid: hostBusinessNic?.uuid,
        });
        haStrategicForPayload.push({
          state: "Enable",
          uuid: hostStorageState?.uuid,
        });
      } else if (!_hostBusinessNic && !_hostStorageState) {
        haStrategicForPayload.push({
          state: "Disable",
          uuid: hostBusinessNic?.uuid,
        });
        haStrategicForPayload.push({
          state: "Disable",
          uuid: hostStorageState?.uuid,
        });
      } else if (_hostBusinessNic && !_hostStorageState) {
        haStrategicForPayload.push({
          state: "Enable",
          uuid: hostBusinessNic?.uuid,
        });
        haStrategicForPayload.push({
          state: "Disable",
          uuid: hostStorageState?.uuid,
        });
      } else if (!_hostBusinessNic && _hostStorageState) {
        haStrategicForPayload.push({
          state: "Disable",
          uuid: hostBusinessNic?.uuid,
        });
        haStrategicForPayload.push({
          state: "Enable",
          uuid: hostStorageState?.uuid,
        });
      }

      doAction({
        mutation: ENABLE_HA_STRATEGIC,
        name: intl.formatMessage({
          id: "virtualization.enable.high.availability.strategy",
          defaultMessage: "Enable HA Policy",
        }),
        payload: {
          haStrategic: haStrategicForPayload,
          updateGlobalConfigPayload: payload,
        },
        total: 1,
        // type: 'HAStrategic',
        onFinish: () => {
          refetch?.();
        },
      });
    },
    [doAction, hostStorageState, hostBusinessNic],
  );

  const scenarios = useMemo(() => {
    const _scenarios = [
      {
        title: intl.formatMessage({
          id: "scenarioOne",
          defaultMessage: "Scenario A",
        }),
        statuses: [
          {
            text: intl.formatMessage({
              id: "HostManagementNetworkStatus",
              defaultMessage: "Management Network Connectivity Status",
            }),
            theme: "green",
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
            theme: "green",
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
            theme: "red",
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
        statuses: [
          {
            text: intl.formatMessage({
              id: "HostManagementNetworkStatus",
              defaultMessage: "Management Network Connectivity Status",
            }),
            theme: "green",
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
            theme: "red",
            statusName: intl.formatMessage({
              id: "status.Fault",
              defaultMessage: "Fault",
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
            theme: "green",
            statusName: intl.formatMessage({
              id: "status.Normal",
              defaultMessage: "Normal",
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
          id: "scenarioThree",
          defaultMessage: "Scenario C",
        }),
        statuses: [
          {
            text: intl.formatMessage({
              id: "HostManagementNetworkStatus",
              defaultMessage: "Management Network Connectivity Status",
            }),
            theme: "green",
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
            theme: "red",
            statusName: intl.formatMessage({
              id: "status.Fault",
              defaultMessage: "Fault",
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
            theme: "red",
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
          id: "scenarioFour",
          defaultMessage: "Scenario D",
        }),
        statuses: [
          {
            text: intl.formatMessage({
              id: "HostManagementNetworkStatus",
              defaultMessage: "Management Network Connectivity Status",
            }),
            theme: "red",
            statusName: intl.formatMessage({
              id: "status.Fault",
              defaultMessage: "Fault",
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
            theme: "green",
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
            theme: "green",
            statusName: intl.formatMessage({
              id: "status.Normal",
              defaultMessage: "Normal",
            }),
            tooltip: intl.formatMessage({
              id: "HostBusinessNetworkCardStatus.tooltip",
              defaultMessage: `### Business NIC Status

Business NIC status may turn Abnormal if errors occur to the host business NIC or the switch port directly connecting to the host business NIC that is associated with the distributed switch of virtual machines.`,
            }),
          },
        ],
      },
    ];

    return _scenarios;
  }, [intl]);

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
            id: "VM.Failover.Migration.Policy",
            defaultMessage: "VM Failover Policy",
          })}
        >
          <div className="flex justify-start gap-3">
            <div>
              <div className={style.contentCard}>
                <div className={style.title}>
                  {_.get(scenarios, ["0", "title"])}
                </div>
                {_.map(
                  _.get(scenarios, ["0", "statuses"], []),
                  (status, idx) => (
                    <div
                      className={`flex items-center gap-[5px] ${style.content}`}
                      key={idx}
                    >
                      <div className={`flex items-center ${style.textWrapper}`}>
                        <Text className={style.text}>{status.text}</Text>
                        <InfoPopover
                          content={
                            <ReactMarkdown>{status?.tooltip}</ReactMarkdown>
                          }
                        />
                      </div>
                      <Tag style={{ marginLeft: "5px" }} theme={status?.theme}>
                        {status.statusName}
                      </Tag>
                    </div>
                  ),
                )}
                <div className={style.divider} />

                <Field
                  label={intl.formatMessage({
                    id: "vm.Migration.on.Failure",
                    defaultMessage: "Fail Over",
                  })}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.Migration.on.Failure.tooltip",
                        defaultMessage: `### Fail Over

If you enable failover, once the failover condition is met, virtual machines with HA enabled will be started on another host.`,
                      })}
                    </ReactMarkdown>
                  }
                >
                  <Form.Item
                    valuePropName="checked"
                    name="hostBusinessNic"
                    noStyle
                  >
                    <Switch
                      onChange={(val) => {
                        const hostStorageState =
                          form.getFieldValue("hostStorageState");
                        const _Fields = [
                          {
                            name: "hostBusinessNic",
                            value: val,
                          },
                        ];
                        if (!hostStorageState) {
                          _Fields.push({
                            name: "hostBusinessNic_hostStorageState",
                            value: val,
                          });
                        }

                        form.setFields(_Fields);
                      }}
                    />
                  </Form.Item>
                </Field>
              </div>
            </div>

            <div>
              <div className={style.contentCard}>
                <div className={style.title}>
                  {_.get(scenarios, ["1", "title"])}
                </div>
                {_.map(
                  _.get(scenarios, ["1", "statuses"], []),
                  (status, idx) => (
                    <div
                      className={`flex items-center gap-[5px] ${style.content}`}
                      key={idx}
                    >
                      <div className={`flex items-center ${style.textWrapper}`}>
                        <Text className={style.text}>{status.text}</Text>
                        <InfoPopover
                          content={
                            <ReactMarkdown>{status?.tooltip}</ReactMarkdown>
                          }
                        />
                      </div>
                      <Tag style={{ marginLeft: "5px" }} theme={status?.theme}>
                        {status.statusName}
                      </Tag>
                    </div>
                  ),
                )}
                <div className={style.divider} />
                <Field
                  label={intl.formatMessage({
                    id: "vm.Migration.on.Failure",
                    defaultMessage: "Fail Over",
                  })}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.Migration.on.Failure.tooltip",
                        defaultMessage: `### Fail Over

If you enable failover, once the failover condition is met, virtual machines with HA enabled will be started on another host.`,
                      })}
                    </ReactMarkdown>
                  }
                  tooltip={intl.formatMessage({
                    id: "ha.migrate.hostStorageState.title",
                    defaultMessage:
                      "You cannot set the failover policy because the storage network is in a fault status.",
                  })}
                >
                  <Form.Item
                    valuePropName="checked"
                    name="hostStorageState"
                    noStyle
                  >
                    <Switch
                      disabled
                      onChange={(val) => {
                        const hostBusinessNic =
                          form.getFieldValue("hostBusinessNic");

                        const _Fields = [
                          {
                            name: "hostStorageState",
                            value: val,
                          },
                        ];
                        if (!hostBusinessNic) {
                          _Fields.push({
                            name: "hostBusinessNic_hostStorageState",
                            value: val,
                          });
                        }

                        form.setFields(_Fields);
                      }}
                    />
                  </Form.Item>
                </Field>
              </div>
            </div>

            <div>
              <div className={style.contentCard}>
                <div className={style.title}>
                  {_.get(scenarios, ["2", "title"])}
                </div>
                {_.map(
                  _.get(scenarios, ["2", "statuses"], []),
                  (status, idx) => (
                    <div
                      className={`flex items-center gap-[5px] ${style.content}`}
                      key={idx}
                    >
                      <div className={`flex items-center ${style.textWrapper}`}>
                        <Text className={style.text}>{status.text}</Text>
                        <InfoPopover
                          content={
                            <ReactMarkdown>{status?.tooltip}</ReactMarkdown>
                          }
                        />
                      </div>
                      <Tag style={{ marginLeft: "5px" }} theme={status?.theme}>
                        {status.statusName}
                      </Tag>
                    </div>
                  ),
                )}
                <div className={style.divider} />
                <Field
                  label={intl.formatMessage({
                    id: "vm.Migration.on.Failure",
                    defaultMessage: "Fail Over",
                  })}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.Migration.on.Failure.tooltip",
                        defaultMessage: `### Fail Over

If you enable failover, once the failover condition is met, virtual machines with HA enabled will be started on another host.`,
                      })}
                    </ReactMarkdown>
                  }
                  tooltip={intl.formatMessage({
                    id: "ha.migrate.both.title",
                    defaultMessage:
                      "The failover policy of this scenario follows the preceding two failover policies of this table.\nIf you set both the preceding two policies to No, then this failover policy is set to No. If you set either of the two to Yes, then this failover policy is set to Yes.",
                  })}
                >
                  <Form.Item
                    noStyle
                    valuePropName="checked"
                    name="hostBusinessNic_hostStorageState"
                  >
                    <Switch disabled />
                  </Form.Item>
                </Field>
              </div>
            </div>

            <div>
              <div className={style.contentCard}>
                <div className={style.title}>
                  {_.get(scenarios, ["3", "title"])}
                </div>
                {_.map(
                  _.get(scenarios, ["3", "statuses"], []),
                  (status, idx) => (
                    <div
                      className={`flex items-center gap-[5px] ${style.content}`}
                      key={idx}
                    >
                      <div className={`flex items-center ${style.textWrapper}`}>
                        <Text className={style.text}>{status.text}</Text>
                        <InfoPopover
                          content={
                            <ReactMarkdown>{status?.tooltip}</ReactMarkdown>
                          }
                        />
                      </div>
                      <Tag style={{ marginLeft: "5px" }} theme={status?.theme}>
                        {status.statusName}
                      </Tag>
                    </div>
                  ),
                )}
                <div className={style.divider} />
                <Field
                  label={intl.formatMessage({
                    id: "vm.Migration.on.Failure",
                    defaultMessage: "Fail Over",
                  })}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.Migration.on.Failure.tooltip",
                        defaultMessage: `### Fail Over

If you enable failover, once the failover condition is met, virtual machines with HA enabled will be started on another host.`,
                      })}
                    </ReactMarkdown>
                  }
                  tooltip={intl.formatMessage({
                    id: "ha.migrate.manage.title",
                    defaultMessage:
                      "If the management network is in Abnormal status, you cannot set this failover policy.",
                  })}
                >
                  <Form.Item valuePropName="checked" noStyle>
                    <Switch disabled defaultChecked={false} />
                  </Form.Item>
                </Field>
              </div>
            </div>
          </div>
        </ZSVForm.Card>

        <ZSVForm.Card
          title={intl.formatMessage({
            id: "Host.Self-check.Fault.Settings",
            defaultMessage: "Host Self-Test Failure Settings",
          })}
        >
          <Form.Item
            name="ha.host.selfFencer.interval"
            label={_.get(haConfigMap, ["ha.host.selfFencer.interval", "name"])}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {_.get(haConfigMap, [
                  "ha.host.selfFencer.interval",
                  "description",
                ])}
              </ReactMarkdown>
            }
            required
            rules={_.get(
              haConfigMap,
              ["ha.host.selfFencer.interval", "formItem", "rules"],
              [],
            )}
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
            name="ha.host.selfFencer.maxAttempts"
            label={_.get(haConfigMap, [
              "ha.host.selfFencer.maxAttempts",
              "name",
            ])}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {_.get(haConfigMap, [
                  "ha.host.selfFencer.maxAttempts",
                  "description",
                ])}
              </ReactMarkdown>
            }
            required
            rules={_.get(
              haConfigMap,
              ["ha.host.selfFencer.maxAttempts", "formItem", "rules"],
              [],
            )}
            description={intl.formatMessage({
              id: "ha.action.ha.host.selfFencer.maxAttempts.description",
              defaultMessage:
                "If self-check fails more than the current setting times, the system will diagnose as a host exception.",
            })}
          >
            <InputUnit
              suffix={
                <span style={{ marginLeft: 8 }}>
                  {intl.formatMessage({ id: "count.ci", defaultMessage: "times" })}
                </span>
              }
            />
          </Form.Item>
        </ZSVForm.Card>

        <ZSVForm.Card
          title={intl.formatMessage({
            id: "Advanced.Settings",
            defaultMessage: "Advanced Settings",
          })}
        >
          <div className={style.config}>
            <Form.Item
              label={_.get(haConfigMap, ["ha.vm.ha.level", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, ["ha.vm.ha.level", "description"])}
                </ReactMarkdown>
              }
              valuePropName="checked"
              name="ha.vm.ha.level"
              withBorder
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label={_.get(haConfigMap, [
                "ha.allow.slibing.cross.clusters",
                "name",
              ])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.allow.slibing.cross.clusters",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              valuePropName="checked"
              name="ha.allow.slibing.cross.clusters"
              withBorder
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label={_.get(haConfigMap, ["ha.notification.timeliness", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
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
                defaultValue={_.get(globalConfigValueMap, [
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
              label={_.get(haConfigMap, [
                "ha.neverStopVm.gc.maxRetryIntervalTime",
                "name",
              ])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.neverStopVm.gc.maxRetryIntervalTime",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.neverStopVm.gc.maxRetryIntervalTime"
              rules={_.get(
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
              label={_.get(haConfigMap, ["ha.neverStopVm.retry.delay", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.neverStopVm.retry.delay",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.neverStopVm.retry.delay"
              rules={_.get(
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
              label={_.get(haConfigMap, [
                "ha.neverStopVm.scan.interval",
                "name",
              ])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.neverStopVm.scan.interval",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              rules={_.get(
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

            <Form.Item
              label={_.get(haConfigMap, [
                "ha.host.selfFencer.storageChecker.timeout",
                "name",
              ])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.host.selfFencer.storageChecker.timeout",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.selfFencer.storageChecker.timeout"
              rules={_.get(
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
              label={_.get(haConfigMap, ["ha.host.check.interval", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.host.check.interval",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.interval"
              rules={_.get(
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
              label={_.get(haConfigMap, ["ha.host.check.maxAttempts", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.host.check.maxAttempts",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.maxAttempts"
              rules={_.get(
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
              label={_.get(haConfigMap, [
                "ha.host.check.successInterval",
                "name",
              ])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.host.check.successInterval",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.successInterval"
              rules={_.get(
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
              label={_.get(haConfigMap, ["ha.host.check.successRatio", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.host.check.successRatio",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.successRatio"
              rules={_.get(
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
              label={_.get(haConfigMap, ["ha.host.check.successTimes", "name"])}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.host.check.successTimes",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              name="ha.host.check.successTimes"
              rules={_.get(
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

export default ModifyHaStrategic;
