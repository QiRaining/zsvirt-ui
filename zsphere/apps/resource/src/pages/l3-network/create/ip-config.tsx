import { useDnsForm } from "@zstack/virtualization-resource/src/pages/l3-network/create/dns-form";
import {
  useIpRangeFormForCreate,
  validatorIP,
} from "@zstack/virtualization-resource/src/pages/l3-network/create/ip-range-form";
import { Switch, Form, Input } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

const { Item } = Form;

export default function IpConfig() {
  const intl = useIntl();
  const form = Form.useFormInstance();
  const IpRangeForm = useIpRangeFormForCreate();
  const dnsForm = useDnsForm();

  return (
    <>
      <Item
        label={intl.formatMessage({
          id: "dhcp.service",
          defaultMessage: "DHCP Service",
        })}
        auth={{
          type: "block" as const,
          authKey: "dhcp.service",
          resource: "flat.network",
        }}
        name="dhcpService"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "l3Network.field.dhcpService.tooltip",
              defaultMessage:
                "### DHCP Service\n\nThe DHCP service is a built-in distributed service in the platform, which assigns IP addresses only to resources in the platform and does not conflict with your existing DHCP server.\n\n- By default, the DHCP service is disabled. When enabled, IP addresses are automatically assigned to resources in the platform. You can customize a DHCP IP or use the DHCP IP that the system assigned according to the IP allocation policy.",
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch
          onChange={(value) => {
            if (value) {
              form?.setFieldsValue({ enableIPAM: true });
            }
          }}
        />
      </Item>
      <Item
        noStyle
        shouldUpdate={(prev, curr) => prev.dhcpService !== curr.dhcpService}
      >
        {({ getFieldValue }) => (
          <Item
            label={intl.formatMessage({
              id: "ip.address.manegement",
              defaultMessage: "IP Address Management",
            })}
            name="enableIPAM"
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "l3Network.field.enableIPAM.tooltip",
                  defaultMessage:
                    "### IPAM\n\nBy default, the IP Address Management (IPAM) is disabled. When enabled, you can add network ranges to this distributed port group. IP addresses in these ranges can be allocated via DHCP service (when enabled) to resources in the network.",
                })}
              </ReactMarkdown>
            }
            valuePropName="checked"
            tooltip={
              getFieldValue("dhcpService")
                ? intl.formatMessage({
                    id: "l3Network.field.enableIPAM.disabled.tooltip",
                    defaultMessage: "You cannot disable IPAM because DHCP service is currently enabled.",
                  })
                : undefined
            }
          >
            <Switch disabled={getFieldValue("dhcpService")} />
          </Item>
        )}
      </Item>
      <Item
        noStyle
        shouldUpdate={(prev, curr) => prev.enableIPAM !== curr.enableIPAM}
      >
        {({ getFieldValue }) =>
          getFieldValue("enableIPAM") && (
            <div className={styles["ip-container"]}>{IpRangeForm}</div>
          )
        }
      </Item>
      <Item
        noStyle
        shouldUpdate={(prev, current) =>
          prev.dhcpService !== current.dhcpService ||
          prev.ipVersion !== current.ipVersion
        }
      >
        {({ getFieldValue }) => {
          if (!getFieldValue("dhcpService")) {
            return null;
          }
          const ipVersion = getFieldValue("ipVersion");
          return (
            <>
              <Item
                name={["dhcpIp", String(ipVersion)]}
                auth={{ authKey: "dhcp.service.ip", resource: `flat.network` }}
                label={
                  ipVersion === 4
                    ? intl.formatMessage({
                        id: "ipv4.dhcpService.ip",
                        defaultMessage: "IPv4 DHCP IP",
                      })
                    : intl.formatMessage({
                        id: "ipv6.dhcpService.ip",
                        defaultMessage: "IPv6 DHCP IP",
                      })
                }
                validateTrigger="onBlur"
                rules={[
                  {
                    validator: (_: any, value: string) =>
                      validatorIP(
                        value,
                        ipVersion,
                        intl.formatMessage({
                          id: "l3Network.field.dhcpServiceIp.validator.format",
                          defaultMessage: "Invalid IP address.",
                        }),
                      ),
                  },
                ]}
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "l3Network.field.dhcpServiceIp.tooltip",
                      defaultMessage:
                        "### DHCP IP\n\n1. A DHCP IP is an IP address used by the DHCP service to assign IP addresses to resources that use this distributed port group.\n2. If you create a distributed port group for the first time with the DHCP service enabled, or if you add the first network range to adistributed port group with the DHCP service enabled, you can customize the DHCP IP.\n3. If the distributed port group has a DHCP IP, you cannot customize the DHCP IP when you add a network range.\n4. The DHCP IP can be in or outside the added IP range, but it must be an unoccupied IP address in the CIDR block of the added IP range.",
                    })}
                  </ReactMarkdown>
                }
              >
                <Form.Tooltip
                  tooltip={
                    ipVersion === 4
                      ? intl.formatMessage({
                          id: "l3Network.field.dhcpServiceIpv4Ip.tooltip",
                          defaultMessage: "Example: 192.168.0.100",
                        })
                      : intl.formatMessage({
                          id: "l3Network.field.dhcpServiceIpv6Ip.tooltip",
                          defaultMessage: "Example: 240c::6644",
                        })
                  }
                >
                  <Input className="width-320" />
                </Form.Tooltip>
              </Item>
            </>
          );
        }}
      </Item>
      {dnsForm}
    </>
  );
}
