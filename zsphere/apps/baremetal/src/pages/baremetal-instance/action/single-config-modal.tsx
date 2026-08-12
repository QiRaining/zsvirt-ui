import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input, Form, Tag } from "@zstack/zsphere-components";
import { ZSVForm, ItemList } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { isEmpty as _isEmpty, map as _map, pick as _pick } from "lodash-es";
import React, { useCallback, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import type {
  IAllNics,
  IInstanceConfig,
  INetworkConfig,
  IBondConfig,
} from "../type";
import { IDeviceType, IAddNetWorkType } from "../type";
import { getConfigCardTitle } from "../utils";
import AddNetworkModal from "./add-network-modal";

import style from "./style.module.less";

const { Card } = ZSVForm;

const tagRightMarginStyle: React.CSSProperties = { marginRight: 4 };
const linkButtonStyle: React.CSSProperties = {
  padding: 0,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onCancel: () => void;
  onSave: (config: any) => void;
  allNics: IAllNics[];
  instanceConfig: IInstanceConfig;
  baremetalChassisUuids: string[];
}

const SingleConfigModal: React.FC<IProps> = ({
  visible,
  setVisible,
  allNics,
  onCancel,
  onSave,
  instanceConfig,
  baremetalChassisUuids,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { isRequired } = useValidator(intl);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [addNetworkModalVisible, setAddNetworkModalVisible] =
    useState<boolean>(false);
  const [usedNicValues, setUsedNicValues] = useState<string[]>([]);
  const [networkConfigs, setNetworkConfigs] = useState<INetworkConfig[]>(
    instanceConfig.networkConfigs || [],
  );

  useEffect(() => {
    if (!instanceConfig) {
      return;
    }

    const currentUsername = form.getFieldValue("username");
    const currentPassword = form.getFieldValue("password");

    const usernameValue =
      typeof currentUsername === "undefined"
        ? instanceConfig?.username
        : currentUsername;

    const passwordValue =
      typeof currentPassword === "undefined"
        ? instanceConfig?.password
        : currentPassword;

    form.setFieldsValue({
      distribution: instanceConfig?.distribution,
      username: usernameValue,
      password: passwordValue,
      networkDevices: instanceConfig.networkConfigs,
    });

    setNetworkConfigs(instanceConfig.networkConfigs || []);

    const initialUsedNicValues: string[] = [];
    (instanceConfig.networkConfigs || []).forEach((config) => {
      if (config.type === IDeviceType.Nic) {
        if (config.nicConfig?.nic) {
          initialUsedNicValues.push(config.nicConfig.nic);
        }
      } else if (config.type === IDeviceType.NicBond) {
        (config?.bondConfig as IBondConfig)?.nic.forEach((nic: string) => {
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
      usedNicValues,
    });
  };

  const handleAddNetwork = useCallback(
    (values: any) => {
      const updateUsedNics = (
        config: any,
        operation: "add" | "remove",
      ): string[] => {
        const nicsToProcess: string[] = [];
        if (config.type === IDeviceType.Nic) {
          const nicValue = config.nicConfig?.nic;
          if (nicValue) {
            nicsToProcess.push(nicValue);
          }
        } else if (config.type === IDeviceType.NicBond) {
          nicsToProcess.push(...(config.bondConfig?.nic || []));
        }

        return operation === "add"
          ? [...usedNicValues, ...nicsToProcess]
          : usedNicValues.filter((value) => !nicsToProcess.includes(value));
      };

      let newNetworkConfigs: INetworkConfig[];
      let newUsedNicValues: string[];

      if (editingIndex !== -1) {
        const oldConfig = networkConfigs[editingIndex];
        newUsedNicValues = updateUsedNics(oldConfig, "remove");
        newUsedNicValues = updateUsedNics(values, "add").filter(
          (value, index, array) =>
            array.indexOf(value) === index || !newUsedNicValues.includes(value),
        );

        newNetworkConfigs = networkConfigs.map((config, index) =>
          index === editingIndex ? values : config,
        );
      } else {
        newUsedNicValues = updateUsedNics(values, "add");
        newNetworkConfigs = [...networkConfigs, values];
      }

      const uniqueUsedNicValues = [...new Set(newUsedNicValues)];

      setNetworkConfigs(newNetworkConfigs);
      setUsedNicValues(uniqueUsedNicValues);
      form.setFieldValue("networkDevices", newNetworkConfigs);
      setEditingIndex(-1);
    },
    [networkConfigs, usedNicValues, editingIndex, form],
  );

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
        title={intl.formatMessage({
          id: "single.config",
          defaultMessage: "Separate Configurations",
        })}
        visible={visible}
        widthClassName="w-200"
        setVisible={setVisible}
        onCancel={onCancel}
        onOk={handleSubmit}
        form={form}
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
                          validator: () => {
                            if (networkDevices?.length < 1) {
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
                                                  newUsedNicValues.splice(
                                                    newUsedNicValues.indexOf(
                                                      nicValue,
                                                    ),
                                                    1,
                                                  );
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
          allNics={allNics}
          addNetWorkType={IAddNetWorkType.Single}
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

export default SingleConfigModal;
