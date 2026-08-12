import { Input, RadioGroup, Text } from "@zstack/design";
import { Form, Select } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import {
  ipToInt,
  isCidr,
  isIP,
  isIpInCidr,
  isValidatorIpRange,
  isValidNetMask,
} from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import { InputNumber } from "antd";
import type { FormInstance } from "antd/lib/form";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

const { Item } = Form;
const { Option } = Select;

interface IProps {
  ipVersion: 4 | 6;
  isEmpty?: boolean;
  labelWidth?: 160 | 148 | 120;
}

const calculateNetworkAddress = (
  ip: string,
  subnetMask: string,
  isIPv6: boolean,
): string => {
  if (isIPv6) {
    const ipInt = ipv6ToInt(ip);
    const maskInt = ipv6ToInt(subnetMask);
    const networkAddressInt = ipInt & maskInt;
    // Convert the network address to IPv6 format
    let networkAddress = networkAddressInt.toString(16);
    while (networkAddress.length < 32) {
      networkAddress = `0${networkAddress}`;
    }

    return networkAddress.match(/.{1,4}/g)?.join(":") || "";
  }
  const ipInt = ipToInt(ip);
  const maskInt = ipToInt(subnetMask);
  const networkAddressInt = ipInt & maskInt;
  // Convert the network address to IPv4 format
  return [
    (networkAddressInt >> 24) & 255,
    (networkAddressInt >> 16) & 255,
    (networkAddressInt >> 8) & 255,
    networkAddressInt & 255,
  ].join(".");
};

// Given a network address and a subnet mask, calculate the broadcast address
const calculateBroadcastAddress = (
  networkAddress: string,
  subnetMask: string,
  isIPv6: boolean,
): string => {
  if (isIPv6) {
    // Convert the broadcast address to IPv6 format
    const networkInt = ipv6ToInt(networkAddress);
    const maskInt = ipv6ToInt(subnetMask);
    const invertedMaskInt = ~maskInt;
    const broadcastInt = networkInt | invertedMaskInt;
    let broadcastAddress = broadcastInt.toString(16);
    while (broadcastAddress.length < 32) {
      broadcastAddress = `0${broadcastAddress}`;
    }

    return broadcastAddress.match(/.{1,4}/g)?.join(":") || "";
  }
  // Convert the broadcast address to IPv4 format
  const networkInt = ipToInt(networkAddress);
  const maskInt = ipToInt(subnetMask);
  const invertedMaskInt = ~maskInt;
  const broadcastInt = networkInt | invertedMaskInt;
  return [
    (broadcastInt >> 24) & 255,
    (broadcastInt >> 16) & 255,
    (broadcastInt >> 8) & 255,
    broadcastInt & 255,
  ].join(".");
};

const useValidateIpForAdd = () => {
  const intl = useIntl();

  const calculateNetworkAndBroadcastAddress = ({
    ip,
    netmask,
    ipVersion,
  }: {
    ip: string;
    netmask: string;
    gateway?: string;
    ipVersion: 4 | 6;
  }): string[] => {
    const isIPv6 = ipVersion === 6;
    const networkAddress = calculateNetworkAddress(ip, netmask, isIPv6);
    const broadcastAddress = calculateBroadcastAddress(
      networkAddress,
      netmask,
      isIPv6,
    );
    return [networkAddress, broadcastAddress];
  };

  const isNetworkOrBrocastIp = ({
    ip,
    netmask,
    ipVersion,
  }: {
    ip: string;
    netmask: string;
    ipVersion: 4 | 6;
  }) => {
    return calculateNetworkAndBroadcastAddress({
      ip,
      netmask,
      ipVersion,
    }).includes(ip);
  };

  return ({
    ipVersion,
    type,
    form,
  }: {
    ipVersion: 4 | 6;
    type: "start" | "end";
    form: FormInstance;
  }) => {
    const textMap = {
      start: intl.formatMessage({
        id: "start.ip.invalidate",
        defaultMessage: "Invalid start IP",
      }),
      end: intl.formatMessage({
        id: "end.ip.invalidate",
        defaultMessage: "Invalid end IP.",
      }),
    };

    return {
      validator: (_: any, value: any) => {
        const netmask = form.getFieldValue("netmask");
        if (ipVersion === 6 || !isIP(netmask)) {
          return Promise.resolve();
        }
        if (isNetworkOrBrocastIp({ ip: value, netmask, ipVersion })) {
          return Promise.reject(Error(textMap[type]));
        }

        return Promise.resolve();
      },
    };
  };
};

export const validatorIP = (ip: string, ipVersion: 4 | 6, msg: string) => {
  if (!ip || isIP(ip, ipVersion)) {
    return Promise.resolve();
  }
  return Promise.reject(Error(msg));
};

const validatorIpRange = (
  startIp: string,
  endIp: string,
  ipVersion: 4 | 6,
  msg: string,
) => {
  if (!startIp || !endIp) {
    return Promise.resolve();
  }
  if (!isIP(startIp, ipVersion) || !isIP(endIp, ipVersion)) {
    return Promise.resolve();
  }

  return isValidatorIpRange(startIp, endIp, ipVersion)
    ? Promise.resolve()
    : Promise.reject(Error(msg));
};

const ipv6ToInt = (ip: string) => {
  // Check if BigInt is supported
  const isBigIntSupported = typeof BigInt !== "undefined";
  if (!isBigIntSupported) {
    // BigInt is not supported, handle it accordingly
    throw new Error("BigInt is not supported in this environment");
  }

  // Convert IPv6 to integer
  const segments = ip.split(":");
  let ipInt = 0n;
  for (let i = 0; i < segments.length; i++) {
    ipInt = ipInt * 65536n + BigInt(parseInt(segments[i], 16));
  }
  return ipInt;
};

function isIpInRange(
  ip: string,
  startIp: string,
  endIp: string,
  isIPv6: boolean,
): boolean {
  if (isIPv6) {
    const ipInt = ipv6ToInt(ip);
    const startInt = ipv6ToInt(startIp);
    const endInt = ipv6ToInt(endIp);
    return ipInt >= startInt && ipInt <= endInt;
  }
  const ipInt = ipToInt(ip);
  const startInt = ipToInt(startIp);
  const endInt = ipToInt(endIp);
  return ipInt >= startInt && ipInt <= endInt;
}

const IpRangeForm = ({
  ipVersion,
  isEmpty = true,
  labelWidth = 160,
}: IProps) => {
  const intl = useIntl();
  const { isRequired, ipValidator } = useValidator(intl);
  const form = Form.useFormInstance()!;
  const validateIpForadd = useValidateIpForAdd();

  const ipVersionName = String(ipVersion);
  const startIpName = ["startIp", ipVersionName];
  const endIpName = ["endIp", ipVersionName];
  const gatewayName = ["gateway", ipVersionName];
  const cidrName = ["networkCidr", ipVersionName];
  const dhcpIpName = ["dhcpIp", ipVersionName];
  const dnsName = ["dns", ipVersionName];

  const handleRevalidation = usePersistFn(() => {
    form.validateFields(
      [
        startIpName,
        endIpName,
        gatewayName,
        cidrName,
        dhcpIpName,
        dnsName,
      ].filter((name) => form.getFieldValue(name)),
    );
  });

  useEffect(() => {
    handleRevalidation();
  }, [handleRevalidation, ipVersion]);

  return (
    <>
      <Item
        labelWidth={labelWidth}
        name="isByCidr"
        label={intl.formatMessage({
          id: "ipRangeMethod",
          defaultMessage: "Network Range Method",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {ipVersion === 4
              ? intl.formatMessage({
                  id: "l3Network.field.ipRangeMethod.ipv4.tooltip",
                  defaultMessage:
                    "### Network Range Method\n\nSupport 2 network range methods: IP Range\n and CIDR.\n\n1. IP Range: Add an IP range from the start IP to the end IP. For example, you can set the start IP as 192.168.0.100, end IP as 192.168.0.200, netmask as 255.255.0.0, and gateway as 192.168.0.1. Do not include a gateway address, broadcast address, or network address in the IP range.\n\n2.  CIDR: Classless Inter-Domain Routing. For example, you can set the CIDR as 192.168.0.0/24. We recommend that you set the gateway as the first or last address in the CIDR. If left blank, the gateway uses the first address by default.",
                })
              : intl.formatMessage({
                  id: "l3Network.field.ipRangeMethod.ipv6.tooltip",
                  defaultMessage:
                    "### Network Range Method\n\n1. IP range: provides an IP configuration method: Stateful-DHCP. For example, you can set the IP range to 3000:910A:2222:5498:8475:1111:3900:4002–3000:910A:2222:5498:8475:1111:3900:400f, prefix length to 64, and gateway to 3000:910A:2222:5498:8475:1111:3900:4001.\n2. CIDR: provides three IP configuration methods: Stateful-DHCP, Stateless-DHCP, and SLAAC. For example, 236C:347A:4D::/64.\n\n#### Notice:\n\n1. If you use the Stateless-DHCP or SLAAC method, you need to manually change the IP generation method to EUI64.\n2. The prefix length ranges from 64 to 126. If the value is smaller than 64, the VM creation might fail.\n3. Do not include a gateway address (xxxx::1) in the IP range.",
                })}
          </ReactMarkdown>
        }
      >
        {isEmpty ? (
          <RadioGroup
            onValueChange={() => {
              setTimeout(() => {
                handleRevalidation();
              });
            }}
            options={[
              {
                value: false,
                label: intl.formatMessage({
                  id: "IP.range",
                  defaultMessage: "IP Range",
                }),
              },
              {
                value: true,
                label: "CIDR",
                disabled: !isEmpty,
              },
            ]}
          />
        ) : (
          <Form.Tooltip
            tooltip={intl.formatMessage({
              id: "add.iprange.cidr.disabled.title",
              defaultMessage:
                "First network range addition supports IP range or CIDR. Subsequent additions only support IP ranges.",
            })}
          >
            <RadioGroup
              options={[
                {
                  value: false,
                  label: intl.formatMessage({
                    id: "IP.range",
                    defaultMessage: "IP Range",
                  }),
                },
                {
                  value: true,
                  label: "CIDR",
                  disabled: true,
                },
              ]}
            />
          </Form.Tooltip>
        )}
      </Item>

      {ipVersion === 6 && (
        <Item
          noStyle
          shouldUpdate={(prev: any, curr: any) =>
            prev.isByCidr !== curr.isByCidr
          }
        >
          {({ getFieldValue }: any) => {
            const isByCidr = getFieldValue("isByCidr");
            if (!isByCidr) {
              form?.resetFields(["addressMode"]);
            }
            return (
              <Item
                name="addressMode"
                labelWidth={labelWidth}
                label={intl.formatMessage({
                  id: "assignIpMode",
                  defaultMessage: "IP Configuration Mode",
                })}
                initialValue="Stateful-DHCP"
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "l3Network.field.assignIpMode.tooltip",
                      defaultMessage:
                        "### IP Allocation Mode\n\n1. An IPv6 address includes a prefix length and an interface identifier. DHCP for IPv6 (DHCPv6), which provides stateful or stateless DHCP to IPv6 hosts), does not include a prefix length. The prefix length is generated by route advertisements of routers.\n2. IPv6 supports the following three IP allocation modes:\n\n   -  Stateful-DHCP (default): The interface address and other parameters are all configured through DHCP. The IP range method supports stateful DHCP.\n   - Stateless-DHCP: The interface address is automatically derived from the route advertisement prefix and the interface Mac address. Other parameters are configured through DHCP.\n   - SLAAC: The interface address is automatically derived from the prefix of the route advertisement that also contains other parameters.\n3. The route advertisement configuration methods vary depending on the router vendors. For more details, refer to the corresponding router vendor documentation.\n4. The following is an example of how to configure a Vyos virtual router.\n\n```\nethernet eth2 {\n   ipv6 {\n      router-advert {\n         managed-flag true\n         max-interval 60\n         min-interval 15\n         other-config-flag true\n         prefix 2021:11:26:2::1/64 {\n             autonomous-flag false\n             on-link-flag true\n             }\n         send-advert true\n         }\n     }\n }\n```",
                    })}
                  </ReactMarkdown>
                }
              >
                <Select className="width-320">
                  <Option value="Stateful-DHCP">Stateful-DHCP</Option>
                  {isByCidr && (
                    <Option value="Stateless-DHCP">Stateless-DHCP</Option>
                  )}
                  {isByCidr && <Option value="SLAAC">SLAAC</Option>}
                </Select>
              </Item>
            );
          }}
        </Item>
      )}

      <Item
        noStyle
        shouldUpdate={(prev: any, curr: any) => prev.isByCidr !== curr.isByCidr}
      >
        {({ getFieldValue }: any) => {
          const isByCidr = getFieldValue("isByCidr");
          return isByCidr ? (
            <Item
              name={cidrName}
              validateFirst
              rules={[
                isRequired(),
                {
                  validator: (_: any, value: any) =>
                    isCidr(value, ipVersion)
                      ? Promise.resolve()
                      : Promise.reject(
                          Error(
                            intl.formatMessage({
                              id: "l3Network.field.cidr.validator.format",
                              defaultMessage: "Invalid CIDR.",
                            }),
                          ),
                        ),
                },
              ]}
              labelWidth={labelWidth}
              label="CIDR"
              tooltip={
                ipVersion === 4
                  ? intl.formatMessage({
                      id: "l3Network.field.cidr.ipv4.hover",
                      defaultMessage: "Example: 192.168.0.0/24",
                    })
                  : intl.formatMessage({
                      id: "l3Network.field.cidr.ipv6.hover",
                      defaultMessage: "Example: 234e:0:4567::3d/64",
                    })
              }
            >
              <Input className="width-320" />
            </Item>
          ) : (
            <>
              <Item
                name={startIpName}
                dependencies={[endIpName, gatewayName, "netmask"]}
                validateTrigger="onBlur"
                validateFirst
                rules={[
                  isRequired(),
                  ipValidator(ipVersion),
                  validateIpForadd({
                    ipVersion,
                    type: "start",
                    form,
                  }),
                  {
                    validator: (_: any, startIp: string) =>
                      validatorIpRange(
                        startIp,
                        getFieldValue(endIpName),
                        ipVersion,
                        ipVersion === 4
                          ? intl.formatMessage({
                              id: "l3Network.field.ipv4IpRange.validator.invalidIpRange",
                              defaultMessage: "Invalid IP range.",
                            })
                          : intl.formatMessage({
                              id: "l3Network.field.ipv6IpRange.validator.invalidIpRange",
                              defaultMessage: "Invalid IP range.",
                            }),
                      ),
                  },
                  {
                    validator: (_: any, startIP: string) => {
                      const endIp = form.getFieldValue(endIpName);
                      const gateway = form.getFieldValue(gatewayName);

                      if (!endIp || !gateway || ipVersion !== 4) {
                        return Promise.resolve();
                      }
                      const gatewayToInt = ipToInt(gateway);

                      if (
                        ipToInt(startIP) <= gatewayToInt &&
                        gatewayToInt <= ipToInt(endIp)
                      ) {
                        return Promise.reject(
                          Error(
                            intl.formatMessage({
                              id: "l3Network.field.ipv4IpRange.validator.gateway",
                              defaultMessage: "The gateway cannot be included in the IP range.",
                            }),
                          ),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                labelWidth={labelWidth}
                label={intl.formatMessage({
                  id: "start.ip",
                  defaultMessage: "Start IP",
                })}
                tooltip={
                  ipVersion === 4
                    ? intl.formatMessage({
                        id: "l3Network.field.startIp.ipv4.hover",
                        defaultMessage: "Example: 192.168.0.100",
                      })
                    : intl.formatMessage({
                        id: "l3Network.field.startIp.ipv6.hover",
                        defaultMessage:
                          "Example: CDCD:910A:2222:5498:8475:1111:3900:2002",
                      })
                }
              >
                <Input className="width-320" />
              </Item>
              <Item
                name={endIpName}
                dependencies={[startIpName, gatewayName, "netmask"]}
                validateTrigger="onBlur"
                validateFirst
                rules={[
                  isRequired(),
                  ipValidator(ipVersion),
                  validateIpForadd({
                    ipVersion,
                    type: "end",
                    form,
                  }),
                  {
                    validator: (_: any, endIp: string) =>
                      validatorIpRange(
                        getFieldValue(startIpName),
                        endIp,
                        ipVersion,
                        ipVersion === 4
                          ? intl.formatMessage({
                              id: "l3Network.field.ipv4IpRange.validator.invalidIpRange",
                              defaultMessage: "Invalid IP range.",
                            })
                          : intl.formatMessage({
                              id: "l3Network.field.ipv6IpRange.validator.invalidIpRange",
                              defaultMessage: "Invalid IP range.",
                            }),
                      ),
                  },
                  {
                    validator: (_: any, endIp: string) => {
                      const startIp = form.getFieldValue(startIpName);
                      const gateway = form.getFieldValue(gatewayName);

                      if (!startIp || !gateway || ipVersion !== 4) {
                        return Promise.resolve();
                      }
                      const gatewayToInt = ipToInt(gateway);

                      if (
                        ipToInt(startIp) <= gatewayToInt &&
                        gatewayToInt <= ipToInt(endIp)
                      ) {
                        return Promise.reject(
                          Error(
                            intl.formatMessage({
                              id: "l3Network.field.ipv4IpRange.validator.gateway",
                              defaultMessage: "The gateway cannot be included in the IP range.",
                            }),
                          ),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                labelWidth={labelWidth}
                label={intl.formatMessage({
                  id: "end.ip",
                  defaultMessage: "End IP",
                })}
                tooltip={
                  ipVersion === 4
                    ? intl.formatMessage({
                        id: "l3Network.field.endIp.ipv4.hover",
                        defaultMessage: "Example: 192.168.0.200",
                      })
                    : intl.formatMessage({
                        id: "l3Network.field.endIp.ipv6.hover",
                        defaultMessage:
                          "Example: CDCD:910A:2222:5498:8475:1111:3900:2009",
                      })
                }
              >
                <Input className="width-320" />
              </Item>
              {ipVersion === 4 ? (
                <Form.Item
                  name="netmask"
                  validateTrigger="onBlur"
                  dependencies={[startIpName, endIpName]}
                  rules={[
                    isRequired(),
                    {
                      validator: (_: any, value: any) =>
                        !value || isValidNetMask(value)
                          ? Promise.resolve()
                          : Promise.reject(
                              Error(
                                intl.formatMessage({
                                  id: "l3Network.field.netmask.validator.format",
                                  defaultMessage: "Invalid netmask.",
                                }),
                              ),
                            ),
                    },
                    {
                      validator: (_: any, value: any) => {
                        const startIp = getFieldValue(startIpName);
                        const endIp = getFieldValue(endIpName);

                        if (!!startIp && !!endIp && !isByCidr) {
                          const networkAddress = calculateNetworkAddress(
                            startIp,
                            value,
                            false,
                          );

                          const broadcastAddress = calculateBroadcastAddress(
                            networkAddress,
                            value,
                            false,
                          );

                          const isBroadcastInRange = isIpInRange(
                            endIp,
                            networkAddress,
                            broadcastAddress,
                            false,
                          );

                          if (!isBroadcastInRange) {
                            return Promise.reject(
                              Error(
                                intl.formatMessage({
                                  id: "l3Network.field.netmask.validator.format.inStartAndEndRange",
                                  defaultMessage: "The netmask does not match the IP range.",
                                }),
                              ),
                            );
                          }
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                  labelWidth={labelWidth}
                  label={intl.formatMessage({
                    id: "netmask",
                    defaultMessage: "Netmask",
                  })}
                  tooltip={intl.formatMessage({
                    id: "l3Network.field.netmask.hover",
                    defaultMessage: "Example: 255.255.255.0",
                  })}
                >
                  <Input className="width-320" />
                </Form.Item>
              ) : (
                <Form.Item
                  name="prefixLen"
                  rules={[isRequired()]}
                  labelWidth={labelWidth}
                  label={intl.formatMessage({
                    id: "prefix.length",
                    defaultMessage: "Prefix Length",
                  })}
                  tooltip="64 ~ 126"
                >
                  <InputNumber
                    className={styles.inputNumber}
                    style={{ width: "80px" }}
                    max={126}
                    min={64}
                  />
                </Form.Item>
              )}
            </>
          );
        }}
      </Item>
      <Item noStyle shouldUpdate={(prev: any, curr: any) => prev !== curr}>
        {({ getFieldValue }: any) => {
          const isByCidr = getFieldValue("isByCidr");
          const cidr = getFieldValue(cidrName);
          const startIp = getFieldValue(startIpName);
          const netmask = getFieldValue("netmask");

          const showGateway = ipVersion !== 6 || !isByCidr;
          return (
            showGateway && (
              <Item
                name={gatewayName}
                validateTrigger="onBlur"
                dependencies={[
                  startIpName,
                  endIpName,
                  cidrName,
                  "netmask",
                  "isByCidr",
                ]}
                rules={[
                  {
                    required: !isByCidr,
                    message: isRequired().message,
                  },
                  {
                    validator: (_: any, value: string) => {
                      return validatorIP(
                        value,
                        ipVersion,
                        intl.formatMessage({
                          id: "l3Network.field.gateway.validator.format",
                          defaultMessage: "Invalid gateway.",
                        }),
                      );
                    },
                  },
                  {
                    validator: (_: any, value: string) => {
                      if (!!value && ipVersion === 4 && isByCidr) {
                        if (cidr && !isIpInCidr(value, cidr, false)) {
                          return Promise.reject(
                            Error(
                              intl.formatMessage({
                                id: "l3Network.field.gateway.validator.format.inSubnetAndIpRange",
                                defaultMessage: "The gateway is not in the subnet.",
                              }),
                            ),
                          );
                        }
                      }

                      if (
                        !!value &&
                        !isByCidr &&
                        !!startIp &&
                        !!netmask &&
                        ipVersion === 4
                      ) {
                        const networkAddress = calculateNetworkAddress(
                          startIp,
                          netmask,
                          false,
                        );

                        const broadcastAddress = calculateBroadcastAddress(
                          networkAddress,
                          netmask,
                          false,
                        );

                        const isGatewayInRange = isIpInRange(
                          value,
                          networkAddress,
                          broadcastAddress,
                          false,
                        );

                        const isGatewayInSubnetAndIpRange = isGatewayInRange;

                        if (!isGatewayInSubnetAndIpRange) {
                          return Promise.reject(
                            Error(
                              intl.formatMessage({
                                id: "l3Network.field.gateway.validator.format.inSubnetAndIpRange",
                                defaultMessage: "The gateway is not in the subnet.",
                              }),
                            ),
                          );
                        }
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
                labelWidth={labelWidth}
                label={intl.formatMessage({
                  id: "gateway",
                  defaultMessage: "Gateway",
                })}
                tooltip={
                  ipVersion === 4
                    ? intl.formatMessage({
                        id: "l3Network.field.gateway.ipv4.hover",
                        defaultMessage: "Example: 192.168.0.1",
                      })
                    : intl.formatMessage({
                        id: "l3Network.field.gateway.ipv6.hover",
                        defaultMessage:
                          "Smaple: CDCD:910A:2222:5498:8475:1111:3900:2001",
                      })
                }
              >
                <Input className="width-320" />
              </Item>
            )
          );
        }}
      </Item>
    </>
  );
};

export const useIpRangeFormForCreate = () => {
  const intl = useIntl();
  const labelWidth = 148;
  const ipAllocationItem = useIpAllocationItem({ labelWidth });
  const ipVersionOption = [
    {
      label: "IPv4",
      value: 4,
    },
    {
      label: "IPv6",
      value: 6,
    },
  ];
  return (
    <>
      <Item
        labelWidth={labelWidth}
        name="ipVersion"
        label={intl.formatMessage({
          id: "ip.version",
          defaultMessage: "IP Address Type",
        })}
      >
        <RadioGroup options={ipVersionOption} />
      </Item>
      <Item
        noStyle
        shouldUpdate={(prev, curr) => prev.ipVersion !== curr.ipVersion}
      >
        {({ getFieldValue }) =>
          getFieldValue("ipVersion") === 4 && ipAllocationItem
        }
      </Item>
      <Item
        noStyle
        shouldUpdate={(prev, curr) => prev.ipVersion !== curr.ipVersion}
      >
        {({ getFieldValue }) => {
          const ipVersion = getFieldValue("ipVersion") ?? 4;
          return <IpRangeForm ipVersion={ipVersion} labelWidth={labelWidth} />;
        }}
      </Item>
    </>
  );
};

export const useIpAllocationItem = ({
  labelWidth = 160,
  isEmpty = true,
} = {}) => {
  const intl = useIntl();

  const ipAllocationOption = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "RandomIpAllocator",
          defaultMessage: "Random allocation",
        }),
        value: "RandomIpAllocator",
      },
      {
        label: intl.formatMessage({
          id: "FirstAvailableIpAllocator",
          defaultMessage: "Allocate in Order",
        }),
        value: "FirstAvailableIpAllocator",
      },
      {
        label: intl.formatMessage({
          id: "AscDelayRecycleIpAllocator",
          defaultMessage: "Allocate in Cycle",
        }),
        value: "AscDelayRecycleIpAllocator",
      },
    ],
    [intl],
  );

  return (
    <Item
      name="ipAllocateStrategy"
      initialValue="RandomIpAllocator"
      labelWidth={labelWidth as any}
      label={intl.formatMessage({
        id: "ip.allocation.policy",
        defaultMessage: "IP Allocation Policy",
      })}
      auth={{
        type: "block" as const,
        authKey: "dhcp.service",
        resource: "public.network",
      }}
      icon="info"
      iconTooltip={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "l3Network.field.ipAllocateStrategy.tooltip",
            defaultMessage:
              "### IP Allocation Policy\n\nAfter enabling the DHCP service, you can select one of the following three allocation policies to assign IP addresses:\n\n1. Random: The system randomly assigns IP addresses from the network range.  \n\n2. Allocate in Order  \n - The system assigns all available IP addresses from the network range in ascending order. Released IP addresses are assigned in the next allocation.\n- Example: Assume that the network range is 192.168.0.101～192.168.0.120, within which 192.168.0.101～192.168.0.108 are allocated. If 192.168.0.106 is released, it will be assigned first in the next allocation.\n\n3. Allocate in Cycle  \n - The system assigns available IP addresses from the network range in ascending order. Released IP addresses are assigned when currently available IP addresses are used up.\n- Example: Assume that the network range is 192.168.0.101～192.168.0.120, within which 192.168.0.101～192.168.0.108 are allocated. If 192.168.0.106 is released, it will be assigned after 192.168.0.120 is used.",
          })}
        </ReactMarkdown>
      }
    >
      {isEmpty ? (
        <Select className="width-240" options={ipAllocationOption} />
      ) : (
        <FormText
          transform={(value) => {
            return (
              ipAllocationOption.find((item) => item.value === value)?.label ||
              value
            );
          }}
        />
      )}
    </Item>
  );
};

export const useIpRangeFormForAdd = ({ ipVersion, isEmpty = true }: IProps) => {
  const intl = useIntl();
  const ipAllocationItem = useIpAllocationItem({ isEmpty });
  return (
    <>
      <Item
        label={intl.formatMessage({
          id: "ipAddressType",
          defaultMessage: "IP Address Type",
        })}
        style={{ height: "32px" }}
      >
        {`IPv${ipVersion}`}
      </Item>
      {ipVersion === 4 ? ipAllocationItem : null}
      <IpRangeForm ipVersion={ipVersion} isEmpty={isEmpty} />
    </>
  );
};

interface IFormTextProps {
  value?: string;
  transform?: (value?: string) => string | undefined;
}

function FormText({ value, transform }: IFormTextProps) {
  const transformedValue = transform ? transform(value) : value;
  return <Text>{transformedValue ?? ""}</Text>;
}
