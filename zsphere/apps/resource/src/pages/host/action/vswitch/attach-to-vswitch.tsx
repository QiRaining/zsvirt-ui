import { gql } from "@apollo/client";
import { BondNameItem } from "@zstack/virtualization-resource/src/pages/bond/action/create";
import { useDefaultName } from "@zstack/virtualization-resource/src/pages/l2-network/create/hooks";
import SelectPhysicalModal from "@zstack/virtualization-resource/src/pages/l2-network/create/nic-config/select-physical-modal";
import {
  Form,
  Modal,
  Select,
  Title,
  ZSVForm,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, ResourceQueryType } from "@zstack/zsphere-types";
import type {
  AttachL2NetworkToHostPayload,
  HostVO as IHostVO,
  PhysicalNic as IPhysicalNic,
} from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const attachL2NetworkToHost = gql`
  mutation attachL2NetworkToHost($input: AttachL2NetworkToHostInput!) {
    attachL2NetworkToHost(input: $input) {
      actionId
    }
  }
`;

const updateVirtualSwitchUplink = gql`
  mutation updateVirtualSwitchUplink($input: UpdateVirtualSwitchUplinkInput!) {
    updateVirtualSwitchUplink(input: $input) {
      actionId
    }
  }
`;

const AttachHostToVSwtich: React.FC<IActionWrapperProps<IHostVO>> = ({
  refetch,
  visible,
  setVisible,
  source,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const host = selectedList?.[0];

  const hasUpLink = !!source?.physicalInterface;

  const { query: setDefaultVswitch, count: maxBondingName } = useDefaultName([
    /Uplink(\d+)/,
    /Up(\d+)/,
  ]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        physicalNicList: host?.bondRelatedVSwitch?.[0]?.slaves ?? [],
      });

      if (!hasUpLink) {
        setDefaultVswitch({
          variables: {
            type: ResourceQueryType.L2Network,
            extraConditions: [
              {
                key: "nameKey",
                op: Op.eq,
                value: "physicalInterface",
              },
            ],
            conditions: [
              {
                key: "physicalInterface",
                op: Op.like,
                value: "Up",
              },
            ],
          },
        });
      }
    }
  }, [form, hasUpLink, host.bondRelatedVSwitch, setDefaultVswitch, visible]);

  useEffect(() => {
    if (!_.isUndefined(maxBondingName)) {
      form.setFieldsValue({
        bondingName: (maxBondingName > 9 ? "Up(d+)" : "Uplink(d+)").replace(
          "(d+)",
          `${maxBondingName}`,
        ),
      });
    }
  }, [maxBondingName]);

  const onOk = async (value: any) => {
    const slaveUuids: string[] = value.physicalNicList?.map(
      (it: IPhysicalNic) => it.uuid,
    );

    if (hasUpLink) {
      const mode = source?.systemTags?.bondingMode;
      const xmitHashPolicy = source?.systemTags?.xmitHashPolicy;

      const payload: AttachL2NetworkToHostPayload = {
        bondingName: source?.physicalInterface,
        slaveUuids,
        mode,
        hostUuid: host.uuid,
        l2NetworkUuid: source?.uuid,
        bondingUuid: host?.bondRelatedVSwitch?.[0]?.uuid,
      };
      if (!mode?.includes("active-backup")) {
        payload.xmitHashPolicy = xmitHashPolicy;
      }

      doAction({
        mutation: attachL2NetworkToHost,
        payload,
        name: intl.formatMessage({
          id: "join.bonding",
          defaultMessage: "Join Uplink",
        }),
        total: 1,
        type: "Host",
        onFinish: () => {
          setVisible(false);
          refetch?.();
        },
      });
    } else {
      const { bondingName, mode, xmitHashPolicy } = value || {};

      doAction({
        mutation: updateVirtualSwitchUplink,
        payload: {
          updateVirtualSwitchUplinkBondingsActionPayload: {
            uuid: source?.uuid,
            mode,
            bondingName,
            xmitHashPolicy: mode === "802.3ad" ? xmitHashPolicy : null,
          },
          attachL2NetworkToHostPayload: {
            bondingName,
            slaveUuids,
            mode,
            xmitHashPolicy,
            hostUuid: host.uuid,
            l2NetworkUuid: source?.uuid,
          },
        },
        name: intl.formatMessage({
          id: "join.bonding",
          defaultMessage: "Join Uplink",
        }),
        total: 1,
        type: "Host",
        onFinish: () => {
          setVisible(false);
          refetch?.();
        },
      });
    }
  };

  const changeBondMode = (mode: string) => {
    const fieldsValue: { [props: string]: string } = {
      mode,
    };
    if (mode === "802.3ad") {
      fieldsValue.xmitHashPolicy = "layer2+3";
    }
    form.setFieldsValue(fieldsValue);
  };

  const uplinkConfigEle = React.useMemo(() => {
    if (hasUpLink) {
      return (
        <>
          <Form.Item
            name="bondName"
            label={intl.formatMessage({
              id: "up.bond.name",
              defaultMessage: "Uplink Name",
            })}
          >
            {source?.physicalInterface}
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "bond.mode.in.host",
              defaultMessage: "Bond Mode",
            })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "bond.field.bond.mode.tooltip",
                  defaultMessage: `### Bond Mode
Supports 2 Bond modes: Active-backup (mode1) and LACP (mode4).
1. Active-backup: This mode allows you to bind 1-2 physical NIC ports and we recommend that you bind 2 ports, one acting as the primary port and the other as the secondary port. The primary port handle all network flows by default. When the primary port fails, the secondary port automatically replaces the primary port to handle flows and avoid business interruptions.
2. LACP:
   - Link aggregation control protocol (LACP) mode. This mode allows you to bind 1-8 physical NIC ports and we recommend that you bind at least 2 ports. Bound ports share the same speed and duplex setting. Network flows are evenly sent to the bound ports, thus realizing a load balance.
   - A bond of this mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.
     - layer2+3: Picks out a port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
     - layer3+4: Picks out a port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
     - layer2: Picks out a port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
                })}
              </ReactMarkdown>
            }
          >
            {source?.systemTags?.bondingMode === "802.3ad"
              ? intl.formatMessage({
                  id: "link.aggregation.mode",
                  defaultMessage: "LACP (mode 4)",
                })
              : intl.formatMessage({
                  id: "master.backup.mode",
                  defaultMessage: "Active-Backup (mode1)",
                })}
          </Form.Item>
          <Form.Item
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
            {source?.systemTags?.xmitHashPolicy &&
            source?.systemTags?.xmitHashPolicy !== "null"
              ? source?.systemTags?.xmitHashPolicy
              : "-"}
          </Form.Item>
        </>
      );
    }

    return (
      <>
        <Form.Item
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
          <BondNameItem required={true} width={320} />
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
                id: "bond.field.bond.mode.tooltip",
                defaultMessage: `### Bond Mode
Supports 2 Bond modes: Active-backup (mode1) and LACP (mode4).
1. Active-backup: This mode allows you to bind 1-2 physical NIC ports and we recommend that you bind 2 ports, one acting as the primary port and the other as the secondary port. The primary port handle all network flows by default. When the primary port fails, the secondary port automatically replaces the primary port to handle flows and avoid business interruptions.
2. LACP:
   - Link aggregation control protocol (LACP) mode. This mode allows you to bind 1-8 physical NIC ports and we recommend that you bind at least 2 ports. Bound ports share the same speed and duplex setting. Network flows are evenly sent to the bound ports, thus realizing a load balance.
   - A bond of this mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.
     - layer2+3: Picks out a port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
     - layer3+4: Picks out a port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
     - layer2: Picks out a port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
              })}
            </ReactMarkdown>
          }
        >
          <Select
            className="width-320"
            onChange={changeBondMode}
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

        <Form.Item noStyle shouldUpdate={(pre, cur) => pre.mode !== cur.mode}>
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
                      className="width-320"
                      options={["layer2+3", "layer3+4", "layer2"].map(
                        (value) => ({
                          value,
                          label: value,
                        }),
                      )}
                    />
                  </Form.Item>
                )}
              </>
            );
          }}
        </Form.Item>
      </>
    );
  }, [changeBondMode, hasUpLink, intl, source]);

  return (
    <DialogForm
      title={
        <Title
          title={intl.formatMessage({
            id: "join.bonding",
            defaultMessage: "Join Uplink",
          })}
          resourceName={host.name}
        />
      }
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form form={form} initialValues={{ physicalNicList: [] }}>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "upLink.config",
            defaultMessage: "Uplink Configuration",
          })}
        >
          {uplinkConfigEle}
        </ZSVForm.Card>

        <ZSVForm.Card
          title={intl.formatMessage({
            id: "physical.networkPort.config",
            defaultMessage: "Physical Port Configuration",
          })}
        >
          <SelectPhysicalModal.SelectPhysicalNicForHost
            hostUuids={[host?.uuid]}
            form={form}
            physicalNicTips={intl.formatMessage({
              id: "add.host.and.physicalNic.tips",
              defaultMessage: "Add Physical Port",
            })}
          />
        </ZSVForm.Card>
      </Form>
    </DialogForm>
  );
};

export default AttachHostToVSwtich;
