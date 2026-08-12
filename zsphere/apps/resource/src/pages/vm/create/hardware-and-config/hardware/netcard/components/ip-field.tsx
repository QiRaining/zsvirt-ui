import { Checkbox } from "@zstack/design";
import { useValidatorIp } from "@zstack/virtualization-resource/src/pages/vm/utils";
import { Form } from "@zstack/zsphere-components";
import type { L3Network } from "@zstack/zsphere-types/graphql";
import { isIP } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import AppointIp from "./appoint-ip";
import Dns from "./dns";
import IpInput from "./ip-input";

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

export interface IProps {
  index: number;
  displayIndex?: number;
  selectedPortGroup: L3Network;
  guest?: string;
  originalValue?: any;
  source?: any;
  ipFieldDescription?: React.ReactNode;
  disabled?: boolean;
  hideDns?: boolean;
}

export default function IpField({
  index,
  displayIndex,
  selectedPortGroup,
  guest,
  originalValue,
  source,
  ipFieldDescription,
  disabled,
  hideDns,
}: IProps) {
  const intl = useIntl();
  const validatorIp = useValidatorIp();

  const isWindows = guest === "Windows";
  const isLinux = guest === "Linux";

  const renderIpField = (ipVersion: 4 | 6, dhcpEnabled?: boolean) => {
    return (
      <>
        <Form.Item
          label={
            ipVersion === 6
              ? intl.formatMessage({
                  id: "ipv6.address",
                  defaultMessage: "IPv6 Address",
                })
              : intl.formatMessage({
                  id: "ipv4.address",
                  defaultMessage: "IPv4 Address",
                })
          }
          name={`ipv${ipVersion}-${index}`}
          validateTrigger="onBlur"
          rules={[
            {
              validator(_, value?: string) {
                if (value && !isIP(value, ipVersion)) {
                  return Promise.reject(
                    new Error(
                      intl.formatMessage({
                        id: "vm.field.ipv4.validator.format",
                        defaultMessage: "Invalid IP address.",
                      }),
                    ),
                  );
                }
                return Promise.resolve();
              },
            },
            {
              validator: (_, ip?: string) => {
                const originalIpv4 = originalValue?.usedIps?.find(
                  (item: any) => item.ipVersion === 4,
                )?.ip;
                const originalIpv6 = originalValue?.usedIps?.find(
                  (item: any) => item.ipVersion === 6,
                )?.ip;
                if (!ip || ip === originalIpv4 || ip === originalIpv6) {
                  return Promise.resolve();
                }
                return validatorIp({ network: selectedPortGroup, ip });
              },
            },
          ]}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "vm.create.field.staticipv4.tooltip",
                defaultMessage:
                  "### IP Address\n\nBy default, the system automatically assigns the IP address. You can also specify an IP address for your VM.\n\nNote: If VMs are created in bulk, the assigned IP address will default to be the start IP address, and the rest available IP addresses will be continuously assigned. When an IP address has been occupied or is insufficient within the range, the corresponding VM cannot be created.      ",
              })}
            </ReactMarkdown>
          }
          description={
            ipFieldDescription ? (
              <div className="width-200">{ipFieldDescription}</div>
            ) : undefined
          }
        >
          <IpInput
            l3NetworkUuid={selectedPortGroup.uuid}
            ipVersion={ipVersion}
            className="width-200"
            placeholder={
              dhcpEnabled
                ? intl.formatMessage({
                    id: "auto.dispatch",
                    defaultMessage: "Auto Allocated",
                  })
                : undefined
            }
            disabled={disabled}
          />
        </Form.Item>
        {isWindows && !hideDns && (
          <Dns index={index} isWindows ipVersion={ipVersion} />
        )}
      </>
    );
  };

  const renderIpSpecifyCheckbox = (ipVersion: 4 | 6) => {
    return (
      <>
        <Form.Item
          label={
            ipVersion === 6
              ? intl.formatMessage({
                  id: "ipv6.address",
                  defaultMessage: "IPv6 Address",
                })
              : intl.formatMessage({
                  id: "ipv4.address",
                  defaultMessage: "IPv4 Address",
                })
          }
          name={`appointIpv${ipVersion}-${index}`}
          valuePropName="checked"
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.appointIp.iconTooltip",
                defaultMessage:
                  "### Specify IP Address\n\n1. If the selected distributed port group has DHCP service disabled, you can use VMTools to specify an IP address for the virtual machine.\n2. If selected, you need to install VMTools on the virtual machine after the creation. The specified IP address will take effect automatically after the VMTools is installed.",
              })}
            </ReactMarkdown>
          }
        >
          <FormCheckbox
            disabled={disabled}
            label={
              ipVersion === 6
                ? intl.formatMessage({
                    id: "nic.create.instance.field.custom.ipv6",
                    defaultMessage: "Specify IPv6 by VMTools",
                  })
                : intl.formatMessage({
                    id: "nic.create.instance.field.custom.ip",
                    defaultMessage: "Specify IPv4 by VMTools",
                  })
            }
          />
        </Form.Item>
        <AppointIp
          index={index}
          ipVersion={ipVersion}
          isWindows={isWindows}
          originalValue={originalValue}
          source={source}
          disabled={disabled}
          hideDns={hideDns}
        />
      </>
    );
  };

  const linuxDns =
    isLinux && !displayIndex && !hideDns ? <Dns index={index} /> : null;

  if (selectedPortGroup.enableIPAM) {
    const dhcpEnabled = !!selectedPortGroup.networkServices?.find(
      (item) => item.networkServiceType === "DHCP",
    );
    const hasIpv4Range = !!selectedPortGroup.ipRanges?.find(
      (item) => item.ipVersion === 4 && item.ipRangeType === "Normal",
    );
    const hasIpv6Range = !!selectedPortGroup.ipRanges?.find(
      (item) => item.ipVersion === 6 && item.ipRangeType === "Normal",
    );
    return (
      <>
        {hasIpv4Range && renderIpField(4, dhcpEnabled)}
        {hasIpv6Range && renderIpField(6, dhcpEnabled)}
        {linuxDns}
      </>
    );
  }

  return (
    <>
      {renderIpSpecifyCheckbox(4)}
      {renderIpSpecifyCheckbox(6)}
      {linuxDns}
    </>
  );
}
