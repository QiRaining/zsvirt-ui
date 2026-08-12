import { Icon } from "@zstack/icon";
import { Form, Input } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { GuestToolsState } from "@zstack/zsphere-types";
import { isIP, isValidNetMask } from "@zstack/zsphere-utils";
import { InputNumber } from "antd";
import { uniq } from "lodash-es";
import { useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useCheckVNicIpAvailability } from "../../hooks";
import Dns from "./dns";

import style from "../style.module.less";

export interface IProps {
  index: number;
  ipVersion: 4 | 6;
  isWindows?: boolean;
  originalValue?: any;
  source?: any;
  disabled?: boolean;
  hideDns?: boolean;
}

export default function AppointIp({
  index,
  ipVersion,
  isWindows,
  originalValue,
  source,
  disabled,
  hideDns,
}: IProps) {
  const intl = useIntl();
  const form = Form.useFormInstance()!;
  const { isRequired } = useValidator(intl);
  const { remoteCheckVNicIpAvailability } = useCheckVNicIpAvailability();
  const [ipFieldDescription, setIpFieldDescription] = useState<string | null>(
    null,
  );

  const appointIpFieldName = `appointIpv${ipVersion}-${index}`;
  const ipFieldName = `ipv${ipVersion}-${index}`;

  const handleCheckIpAvailability = async () => {
    const l3NetworkUuid = form.getFieldValue(`l3NetworkUuids-${index}`)?.[0]
      ?.uuid;
    const value = form.getFieldValue(ipFieldName);
    const errors = form.getFieldError(ipFieldName);
    const originalIpv4 = originalValue?.usedIps?.find(
      (item: any) => item.ipVersion === 4,
    )?.ip;
    const originalIpv6 = originalValue?.usedIps?.find(
      (item: any) => item.ipVersion === 6,
    )?.ip;
    if (
      !value ||
      errors.length ||
      value === originalIpv4 ||
      value === originalIpv6 ||
      !l3NetworkUuid
    ) {
      return;
    }
    const { data } = await remoteCheckVNicIpAvailability({
      fetchPolicy: "no-cache",
      variables: {
        input: {
          l3NetworkUuid,
          ip: value,
          ipVersion,
        },
      },
    });
    const unavailable = !data?.checkVNicIpAvailability?.available;
    const portGroupNames =
      data?.checkVNicIpAvailability?.l3Network?.map((it) => it.name) ?? [];
    if (unavailable && portGroupNames.length) {
      setIpFieldDescription(
        intl.formatMessage(
          {
            id: "vm.duplicate.ip.description",
            defaultMessage:
              "The IP address of the NIC conflicts with an existing IP address in the port group ({portGroupNames}), which may cause network conflicts. Proceed with caution.",
          },
          {
            portGroupNames: uniq(portGroupNames).join(", "),
          },
        ),
      );
    } else {
      setIpFieldDescription(null);
    }
  };

  const renderIpFieldDescription = () => {
    if (ipFieldDescription) {
      return (
        <div style={{ marginLeft: "-12px" }}>
          <div className="flex flex-nowrap gap-1">
            <div>
              <Icon
                type="alert-triangle-fill"
                color="alert"
                style={{ marginTop: "1px" }}
              />
            </div>
            <div>{ipFieldDescription}</div>
          </div>
        </div>
      );
    }

    if (source?.__typename !== "VmInstance") {
      return (
        <div style={{ marginLeft: "-12px" }}>
          {intl.formatMessage({
            id: "vm.create.hardware.network.card.netcard.ipv4.unInstall.vmTools",
            defaultMessage:
              "If VMTools are not installed, specifying an IP address will be effective after installation is complete.",
          })}
        </div>
      );
    }

    if (
      [GuestToolsState.Uninstall, GuestToolsState.Unsupport].includes(
        source.toolsState,
      )
    ) {
      return (
        <div style={{ marginLeft: "-12px" }}>
          <div className="flex flex-nowrap gap-1">
            <div>
              <Icon
                type="alert-triangle-fill"
                color="alert"
                style={{ marginTop: "1px" }}
              />
            </div>
            <div>
              {intl.formatMessage({
                id: "vm.edit.hardware.network.card.netcard.ipv4.unInstall.vmTools",
                defaultMessage:
                  "VM Tools are not installed, and the specified IP address cannot take effect. You can install VM Tools to make the IP address effective afterwards.",
              })}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Form.Item
      noStyle
      shouldUpdate={(prev, curr) => {
        return prev[appointIpFieldName] !== curr[appointIpFieldName];
      }}
    >
      {({ getFieldValue }) => {
        const isAppointIp = getFieldValue(appointIpFieldName);

        if (!isAppointIp) {
          return null;
        }

        return (
          <ZSVForm.Card showLine className={style.card}>
            <Form.Item
              name={ipFieldName}
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
              required
              rules={[
                isRequired(),
                {
                  validator(_, value?: string) {
                    if (value && !isIP(value, ipVersion)) {
                      return Promise.reject(
                        new Error(
                          intl.formatMessage({
                            id: "bareMetalNode.field.start.ip.validator.format",
                            defaultMessage: "Invalid IP address.",
                          }),
                        ),
                      );
                    }
                    return Promise.resolve();
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
              description={renderIpFieldDescription()}
            >
              <Input
                className="width-200"
                disabled={disabled}
                onBlur={handleCheckIpAvailability}
              />
            </Form.Item>
            {ipVersion === 6 ? (
              <Form.Item
                name={`prefixLen-${index}`}
                label={intl.formatMessage({
                  id: "prefix.length",
                  defaultMessage: "Prefix Length",
                })}
                required
                rules={[isRequired()]}
                tooltip="64 ~ 126"
              >
                <InputNumber
                  className="width-80"
                  max={126}
                  min={64}
                  disabled={disabled}
                />
              </Form.Item>
            ) : (
              <Form.Item
                name={`netmask-${index}`}
                label={intl.formatMessage({
                  id: "netmask",
                  defaultMessage: "Netmask",
                })}
                required
                rules={[
                  isRequired(),
                  {
                    validator: (_, value?: string) =>
                      !value || isValidNetMask(value)
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(
                              intl.formatMessage({
                                id: "l3Network.field.netmask.validator.format",
                                defaultMessage: "Invalid netmask.",
                              }),
                            ),
                          ),
                  },
                ]}
              >
                <Input className="width-200" disabled={disabled} />
              </Form.Item>
            )}
            <Form.Item
              name={`gateway${ipVersion}-${index}`}
              label={
                ipVersion === 6
                  ? intl.formatMessage({
                      id: "ipv6.gateway",
                      defaultMessage: "IPv6 Gateway",
                    })
                  : intl.formatMessage({
                      id: "ipv4.gateway",
                      defaultMessage: "IPv4 Gateway",
                    })
              }
              rules={[
                {
                  validator(_, value?: string) {
                    if (value && !isIP(value, ipVersion)) {
                      return Promise.reject(
                        new Error(
                          intl.formatMessage({
                            id: "bareMetalNode.field.start.ip.validator.format",
                            defaultMessage: "Invalid IP address.",
                          }),
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input className="width-200" disabled={disabled} />
            </Form.Item>
            {isWindows && !hideDns && (
              <Dns index={index} isWindows ipVersion={ipVersion} />
            )}
          </ZSVForm.Card>
        );
      }}
    </Form.Item>
  );
}
