import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, Form, InfoPopover, Switch, Tag, Text } from "@zstack/design";
import {
  FieldStack,
  InputUnitField,
  SwitchField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { ZSVForm } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { GlobalConfig as IGlobalConfig } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createModifyMigrationStrategySchema,
  type ModifyMigrationStrategyFormValues,
} from "./schema";

import style from "./style.module.less";

interface IProps {
  haConfigMap?: any;
  globalConfigValueMap?: any;
}
const ENABLE_HA_STRATEGIC = gql`
  mutation enableHAStrategic($input: HAStrategicInput!) {
    enableHAStrategic(input: $input) {
      actionId
    }
  }
`;

const ModifyMigrationStrategy: React.FC<
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
  const doAction = useAction();

  let hostStorageState: any;
  let hostBusinessNic: any;

  if (source && source?.length > 0) {
    hostStorageState = _.find(
      source,
      (e) => e.fencerName === "hostStorageState",
    );

    hostBusinessNic = _.find(source, (e) => e.fencerName === "hostBusinessNic");
  }

  const title = intl.formatMessage({
    id: "virtualization.ha.Modify.Strategy",
    defaultMessage: "Modify Policy",
  });

  const defaultValues = useMemo<ModifyMigrationStrategyFormValues>(() => {
    const hasHostStorageState =
      !!hostStorageState && hostStorageState?.state === "Enable";
    const hasHostBusinessNic =
      !!hostBusinessNic && hostBusinessNic?.state === "Enable";

    return {
      hostStorageState: hasHostStorageState,
      hostBusinessNic: hasHostBusinessNic,
      hostBusinessNicHostStorageState:
        !!hasHostStorageState || !!hasHostBusinessNic,
      hostSelfFencerInterval: {
        number: _.get(globalConfigValueMap, [
          "ha.host.selfFencer.interval",
          "value",
        ]),
        unit: "",
      },
      hostSelfFencerMaxAttempts: {
        number: _.get(globalConfigValueMap, [
          "ha.host.selfFencer.maxAttempts",
          "value",
        ]),
        unit: "",
      },
    };
  }, [globalConfigValueMap, source]);
  const formSchema = useMemo(
    () => createModifyMigrationStrategySchema(intl),
    [intl],
  );
  const form = useForm<ModifyMigrationStrategyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const hostBusinessNicValue = form.watch("hostBusinessNic");
  const hostStorageStateValue = form.watch("hostStorageState");

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  useEffect(() => {
    form.setValue(
      "hostBusinessNicHostStorageState",
      Boolean(hostBusinessNicValue || hostStorageStateValue),
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      },
    );
  }, [form, hostBusinessNicValue, hostStorageStateValue]);

  const submitHandle = useCallback(
    async (data: ModifyMigrationStrategyFormValues) => {
      const {
        hostBusinessNic: _hostBusinessNic,
        hostStorageState: _hostStorageState,
      } = data;

      const payload: { category: string; name: string; value: string }[] = [];
      const haStrategic = [];

      [
        ["ha.host.selfFencer.interval", data.hostSelfFencerInterval],
        ["ha.host.selfFencer.maxAttempts", data.hostSelfFencerMaxAttempts],
      ].forEach(([key, value]) => {
        payload.push({
          category: "ha",
          name: _.replace(key as string, "ha.", ""),
          value: String(
            (
              value as ModifyMigrationStrategyFormValues["hostSelfFencerInterval"]
            )?.number,
          ),
        });
      });

      if (_hostBusinessNic && _hostStorageState) {
        haStrategic.push({
          state: "Enable",
          uuid: hostBusinessNic?.uuid,
        });
        haStrategic.push({
          state: "Enable",
          uuid: hostStorageState?.uuid,
        });
      } else if (!_hostBusinessNic && !_hostStorageState) {
        haStrategic.push({
          state: "Disable",
          uuid: hostBusinessNic?.uuid,
        });
        haStrategic.push({
          state: "Disable",
          uuid: hostStorageState?.uuid,
        });
      } else if (_hostBusinessNic && !_hostStorageState) {
        haStrategic.push({
          state: "Enable",
          uuid: hostBusinessNic?.uuid,
        });
        haStrategic.push({
          state: "Disable",
          uuid: hostStorageState?.uuid,
        });
      } else if (!_hostBusinessNic && _hostStorageState) {
        haStrategic.push({
          state: "Disable",
          uuid: hostBusinessNic?.uuid,
        });
        haStrategic.push({
          state: "Enable",
          uuid: hostStorageState?.uuid,
        });
      }

      doAction({
        mutation: ENABLE_HA_STRATEGIC,
        name: intl.formatMessage({
          id: "virtualization.ha.Modify.Strategy",
          defaultMessage: "Modify Policy",
        }),
        payload: {
          haStrategic,
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
            theme: "red",
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
            theme: "green",
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
            theme: "red",
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
            theme: "red",
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
            theme: "red",
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
            theme: "green",
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
            theme: "green",
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
  }, [intl]);

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      title={title}
      widthClassName="w-200"
      onCancel={() => setVisible(false)}
      onOk={submitHandle}
    >
      <Form {...form}>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "VM.Failover.Migration.Policy",
            defaultMessage: "VM Failover Policy",
          })}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className={style.contentCard}>
                <div className={style.title}>
                  {_.get(scenarios, ["0", "title"])}
                </div>
                {_.map(
                  _.get(scenarios, ["0", "statuses"], []),
                  (status, idx) => (
                    <div
                      className={`flex items-center gap-2 ${style.content}`}
                      key={idx}
                    >
                      <div className={`flex items-center ${style.textWrapper}`}>
                        <Text className={style.text}>{status.text}</Text>
                        {status?.tooltip && (
                          <InfoPopover
                            content={
                              <ReactMarkdown>{status?.tooltip}</ReactMarkdown>
                            }
                          />
                        )}
                      </div>
                      <Tag style={{ marginLeft: "5px" }} theme={status?.theme}>
                        {status.statusName}
                      </Tag>
                    </div>
                  ),
                )}
                <div className={style.divider} />
                {/* <div className="flex items-center gap-2">
                  <Text
                    value={intl.formatMessage({
                      id: 'IsMigration.with.Colon',
                      defaultMessage: '是否迁移 :'
                    })}
                  />

                  <Form.Item valuePropName="checked" name={'hostBusinessNic'} noStyle>
                    <Switch
                      onChange={val => {
                        const hostStorageState = form.getFieldValue('hostStorageState')
                        const _Fields = [
                          {
                            name: 'hostBusinessNic',
                            value: val
                          }
                        ]
                        if (!hostStorageState) {
                          _Fields.push({
                            name: 'hostBusinessNic_hostStorageState',
                            value: val
                          })
                        }

                        form.setFields(_Fields)
                      }}
                    />
                  </Form.Item>
                </div> */}
                <SwitchField
                  form={form}
                  name="hostBusinessNic"
                  label={intl.formatMessage({
                    id: "vm.Migration.on.Failure",
                    defaultMessage: "Fail Over",
                  })}
                  labelTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.Migration.on.Failure.tooltip",
                        defaultMessage: `### Fail Over

If you enable failover, once the failover condition is met, virtual machines with HA enabled will be started on another host.`,
                      })}
                    </ReactMarkdown>
                  }
                />
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
                      className={`flex items-center gap-2 ${style.content}`}
                      key={idx}
                    >
                      <div className={`flex items-center ${style.textWrapper}`}>
                        <Text className={style.text}>{status.text}</Text>
                        {status?.tooltip && (
                          <InfoPopover
                            content={
                              <ReactMarkdown>{status?.tooltip}</ReactMarkdown>
                            }
                          />
                        )}
                      </div>
                      <Tag style={{ marginLeft: "5px" }} theme={status?.theme}>
                        {status.statusName}
                      </Tag>
                    </div>
                  ),
                )}
                <div className={style.divider} />
                {/* <div className="flex items-center gap-2">
                  <Text
                    value={intl.formatMessage({
                      id: 'IsMigration.with.Colon',
                      defaultMessage: '是否迁移 :'
                    })}
                  />
                  <Form.Item valuePropName="checked" name={'hostStorageState'} noStyle>
                    <Switch
                      onChange={val => {
                        const hostBusinessNic = form.getFieldValue('hostBusinessNic')

                        const _Fields = [
                          {
                            name: 'hostStorageState',
                            value: val
                          }
                        ]
                        if (!hostBusinessNic) {
                          _Fields.push({
                            name: 'hostBusinessNic_hostStorageState',
                            value: val
                          })
                        }

                        form.setFields(_Fields)
                      }}
                    />
                  </Form.Item>
                </div> */}
                <SwitchField
                  form={form}
                  name="hostStorageState"
                  label={intl.formatMessage({
                    id: "vm.Migration.on.Failure",
                    defaultMessage: "Fail Over",
                  })}
                  //           icon="info"
                  //           iconTooltip={
                  //             <ReactMarkdown>
                  //               {intl.formatMessage({
                  //                 id: 'vm.Migration.on.Failure.tooltip',
                  //                 defaultMessage: `### 故障时迁移虚拟机

                  // 启用后，若满足高可用故障迁移条件，开启高可用的虚拟机将迁移至其他主机 HA 启动。`
                  //               })}
                  //             </ReactMarkdown>
                  //           }
                  labelTooltip={intl.formatMessage({
                    id: "ha.migrate.hostStorageState.title",
                    defaultMessage:
                      "You cannot set the failover policy because the storage network is in a fault status.",
                  })}
                  disabled
                />
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
                      className={`flex items-center gap-2 ${style.content}`}
                      key={idx}
                    >
                      <div className={`flex items-center ${style.textWrapper}`}>
                        <Text className={style.text}>{status.text}</Text>
                        {status?.tooltip && (
                          <InfoPopover
                            content={
                              <ReactMarkdown>{status?.tooltip}</ReactMarkdown>
                            }
                          />
                        )}
                      </div>
                      <Tag style={{ marginLeft: "5px" }} theme={status?.theme}>
                        {status.statusName}
                      </Tag>
                    </div>
                  ),
                )}
                <div className={style.divider} />
                {/* <div className="flex items-center gap-2">
                  <Text
                    value={intl.formatMessage({
                      id: 'IsMigration.with.Colon',
                      defaultMessage: '是否迁移 :'
                    })}
                  />
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'ha.migrate.both.title',
                      defaultMessage:
                        '存储连接状态与业务网卡状态同时故障的迁移策略跟随任一状态故障时的迁移策略开启或关闭。若存储连接状态或业务网卡状态故障场景的迁移策略均为不迁移，则此处为不迁移。若其中一个故障场景的迁移策略为迁移，则此处为迁移。'
                    })}
                  >
                    <span>
                      <Form.Item
                        valuePropName="checked"
                        name={'hostBusinessNic_hostStorageState'}
                        noStyle
                      >
                        <Switch disabled />
                      </Form.Item>
                    </span>
                  </Tooltip>
                </div> */}
                <SwitchField
                  form={form}
                  name="hostBusinessNicHostStorageState"
                  label={intl.formatMessage({
                    id: "vm.Migration.on.Failure",
                    defaultMessage: "Fail Over",
                  })}
                  //           icon="info"
                  //           iconTooltip={
                  //             <ReactMarkdown>
                  //               {intl.formatMessage({
                  //                 id: 'vm.Migration.on.Failure.tooltip',
                  //                 defaultMessage: `### 故障时迁移虚拟机

                  // 启用后，若满足高可用故障迁移条件，开启高可用的虚拟机将迁移至其他主机 HA 启动。`
                  //               })}
                  //             </ReactMarkdown>
                  //           }
                  labelTooltip={intl.formatMessage({
                    id: "ha.migrate.both.title",
                    defaultMessage:
                      "The failover policy of this scenario follows the preceding two failover policies of this table.\nIf you set both the preceding two policies to No, then this failover policy is set to No. If you set either of the two to Yes, then this failover policy is set to Yes.",
                  })}
                  disabled
                />
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
                      className={`flex items-center gap-2 ${style.content}`}
                      key={idx}
                    >
                      <div className={`flex items-center ${style.textWrapper}`}>
                        <Text className={style.text}>{status.text}</Text>
                        {status?.tooltip && (
                          <InfoPopover
                            content={
                              <ReactMarkdown>{status?.tooltip}</ReactMarkdown>
                            }
                          />
                        )}
                      </div>
                      <Tag style={{ marginLeft: "5px" }} theme={status?.theme}>
                        {status.statusName}
                      </Tag>
                    </div>
                  ),
                )}
                <div className={style.divider} />
                {/* <div className="flex items-center gap-2">
                  <Text
                    value={intl.formatMessage({
                      id: 'IsMigration.with.Colon',
                      defaultMessage: '是否迁移 :'
                    })}
                  />
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'ha.migrate.manage.title',
                      defaultMessage: '管理网络状态故障时，不支持设置故障迁移策略。'
                    })}
                  >
                    <span>
                      <Form.Item valuePropName="checked" noStyle>
                        <Switch disabled defaultChecked={false} />
                      </Form.Item>
                    </span>
                  </Tooltip>
                </div> */}
                <Field
                  label={intl.formatMessage({
                    id: "vm.Migration.on.Failure",
                    defaultMessage: "Fail Over",
                  })}
                  //           icon="info"
                  //           iconTooltip={
                  //             <ReactMarkdown>
                  //               {intl.formatMessage({
                  //                 id: 'vm.Migration.on.Failure.tooltip',
                  //                 defaultMessage: `### 故障时迁移虚拟机

                  // 启用后，若满足高可用故障迁移条件，开启高可用的虚拟机将迁移至其他主机 HA 启动。`
                  //               })}
                  //             </ReactMarkdown>
                  //           }
                  tooltip={intl.formatMessage({
                    id: "ha.migrate.manage.title",
                    defaultMessage:
                      "If the management network is in Abnormal status, you cannot set this failover policy.",
                  })}
                >
                  <Switch checked={false} disabled />
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
          <FieldStack>
            <InputUnitField
              form={form}
              name="hostSelfFencerInterval"
              label={_.get(haConfigMap, [
                "ha.host.selfFencer.interval",
                "name",
              ])}
              labelTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.host.selfFencer.interval",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              suffix={
                <span style={{ marginLeft: 8 }}>
                  {intl.formatMessage({ id: "second", defaultMessage: " seconds" })}
                </span>
              }
            />

            <InputUnitField
              form={form}
              name="hostSelfFencerMaxAttempts"
              label={_.get(haConfigMap, [
                "ha.host.selfFencer.maxAttempts",
                "name",
              ])}
              labelTooltip={
                <ReactMarkdown>
                  {_.get(haConfigMap, [
                    "ha.host.selfFencer.maxAttempts",
                    "description",
                  ])}
                </ReactMarkdown>
              }
              required
              inputTooltip={intl.formatMessage({
                id: "ha.action.ha.host.selfFencer.maxAttempts.description",
                defaultMessage:
                  "If self-check fails more than the current setting times, the system will diagnose as a host exception.",
              })}
              suffix={
                <span style={{ marginLeft: 8 }}>
                  {intl.formatMessage({ id: "count.ci", defaultMessage: "times" })}
                </span>
              }
            />
          </FieldStack>
        </ZSVForm.Card>
      </Form>
    </DialogForm>
  );
};

export default ModifyMigrationStrategy;
