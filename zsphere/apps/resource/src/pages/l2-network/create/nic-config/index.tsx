import { BondNameItem } from "@zstack/virtualization-resource/src/pages/bond/action/create";
import { Form, Select } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import SelectPhysicalModal from "./select-physical-modal";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  form: any;
}

export enum BondConfigType {
  Every,
  Group,
  Exited,
}

export const useBondConfigType = () => {
  const intl = useIntl();
  return [
    {
      label: intl.formatMessage({
        id: "bondConfig.type.host.by.host",
        defaultMessage: "Add Individually",
      }),
      value: BondConfigType.Every,
    },
    {
      label: intl.formatMessage({
        id: "bondConfig.type.by.group",
        defaultMessage: "Batch Bonding",
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
  ];
};

const BasicPart: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  const onChangeBondConfigType = (e: BondConfigType) => {
    form.resetFields([
      "bondName",
      "mode",
      "xmitHashPolicy",
      "physicalNicList",
      "physicalNicnNameList",
      "bond",
    ]);
    form.setFieldsValue({
      bondConfigType: e,
    });
  };

  return (
    <ZSVForm.Card indented={false}>
      <Form.Item
        name="bondConfigType"
        label={intl.formatMessage({
          id: "add.method",
          defaultMessage: "Addition Method",
        })}
        initialValue={BondConfigType.Every}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "create.vswitch.bond.field.bond.config.info.tooltip",
              defaultMessage: `todo`,
            })}
          </ReactMarkdown>
        }
      >
        <Select onChange={onChangeBondConfigType} width={400}>
          {useBondConfigType().map((t) => (
            <Select.Option
              value={t.value}
              key={t.value}
            >{`${t.label}`}</Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) =>
          prev.bondConfigType !== cur.bondConfigType ||
          prev.clusterUuids !== cur.clusterUuids
        }
      >
        {({ getFieldValue }) => {
          const bondConfigType = getFieldValue("bondConfigType");
          const clusterUuids = (getFieldValue("clusterUuids") ?? []).map(
            (item: any) => item.uuid,
          );

          if (bondConfigType !== BondConfigType.Exited) {
            return (
              <>
                <Form.Item
                  // name="bondName"
                  required
                  label={intl.formatMessage({
                    id: "up.bond.name",
                    defaultMessage: "Uplink Name",
                  })}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "create.vswitch.bond.field.bond.name.tooltip",
                        defaultMessage: `### Uplink Name

An uplink name represents the bonded physical ports on a host that connect to a physical switch.

1. By default, uplinks are named in the format "Uplink+suffix", where the suffix is an auto-incrementing number (1, 2, 3...) to distinguish resources. If the number of uplinks is 10 or more, the default naming format changes to "Up+suffix".
2. You can specify a custom name. The name must be 1 to 10 characters long and can contain letters, numbers, hyphens (-), or underscores (_). The name cannot start with a number.`,
                      })}
                    </ReactMarkdown>
                  }
                >
                  <BondNameItem required={true} width={400} />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({
                    id: "bond.mode.in.host",
                    defaultMessage: "Bond Mode",
                  })}
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
                    width={400}
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
                              width={400}
                              options={["layer2+3", "layer3+4", "layer2"].map(
                                (value) => ({
                                  value,
                                  label: value,
                                }),
                              )}
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
            />
          );
        }}
      </Form.Item>
    </ZSVForm.Card>
  );
};

export default React.memo(BasicPart);
