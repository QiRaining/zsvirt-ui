import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input, Form, Tag } from "@zstack/zsphere-components";
import { ZSVForm, ItemList } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { isEmpty as _isEmpty, pick as _pick, map as _map } from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import type {
  IAllNics,
  IBondConfig,
  IInstanceConfig,
  INetworkConfig,
  INicConfig,
} from "../type";
import { IAddNetWorkType, IDeviceType } from "../type";
import { getConfigCardTitle } from "../utils";
import AddNetworkModal from "./add-network-modal";

import style from "./style.module.less";

const { Card } = ZSVForm;

const tagRightMarginStyle: React.CSSProperties = { marginRight: 4 };
const linkButtonStyle: React.CSSProperties = { padding: 0 };

interface IProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (config: any) => void;
  setVisible: (visible: boolean) => void;
  instanceConfig: IInstanceConfig;
  allNics: IAllNics[];
  baremetalChassisUuids: string[];
}

// 批量配置弹窗
const BatchConfigModal: React.FC<IProps> = ({
  visible,
  setVisible,
  onCancel,
  onSave,
  instanceConfig,
  allNics,
  baremetalChassisUuids,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { isRequired } = useValidator(intl);
  const [addNetworkModalVisible, setAddNetworkModalVisible] =
    useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [networkConfigs, setNetworkConfigs] = useState<INetworkConfig[]>([]);
  const [usedNicValues, setUsedNicValues] = useState<string[]>([]);

  useEffect(() => {
    if (!instanceConfig) {
      return;
    }

    form.setFieldsValue({
      ..._pick(instanceConfig, ["distribution"]),
      username: "root",
    });

    const initialConfigs = instanceConfig.networkConfigs || [];
    setNetworkConfigs(initialConfigs);

    const initialUsedNicValues: string[] = [];
    initialConfigs.forEach((config) => {
      if (config.type === IDeviceType.Nic) {
        initialUsedNicValues.push((config.nicConfig as INicConfig).nic);
      } else if (config.type === IDeviceType.NicBond) {
        (config.bondConfig as IBondConfig).nic.forEach((nic) => {
          initialUsedNicValues.push(nic);
        });
      }
    });
    setUsedNicValues(initialUsedNicValues);
  }, [instanceConfig, form]);

  const handleSubmit = (values: any) => {
    onSave({
      ..._pick(values, ["username", "password"]),
      networkConfigs,
      // 修改：返回已使用的网卡值
      usedNicValues,
    });
  };

  const handleAddNetwork = (values: any) => {
    let newNetworkConfigs: INetworkConfig[];
    let newUsedNicValues = [...usedNicValues];

    // 修改：处理网卡值
    const processNics = (config: any, isRemove = false) => {
      if (config.type === IDeviceType.Nic) {
        const nicValue = config.nicConfig.nic;
        if (isRemove) {
          newUsedNicValues = newUsedNicValues.filter((v) => v !== nicValue);
        } else {
          newUsedNicValues.push(nicValue);
        }
      } else {
        config.bondConfig.nic.forEach((nicValue: string) => {
          if (isRemove) {
            newUsedNicValues = newUsedNicValues.filter((v) => v !== nicValue);
          } else {
            newUsedNicValues.push(nicValue);
          }
        });
      }
    };

    if (editingIndex !== -1) {
      processNics(networkConfigs[editingIndex], true);

      newNetworkConfigs = [...networkConfigs];
      newNetworkConfigs[editingIndex] = values;

      processNics(values);
    } else {
      newNetworkConfigs = [...networkConfigs, values];

      processNics(values);
    }

    setNetworkConfigs(newNetworkConfigs);
    setUsedNicValues([...new Set(newUsedNicValues)]); // 去重

    form.setFieldValue("networkDevices", newNetworkConfigs);

    setEditingIndex(-1);
  };

  const getNic = (nicConfig: any) => {
    let nics = [];

    if (nicConfig && nicConfig.nic) {
      const nicValue = nicConfig.nic;
      try {
        if (typeof nicValue === "string") {
          const parsed = JSON.parse(nicValue);
          nics = Array.isArray(parsed) ? parsed : [parsed];
        } else if (Array.isArray(nicValue)) {
          nics = nicValue?.map((item) => JSON.parse(item));
        }
      } catch {
        nics = [];
      }
    }

    return (
      <ItemList
        className={style.itemList}
        ellipsis
        toggle
        value={_map(nics, (item, index) => (
          <Tag key={item?.mac ?? `nic-${index}`} style={tagRightMarginStyle}>
            {item?.name}
          </Tag>
        ))}
      />
    );
  };

  return (
    <>
      <DialogForm
        form={form}
        widthClassName="w-200"
        title={intl.formatMessage({
          id: "batch.config",
          defaultMessage: "Batch Configuration",
        })}
        visible={visible}
        setVisible={setVisible}
        onCancel={onCancel}
        onOk={handleSubmit}
      >
        <Form form={form}>
          <Card title={getConfigCardTitle(intl, "systemConfig")}>
            <Form.Item
              label={intl.formatMessage({
                id: "os.type",
                defaultMessage: "Operating System",
              })}
            >
              <Text>{instanceConfig?.distribution || "-"}</Text>
            </Form.Item>

            <Form.Item
              name="username"
              label={intl.formatMessage({
                id: "username",
                defaultMessage: "Username",
              })}
              required
              rules={[isRequired(IIsRequiredType.input)]}
            >
              <Input className={style["width-400"]} />
            </Form.Item>

            <Form.Item
              name="password"
              label={intl.formatMessage({
                id: "password",
                defaultMessage: "Password",
              })}
              required
              rules={[isRequired(IIsRequiredType.input)]}
            >
              <Input.Password className={style["width-400"]} />
            </Form.Item>
          </Card>
          <Card title={getConfigCardTitle(intl, "networkConfig")}>
            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) =>
                prev.networkDevices !== curr.networkDevices
              }
            >
              {({ getFieldValue }) => {
                const networkDevices = form.getFieldValue("networkDevices");
                if (_isEmpty(networkDevices)) {
                  return (
                    <Form.Item
                      label={intl.formatMessage({
                        id: "network.device",
                        defaultMessage: "Network Device",
                      })}
                      name="networkDevices"
                      required
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value || value.length < 1) {
                              return Promise.reject(
                                intl.formatMessage({
                                  id: "baremetal.field.networkDevices.validator.required",
                                  defaultMessage: "Select a network device.",
                                }),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Button
                        variant="link"
                        style={linkButtonStyle}
                        onClick={() => setAddNetworkModalVisible(true)}
                        icon={<Icon type="plus" />}
                      >
                        {intl.formatMessage({
                          id: "add.network.config",
                          defaultMessage: "Add Network Configuration",
                        })}
                      </Button>
                    </Form.Item>
                  );
                }
                return (
                  <Form.Item
                    label={intl.formatMessage({
                      id: "network.device",
                      defaultMessage: "Network Device",
                    })}
                    className={style.networkDevice}
                    description={
                      <div
                        className={style.addBtn}
                        onClick={() => {
                          setAddNetworkModalVisible(true);
                        }}
                      >
                        <Icon type="plus" />
                        <span>
                          {intl.formatMessage({
                            id: "add.network.config",
                            defaultMessage: "Add Network Configuration",
                          })}
                        </span>
                      </div>
                    }
                  >
                    <>
                      <div className={`flex gap-[24px] ${style.header}`}>
                        <div style={{ flex: "165px" }}>
                          {intl.formatMessage({
                            id: "device.type",
                            defaultMessage: "Device Type",
                          })}
                        </div>
                        <div style={{ flex: "233px" }}>
                          {intl.formatMessage({
                            id: "nic",
                            defaultMessage: "NIC",
                          })}
                        </div>
                        <div style={{ flex: "68px" }}>
                          {intl.formatMessage({
                            id: "action",
                            defaultMessage: "Actions",
                          })}
                        </div>
                      </div>
                      <Form.List name="networkDevices">
                        {(fields, { remove }) => {
                          return (
                            <div className={style.content}>
                              {fields?.map((field, index) => {
                                const nicConfig = getFieldValue([
                                  "networkDevices",
                                  index,
                                  "nicConfig",
                                ]);
                                const bondConfig = getFieldValue([
                                  "networkDevices",
                                  index,
                                  "bondConfig",
                                ]);
                                const isBondNic =
                                  getFieldValue([
                                    "networkDevices",
                                    index,
                                    "type",
                                  ]) === IDeviceType.NicBond;
                                return (
                                  <div className={style.item} key={field.key}>
                                    <div className="flex gap-[24px]">
                                      <div style={{ flex: "165px" }}>
                                        {isBondNic
                                          ? intl.formatMessage({
                                              id: "nicBond",
                                              defaultMessage: "NIC Bond",
                                            })
                                          : intl.formatMessage({
                                              id: "nic",
                                              defaultMessage: "NIC",
                                            })}
                                      </div>
                                      <div style={{ flex: "233px" }}>
                                        {getNic(
                                          isBondNic ? bondConfig : nicConfig,
                                        )}
                                      </div>
                                      <div style={{ flex: "68px" }}>
                                        <div className={style.action}>
                                          <span
                                            onClick={() => {
                                              setNetworkConfigs([
                                                getFieldValue([
                                                  "networkDevices",
                                                  index,
                                                ]),
                                              ]);
                                              setAddNetworkModalVisible(true);
                                              setEditingIndex(index);
                                            }}
                                          >
                                            <Icon type="edit" />
                                          </span>
                                          <span
                                            onClick={() => {
                                              // 获取要删除的配置
                                              const configToRemove =
                                                getFieldValue([
                                                  "networkDevices",
                                                  index,
                                                ]);

                                              // 释放该配置占用的网卡
                                              const newUsedNicValues = [
                                                ...usedNicValues,
                                              ];

                                              if (
                                                configToRemove.type ===
                                                IDeviceType.Nic
                                              ) {
                                                const nicValue =
                                                  configToRemove.nicConfig?.nic;
                                                if (nicValue) {
                                                  const index =
                                                    newUsedNicValues.indexOf(
                                                      nicValue,
                                                    );
                                                  if (index !== -1) {
                                                    newUsedNicValues.splice(
                                                      index,
                                                      1,
                                                    );
                                                  }
                                                }
                                              } else if (
                                                configToRemove.type ===
                                                IDeviceType.NicBond
                                              ) {
                                                configToRemove.bondConfig.nic.forEach(
                                                  (nicValue: string) => {
                                                    const _index =
                                                      newUsedNicValues.indexOf(
                                                        nicValue,
                                                      );
                                                    if (_index !== -1) {
                                                      newUsedNicValues.splice(
                                                        _index,
                                                        1,
                                                      );
                                                    }
                                                  },
                                                );
                                              }

                                              setUsedNicValues(
                                                newUsedNicValues,
                                              );

                                              // 从表单中移除该项
                                              remove(index);

                                              // 更新网络配置状态
                                              const newNetworkConfigs = [
                                                ...networkConfigs,
                                              ];
                                              newNetworkConfigs.splice(
                                                index,
                                                1,
                                              );
                                              setNetworkConfigs(
                                                newNetworkConfigs,
                                              );
                                            }}
                                          >
                                            <Icon type="trash" />
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }}
                      </Form.List>
                    </>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Card>
        </Form>
      </DialogForm>

      {addNetworkModalVisible && (
        <AddNetworkModal
          addNetWorkType={IAddNetWorkType.Batch}
          allNics={allNics}
          baremetalChassisUuids={baremetalChassisUuids}
          initialRecord={networkConfigs[editingIndex]}
          setVisible={setAddNetworkModalVisible}
          visible={addNetworkModalVisible}
          onCancel={() => {
            setAddNetworkModalVisible(false);
            setEditingIndex(-1);
          }}
          onOk={handleAddNetwork}
          usedNicValues={usedNicValues}
          editingIndex={editingIndex}
        />
      )}
    </>
  );
};

export default BatchConfigModal;
