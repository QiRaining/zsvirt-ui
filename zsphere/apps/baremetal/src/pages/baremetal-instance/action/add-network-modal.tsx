import { Checkbox, RadioGroup } from "@zstack/design";
import { Input, Form, Select } from "@zstack/zsphere-components";
import { ModalSelect } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import { isEmpty, pick, omitBy, isUndefined } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import L3NetworkList from "zsv_resource/l3-network/list";

import type { IAllNics, IBondConfig, INetworkConfig } from "../type";
import { IAddNetWorkType, IDeviceType } from "../type";

import style from "./style.module.less";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

interface AddNetworkModalProps {
  addNetWorkType: IAddNetWorkType;
  allNics: IAllNics[];
  baremetalChassisUuids: string[];
  initialRecord: INetworkConfig;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onCancel: () => void;
  onOk: (network: any) => void;
  usedNicValues: string[];
  editingIndex: number;
}

const AddNetworkModal: React.FC<AddNetworkModalProps> = ({
  visible,
  setVisible,
  onCancel,
  onOk,
  allNics,
  initialRecord,
  baremetalChassisUuids,
  addNetWorkType,
  usedNicValues,
  editingIndex,
}) => {
  const intl = useIntl();
  const { isRequired, ipValidator } = useValidator(intl);
  const [form] = Form.useForm();

  const l3NetworkDefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "serviceProvider.networkServiceTypes",
          op: Op.in,
          values: ["DHCP"],
        },
        {
          key: "defaultFilter",
          value: "NOT_DEFAULT",
        },
        {
          key: "l2Network.cluster.uuid",
          op: Op.in,
          values: baremetalChassisUuids,
        },
      ],
    };
  }, [baremetalChassisUuids]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      return;
    }

    if (isEmpty(initialRecord)) {
      form.setFieldsValue({ deviceType: IDeviceType.Nic });
      return;
    }

    if (!initialRecord) {
      return;
    }

    const isNic = initialRecord.type === IDeviceType.Nic;
    const configPath = isNic ? "nicConfig" : "bondConfig";

    const values = {
      deviceType: initialRecord.type,
      ...pick(initialRecord[configPath], ["l3Network", "setStaticIp", "ip"]),
      ...(isNic
        ? {}
        : {
            nicBondName: (initialRecord[configPath] as IBondConfig)?.name,
            nicBondMode: (initialRecord[configPath] as IBondConfig)?.mode,
          }),
      nic: initialRecord[configPath]?.nic,
      bondNic: initialRecord[configPath]?.nic,
      appointIp: initialRecord[configPath]?.setStaticIp,
      ipv4: initialRecord[configPath]?.ip,
    };

    form.setFieldsValue(omitBy(values, isUndefined));
  }, [visible, form, initialRecord]);

  const filteredNics = useMemo(() => {
    if (!usedNicValues || usedNicValues.length === 0) {
      return allNics;
    }

    const currentNics: any = [];
    if (editingIndex !== -1 && initialRecord) {
      if (initialRecord.type === IDeviceType.Nic) {
        currentNics.push(initialRecord?.nicConfig?.nic);
      } else if (initialRecord.type === IDeviceType.NicBond) {
        currentNics.push(
          ...((initialRecord?.bondConfig?.nic as string[]) || []),
        );
      }
    }

    return allNics.filter((nic) => {
      if (currentNics.includes(nic.value)) {
        return true;
      }

      return !usedNicValues.includes(nic.value);
    });
  }, [allNics, usedNicValues, initialRecord, editingIndex]);

  const handleSubmit = (values: any) => {
    const isNic = values.deviceType === IDeviceType.Nic;
    const configType = isNic ? "nicConfig" : "bondConfig";

    const commonFields = {
      l3Network: values.l3Network,
      setStaticIp: values.appointIp,
      ip: values.ipv4 || "",
    };

    const specificFields = isNic
      ? { nic: values.nic }
      : {
          name: values.nicBondName,
          mode: values.nicBondMode,
          nic: values.bondNic,
        };

    const networkConfig = {
      type: values.deviceType,
      [configType]: {
        ...commonFields,
        ...specificFields,
      },
    };
    onOk(networkConfig);
  };

  const bondModelOptions = useMemo(
    () => [
      {
        value: 1,
        name: intl.formatMessage({
          id: "baremetalInstanceBondModel1",
          defaultMessage: "Mode 1 (active-backup)",
        }),
      },
      {
        value: 4,
        name: intl.formatMessage({
          id: "baremetalInstanceBondModel4",
          defaultMessage: "Mode 4 (LACP)",
        }),
      },
    ],
    [intl],
  );

  return (
    <DialogForm
      form={form}
      title={intl.formatMessage({
        id: "add.network.config",
        defaultMessage: "Add Network Configuration",
      })}
      visible={visible}
      setVisible={setVisible}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form}>
        <Form.Item
          name="deviceType"
          label={intl.formatMessage({
            id: "device.type",
            defaultMessage: "Device Type",
          })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "baremetalInstance.network.device.type.info",
                defaultMessage: "### Device Type\n\n- NIC: Configures corresponding business networks for each NIC.\n- NIC Bond: Creates NIC bonds, and then configures corresponding networks for aggregation NICs.",
              })}
            </ReactMarkdown>
          }
        >
          <RadioGroup
            options={[
              {
                value: IDeviceType.Nic,
                label: intl.formatMessage({
                  id: "nic",
                  defaultMessage: "NIC",
                }),
              },
              {
                value: IDeviceType.NicBond,
                label: intl.formatMessage({
                  id: "nic.bond",
                  defaultMessage: "NIC Bond",
                }),
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => {
            return (
              prev.deviceType !== curr.deviceType ||
              prev.baremetalChassis !== curr.baremetalChassis
            );
          }}
        >
          {({ getFieldValue }) => {
            switch (getFieldValue("deviceType")) {
              case IDeviceType.Nic:
                return (
                  <>
                    <Form.Item
                      name="nic"
                      label={intl.formatMessage({
                        id: "nic",
                        defaultMessage: "NIC",
                      })}
                      required
                      rules={[isRequired(IIsRequiredType.select)]}
                      icon="info"
                      iconTooltip={
                        <ReactMarkdown>
                          {intl.formatMessage({
                            id: "baremetalInstance.network.nic.info",
                            defaultMessage: "### NIC\n\n1. To configure business networks, ensure that bare metal instances must have available NICs.\n2. If Identical Configurations is used, the NIC count and NIC names of bare metal instances must be identical.",
                          })}
                        </ReactMarkdown>
                      }
                    >
                      <Select width="l" options={filteredNics} />
                    </Form.Item>
                    <Form.Item
                      name="l3Network"
                      label={intl.formatMessage({
                        id: "l3.network",
                        defaultMessage: "Distributed Port Group",
                      })}
                      required
                      rules={[isRequired(IIsRequiredType.select)]}
                    >
                      <ModalSelect
                        title={intl.formatMessage({
                          id: "virtualization.create.instance.hardware.network.card.select.port.group",
                          defaultMessage: "Select Distributed Port Group",
                        })}
                        className={style["width-320"]}
                        selectType="radio"
                      >
                        <L3NetworkList
                          defaultQuery={l3NetworkDefaultQuery}
                          view="select.virtualization"
                        />
                      </ModalSelect>
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) => {
                        return prev.l3Network !== curr.l3Network;
                      }}
                    >
                      {() => {
                        return getFieldValue("l3Network") &&
                          addNetWorkType === IAddNetWorkType.Single ? (
                          <>
                            <Form.Item
                              label={intl.formatMessage({
                                id: "appoint.ip",
                                defaultMessage: "Assign IP",
                              })}
                              name="appointIp"
                              valuePropName="checked"
                            >
                              <FormCheckbox
                                label={intl.formatMessage({
                                  id: "manually.specify.iP.address",
                                  defaultMessage: "Assign IP Address Manually",
                                })}
                              />
                            </Form.Item>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prev, curr) => {
                                return prev.appointIp !== curr.appointIp;
                              }}
                            >
                              {() => {
                                return form?.getFieldValue("appointIp") ? (
                                  <Form.Item
                                    label={intl.formatMessage({
                                      id: "virtualization.create.instance.hardware.network.card.netcard.ipv4",
                                      defaultMessage: "IPv4 Address",
                                    })}
                                    name="ipv4"
                                    required
                                    rules={[
                                      isRequired(IIsRequiredType.input),
                                      ipValidator(),
                                    ]}
                                    validateTrigger={["onChange", "onBlur"]}
                                  >
                                    <Input className="width-320" />
                                  </Form.Item>
                                ) : null;
                              }}
                            </Form.Item>
                          </>
                        ) : null;
                      }}
                    </Form.Item>
                  </>
                );

              case IDeviceType.NicBond:
                return (
                  <>
                    <Form.Item
                      name="nicBondName"
                      label={intl.formatMessage({
                        id: "nicBondName",
                        defaultMessage: "NIC Bond Name",
                      })}
                      required
                      rules={[isRequired(IIsRequiredType.input)]}
                    >
                      <Input className="width-320" />
                    </Form.Item>
                    <Form.Item
                      name="nicBondMode"
                      label={intl.formatMessage({
                        id: "nicBondMode",
                        defaultMessage: "NIC Bond Type",
                      })}
                      icon="info"
                      iconTooltip={
                        <ReactMarkdown>
                          {intl.formatMessage({
                            id: "baremetalInstance.network.nic.bond.mode.tooltip",
                            defaultMessage: "### NIC Bond Type\n\n1. Mode 1 (active-backup): Prevents confusion for switches.\n2. Mode 4 (LACP): Creates aggregation port groups that require switches on the access layer of bare metal chassis.",
                          })}
                        </ReactMarkdown>
                      }
                    >
                      <Select width="l">
                        {bondModelOptions.map((it) => (
                          <Select.Option value={it?.value} key={it?.value}>
                            {it?.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="bondNic"
                      label={intl.formatMessage({
                        id: "nic",
                        defaultMessage: "NIC",
                      })}
                      required
                      rules={[isRequired(IIsRequiredType.select)]}
                    >
                      <Select
                        width="l"
                        mode="multiple"
                        options={filteredNics}
                      />
                    </Form.Item>
                    <Form.Item
                      name="l3Network"
                      label={intl.formatMessage({
                        id: "l3.network",
                        defaultMessage: "Distributed Port Group",
                      })}
                      required
                      rules={[isRequired(IIsRequiredType.select)]}
                    >
                      <ModalSelect
                        title={intl.formatMessage({
                          id: "virtualization.create.instance.hardware.network.card.select.port.group",
                          defaultMessage: "Select Distributed Port Group",
                        })}
                        className={style["width-320"]}
                      >
                        <L3NetworkList
                          view="select.virtualization"
                          defaultQuery={l3NetworkDefaultQuery}
                        />
                      </ModalSelect>
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) => {
                        return prev.l3Network !== curr.l3Network;
                      }}
                    >
                      {() => {
                        return getFieldValue("l3Network") &&
                          addNetWorkType === IAddNetWorkType.Single ? (
                          <>
                            <Form.Item
                              label={intl.formatMessage({
                                id: "appoint.ip",
                                defaultMessage: "Assign IP",
                              })}
                              name="appointIp"
                              valuePropName="checked"
                            >
                              <FormCheckbox
                                label={intl.formatMessage({
                                  id: "manually.specify.iP.address",
                                  defaultMessage: "Assign IP Address Manually",
                                })}
                              />
                            </Form.Item>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prev, curr) => {
                                return prev.appointIp !== curr.appointIp;
                              }}
                            >
                              {() => {
                                return (
                                  form?.getFieldValue("appointIp") && (
                                    <Form.Item
                                      label={intl.formatMessage({
                                        id: "virtualization.create.instance.hardware.network.card.netcard.ipv4",
                                        defaultMessage: "IPv4 Address",
                                      })}
                                      name="ipv4"
                                      validateTrigger={["onChange", "onBlur"]}
                                    >
                                      <Input className="width-320" />
                                    </Form.Item>
                                  )
                                );
                              }}
                            </Form.Item>
                          </>
                        ) : null;
                      }}
                    </Form.Item>
                  </>
                );

              default:
                return <></>;
            }
          }}
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default AddNetworkModal;
