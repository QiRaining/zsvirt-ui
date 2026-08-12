import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { ModalFormContext } from "@zstack/virtualization-resource/src/pages/vm/create/components/modal-zsv/context";
import { Form, Input } from "@zstack/zsphere-components";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { GuestToolsState, VmInstanceState } from "@zstack/zsphere-types";
import type { VmNic as IVmNic } from "@zstack/zsphere-types/graphql";
import React, { useContext, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import IpField from "./ip-field";

export interface IProps {
  displayIndex?: number;
  index: number;
  origin?: IVmNic;
  isEdit?: boolean;
  source?: any;
}

const { Item } = Form;

export default function IpConfig({
  index,
  displayIndex,
  origin,
  isEdit = false,
  source,
}: IProps) {
  const intl = useIntl();
  const disabledConfig = useContext(ConfigContext);
  const { setEditModalVisible, setGuestToolModalVisible } =
    useContext(ModalFormContext);
  const [restartDhcpVisible, setRestartDhcpVisible] = useState(false);

  const ipFieldDescription = useMemo(() => {
    if (!isEdit || !source || source.state !== VmInstanceState.Running) {
      return null;
    }
    if (
      source.toolsState !== GuestToolsState.Uninstall &&
      source.toolsState !== GuestToolsState.Unsupport
    ) {
      return intl.formatMessage({
        id: "vm.field.ip.dhcp.description.vmtools.installed",
        defaultMessage: "After an online IP address change, the new IP will take effect automatically through VMTools.",
      });
    }
    return intl.formatMessage(
      {
        id: "vm.field.ip.dhcp.description",
        defaultMessage:
          "To change an IP address, {restartDhcpLink} for the change to take effect, or {installVmtoolsLink} to auto-apply the change.",
      },
      {
        restartDhcpLink: (
          <a
            onClick={() => {
              setRestartDhcpVisible(true);
            }}
          >
            {intl.formatMessage({
              id: "vm.field.ip.dhcp.description.restart.dhcp.link",
              defaultMessage: "Restart DHCP Client",
            })}
          </a>
        ),
        installVmtoolsLink: (
          <a
            onClick={() => {
              setEditModalVisible(false);
              setGuestToolModalVisible(true);
            }}
          >
            {intl.formatMessage({
              id: "vm.field.ip.dhcp.description.install.vmtools.link",
              defaultMessage: "Install VMTools",
            })}
          </a>
        ),
      },
    );
  }, [isEdit, source, intl, setEditModalVisible, setGuestToolModalVisible]);

  return (
    <Item
      noStyle
      shouldUpdate={(prev, curr) =>
        prev[`l3NetworkUuids-${index}`] !== curr[`l3NetworkUuids-${index}`] ||
        prev.guest !== curr.guest
      }
    >
      {({ getFieldValue }) => {
        const selectedPortGroup = getFieldValue(`l3NetworkUuids-${index}`)?.[0];
        const guest = getFieldValue("guest");

        if (!selectedPortGroup) {
          return null;
        }

        return (
          <>
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.mac",
                defaultMessage: "MAC Address",
              })}
              name={`customMac-${index}`}
              rules={[
                {
                  validator(_rule, val) {
                    if (!val) {
                      return Promise.resolve();
                    }
                    const reg = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/;
                    const result = reg.test(val);

                    const firstByte = parseInt(val.substring(0, 2), 16);

                    if ((firstByte & 1) === 1) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "virtualization.field.MAC.validator.multicastMac",
                          defaultMessage: "Enter an unicast MAC address.",
                        }),
                      );
                    }

                    return result
                      ? Promise.resolve()
                      : Promise.reject(
                          intl.formatMessage({
                            id: "virtualization.field.MAC.validator.format",
                            defaultMessage: "Invalid MAC address.",
                          }),
                        );
                  },
                },
              ]}
              tooltip={origin && disabledConfig.tooltip}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "vm.create.field.macaddress.tooltip",
                    defaultMessage:
                      "### MAC Address\n\nBy default, the system automatically assigns the MAC address. You can also specify a MAC address for your VM.\n\nNote: If VMs are created in bulk, the assigned MAC address will default to be the start MAC address, and the rest available MAC addresses will be continuously assigned. When a MAC address has been occupied within the range, the corresponding VM cannot be created.",
                  })}
                </ReactMarkdown>
              }
            >
              <Input
                disabled={origin && disabledConfig.disabled}
                className="width-200"
                placeholder={intl.formatMessage({
                  id: "auto.generate",
                  defaultMessage: "Auto Generated",
                })}
              />
            </Item>
            <IpField
              index={index}
              displayIndex={displayIndex}
              selectedPortGroup={selectedPortGroup}
              guest={guest}
              originalValue={origin}
              source={source}
              ipFieldDescription={ipFieldDescription}
            />
            <DialogWeak
              visible={restartDhcpVisible}
              setVisible={setRestartDhcpVisible}
              type="warning"
              title={String(
                intl.formatMessage({
                  id: "vm.field.ip.restart.dhcp.modal.title",
                  defaultMessage: "Restart DHCP Service",
                }),
              )}
              description={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "vm.field.ip.restart.dhcp.modal.content",
                    defaultMessage:
                      "After a online IP address change, you need to enter the VM console and run the following command to restart the DHCP Client.\n\n- Linux VMs:\n	- If the network is not managed by NetworkManager, run the following command: dhclient -r ${ifname}; dhclient ${ifname}\n	- If the network is managed by NetworkManager, run the following command: nmcli c up ${ifname}\n- Windows VMs: Enter the command line tool and run the following command: ipconfig /release && ipconfig /renew\n",
                  })}
                </ReactMarkdown>
              }
            />
          </>
        );
      }}
    </Item>
  );
}
