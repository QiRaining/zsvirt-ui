import { Input } from "@zstack/design";
import { Form, Select, InputDebounce } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { ResourceQueryType } from "@zstack/zsphere-types";
import type { FormInstance } from "antd/es/form";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import SelectPhysicalModal from "zsv_resource/l2-network/create/nic-config/select-physical-modal";
import { useShallow } from "zustand/react/shallow";

import { useWizardStore } from "../../layouts/wizard-container/wizard-container";
import { BondConfigType } from "./type";

import style from "./style.module.less";

const { Item } = Form;

export const BondNameItem = ({
  required,
  width,
}: {
  required?: boolean;
  width?: number;
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  return (
    <Item
      name="bondingName"
      noStyle
      rules={[
        required ? isRequired() : {},
        {
          validator: (_rules, value) => {
            if (value && !value.match("^(?![0-9])[a-zA-Z0-9_-]{1,10}$")) {
              return Promise.reject(
                new Error(
                  intl.formatMessage({
                    id: "nic.modal.field.bondingName.validator",
                    defaultMessage:
                      "The name must be 1-10 characters in length and contains only English letters, digits, hyphens (-), and underscores (_).",
                  }),
                ),
              );
            }
            return Promise.resolve();
          },
        },
      ]}
      validateFirst
    >
      <Input style={{ width: width ?? 160 }} />
    </Item>
  );
};

interface IL2NetworkFormProps {
  form: FormInstance;
}

export const L2NetworkForm: FC<IL2NetworkFormProps> = ({ form }) => {
  const intl = useIntl();

  const { commonNameRules, validatorUniqName } = useValidator(intl);

  const { zoneName, clusterUuid, clusterName } = useWizardStore(
    useShallow((state) => ({
      zoneName: state.zoneName,
      clusterUuid: state.clusterUuid,
      clusterName: state.clusterName,
    })),
  );

  const onChangeBondConfigType = (value: BondConfigType) => {
    form.resetFields([
      "bondName",
      "mode",
      "xmitHashPolicy",
      "physicalNicList",
      "physicalNicnNameList",
      "bond",
      "bondUuid",
    ]);
    form.setFieldsValue({
      bondConfigType: value,
    });
  };

  return (
    <div className={style.l2}>
      <Item
        noStyle
        shouldUpdate={(prev, current) =>
          prev.l2NetworkOption !== current.l2NetworkOption
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("l2NetworkOption") === "create" && (
            <div>
              <div className={style.card}>
                <Item
                  label={intl.formatMessage({
                    id: "basic.info",
                    defaultMessage: "Basic Info",
                  })}
                />
                <Item
                  label={intl.formatMessage({
                    id: "name",
                    defaultMessage: "Name",
                  })}
                  name="name"
                  labelWidth={148}
                  rules={[
                    ...commonNameRules,
                    validatorUniqName(
                      ResourceQueryType.L2Network,
                      undefined,
                      intl.formatMessage({
                        id: "l2Network.field.name.validator.duplicate",
                        defaultMessage: "This name is already in use. Enter a different name.",
                      }),
                      true,
                    ),
                  ]}
                >
                  <InputDebounce width={400} className={style.baseFormItem} />
                </Item>
                <Item
                  name="zone"
                  label={intl.formatMessage({
                    id: "virtualization.zone",
                    defaultMessage: "Data Center",
                  })}
                  labelWidth={148}
                >
                  {zoneName}
                </Item>
                <Item
                  name="cluster"
                  label={intl.formatMessage({
                    id: "virtualization.cluster",
                    defaultMessage: "Cluster",
                  })}
                  labelWidth={148}
                >
                  {clusterName}
                </Item>
              </div>
              <div
                className={style.card}
                style={{ marginBottom: 20, marginTop: 8 }}
              >
                <Item
                  label={intl.formatMessage({
                    id: "network.config",
                    defaultMessage: "Network Configuration",
                  })}
                />
                <Form.Item
                  name="bondConfigType"
                  label={intl.formatMessage({
                    id: "add.method",
                    defaultMessage: "Addition Method",
                  })}
                  initialValue={BondConfigType.Group}
                  labelWidth={148}
                >
                  <Select
                    width={320}
                    options={[
                      {
                        label: intl.formatMessage({
                          id: "bondConfig.type.by.new",
                          defaultMessage: "New Bond",
                        }),
                        value: BondConfigType.Group,
                      },
                      {
                        label: intl.formatMessage({
                          id: "bondConfig.type.by.exited.bond",
                          defaultMessage: "Specify the Same Port",
                        }),
                        value: BondConfigType.Exited,
                      },
                    ]}
                    onChange={onChangeBondConfigType}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) =>
                    prev.bondConfigType !== cur.bondConfigType ||
                    prev.clusterUuids !== cur.clusterUuids
                  }
                  labelWidth={148}
                >
                  {({ getFieldValue }) => {
                    const bondConfigType = getFieldValue("bondConfigType");
                    const clusterUuids = [clusterUuid];

                    if (bondConfigType !== BondConfigType.Exited) {
                      return (
                        <>
                          <Form.Item
                            name="bondName"
                            required
                            label={intl.formatMessage({
                              id: "up.bond.name",
                              defaultMessage: "Uplink Name",
                            })}
                            labelWidth={148}
                          >
                            <BondNameItem required={true} width={320} />
                          </Form.Item>
                          <Form.Item
                            label={intl.formatMessage({
                              id: "bond.mode.in.host",
                              defaultMessage: "Bond Mode",
                            })}
                            labelWidth={148}
                            name="mode"
                            initialValue="802.3ad"
                            icon="info"
                            iconTooltip={
                              <ReactMarkdown>
                                {intl.formatMessage({
                                  id: "create.vswitch.bond.field.bond.mode.tooltip",
                                  defaultMessage: `### Bond Mode

1. LACP Mode:

    - Supports bonding 1 to 8 physical ports. Bonding at least 2 ports is recommended. Bonded ports share the same speed and duplex settings. Network traffic is distributed evenly across the ports for load balancing.
    - This mode uses a hash algorithm to determine the egress port for network traffic.

2. Active-Backup Mode:

    - Supports bonding 1 to 8 physical ports. Bonding 2 ports is recommended.
    - After bonding, one port acts as the active port, while the others serve as backup ports. All network traffic is handled by the active port. If the active port fails, traffic automatically fails over to a backup port to maintain service continuity.`,
                                })}
                              </ReactMarkdown>
                            }
                          >
                            <Select
                              width={320}
                              options={[
                                {
                                  label: intl.formatMessage({
                                    id: "link.aggregation.mode",
                                    defaultMessage: "LACP (mode 4)",
                                  }),
                                  value: "802.3ad",
                                },
                                {
                                  label: intl.formatMessage({
                                    id: "master.backup.mode",
                                    defaultMessage: "Active-Backup (mode1)",
                                  }),
                                  value: "active-backup",
                                },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item
                            noStyle
                            shouldUpdate={(pre, cur) => pre.mode !== cur.mode}
                          >
                            {({ getFieldValue }: any) => {
                              const mode = getFieldValue("mode");
                              const isMode1 = mode === "active-backup";

                              return (
                                <>
                                  {!isMode1 && (
                                    <Form.Item
                                      name="xmitHashPolicy"
                                      label={intl.formatMessage({
                                        id: "HashPolicy",
                                        defaultMessage: "Hash Policy",
                                      })}
                                      labelWidth={148}
                                      icon="info"
                                      iconTooltip={
                                        <ReactMarkdown>
                                          {intl.formatMessage({
                                            id: "bond.field.HashPolicy.tooltip",
                                            defaultMessage: `### Hash Policy
A bond of LACP mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.

1. layer2+3: Picks out a NIC port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
2. layer3+4: Picks out a NIC port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
3. layer2: Picks out a NIC port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
                                          })}
                                        </ReactMarkdown>
                                      }
                                      initialValue="layer2+3"
                                    >
                                      <Select
                                        width={320}
                                        options={[
                                          "layer2+3",
                                          "layer3+4",
                                          "layer2",
                                        ].map((value) => ({
                                          value,
                                          label: value,
                                        }))}
                                      />
                                    </Form.Item>
                                  )}
                                  {bondConfigType === BondConfigType.Every ? (
                                    <SelectPhysicalModal.SelectPhysicalNicEvery
                                      limit={8}
                                      clusterUuids={clusterUuids}
                                      form={form}
                                    />
                                  ) : (
                                    <SelectPhysicalModal.SelectPhysicalNicMulti
                                      limit={8}
                                      clusterUuids={clusterUuids}
                                      form={form}
                                      selectWidth={320}
                                      labelWidth={148}
                                      checkable
                                      mode="multiple"
                                    />
                                  )}
                                </>
                              );
                            }}
                          </Form.Item>
                        </>
                      );
                    }
                    return (
                      <SelectPhysicalModal.SelectExist
                        clusterUuids={clusterUuids}
                        form={form}
                        labelWidth={148}
                        selectWidth={320}
                      />
                    );
                  }}
                </Form.Item>
              </div>
            </div>
          )
        }
      </Item>
    </div>
  );
};
