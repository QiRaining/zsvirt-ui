import { Button as DesignButton } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form, Input, Select } from "@zstack/zsphere-components";
import { isIP } from "@zstack/zsphere-utils";
import { Form as AntForm } from "antd";
import cls from "classnames";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "../style.module.less";

export interface IProps {
  index?: number;
  isWindows?: boolean;
  ipVersion?: 4 | 6 | 46;
  disabled?: boolean;
}

export default function Dns({
  index = 0,
  isWindows,
  ipVersion = 46,
  disabled,
}: IProps) {
  const intl = useIntl();

  const fieldNamePostfix = ipVersion === 46 ? "" : ipVersion.toString();
  const allocTypeFieldName = isWindows
    ? `dnsAllocationType${fieldNamePostfix}-${index}`
    : `dnsAllocationType${fieldNamePostfix}`;
  const dnsListFieldName = isWindows
    ? `dnsList${fieldNamePostfix}-${index}`
    : `dnsList${fieldNamePostfix}`;
  const maxDnsNum = isWindows ? 2 : 3;

  const labelPrefix =
    isWindows && fieldNamePostfix ? `IPv${fieldNamePostfix} ` : "";
  const typeLabelBase = intl.formatMessage({
    id: "vm.create.field.dns.allocation.type",
    defaultMessage: "Assign DNS",
  });
  const dnsLabelBase = intl.formatMessage({ id: "dns", defaultMessage: "DNS" });
  const typeLabel = `${labelPrefix}${typeLabelBase}`;
  const dnsLabel = `${labelPrefix}${dnsLabelBase}`;

  const isValidIp = (value: string) => {
    const ipVersionList = ipVersion.toString().split("");
    return (
      (ipVersionList.includes("4") && isIP(value, 4)) ||
      (ipVersionList.includes("6") && isIP(value, 6))
    );
  };

  const dnsValidator = (_: any, value?: string) => {
    if (!value || isValidIp(value)) {
      return Promise.resolve();
    }
    return Promise.reject(
      new Error(
        intl.formatMessage({
          id: "create.vm.field.dns.validator.format",
          defaultMessage: "Invalid DNS.",
        }),
      ),
    );
  };

  const dnsListDuplicateValidator = (_: any, value?: string[]) => {
    if (!value?.length) {
      return Promise.resolve();
    }
    const validIpList = value.filter((item) => !!item && isValidIp(item));
    if (validIpList.length < 2) {
      return Promise.resolve();
    }
    if (new Set(validIpList).size !== validIpList.length) {
      return Promise.reject(
        new Error(
          intl.formatMessage({
            id: "create.vm.field.dns.validator.format",
            defaultMessage: "Invalid DNS.",
          }),
        ),
      );
    }
    return Promise.resolve();
  };

  return (
    <>
      <Form.Item
        name={allocTypeFieldName}
        initialValue="auto"
        label={typeLabel}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.create.field.dns.allocation.type.tooltip",
              defaultMessage:
                "### Assign DNS\n\nBy default, the system automatically assigns DNS addresses, but you can manually specify a DNS.\n\n1. Auto Allocated:\n	- If DHCP is enabled on the distributed port group, DNS can be automatically assigned.\n	- If DHCP is disabled on the distributed port group, DNS will be assigned and take effect through VMTools.\n2. Manual Allocation: Manually configured DNS will be assigned and take effect through VMTools.\n\nNotes:\n\n- If VMTools is not installed on the VM, the DNS configuration will take effect after VMTools installation is completed.\n- For Linux VMs, DNS can only be configured for NIC 1, with a maximum of 3 DNS addresses suppported.\n- For Windows VMs, DNS can be configured for all NICs, with a maximum of 3 DNS addresses per NIC.",
            })}
          </ReactMarkdown>
        }
      >
        <Select
          disabled={disabled}
          className="width-200"
          options={[
            {
              label: intl.formatMessage({
                id: "vm.create.field.dns.allocation.type.auto",
                defaultMessage: "Auto Allocated",
              }),
              value: "auto",
            },
            {
              label: intl.formatMessage({
                id: "vm.create.field.dns.allocation.type.manual",
                defaultMessage: "Manual Allocation",
              }),
              value: "manual",
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev[allocTypeFieldName] !== curr[allocTypeFieldName]
        }
      >
        {({ getFieldValue }) =>
          getFieldValue(allocTypeFieldName) === "manual" && (
            <Form.Item label={dnsLabel}>
              <Form.List
                name={dnsListFieldName}
                initialValue={[""]}
                rules={[
                  {
                    validator: dnsListDuplicateValidator,
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => {
                  return (
                    <>
                      {fields.map((field) => {
                        return (
                          <div
                            key={field.key}
                            className={cls(style.dnsInput, {
                              [style.dnsDisabled]: !!disabled,
                            })}
                          >
                            <Form.Item
                              {...field}
                              style={{ marginBottom: 0 }}
                              validateTrigger={["onChange", "onBlur"]}
                              rules={[
                                {
                                  validateTrigger: "onBlur",
                                  validator: dnsValidator,
                                },
                              ]}
                            >
                              <Input
                                className="width-200"
                                disabled={disabled}
                              />
                            </Form.Item>
                            {!disabled && (
                              <div className={style.trashIcon}>
                                <Icon onClick={() => remove(field.name)} type="trash" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {!disabled && (
                        <DesignButton
                          className={style.addDnsBtn}
                          variant="link"
                          onClick={() => add()}
                          disabled={fields.length >= maxDnsNum}
                        >
                          <Icon type="plus" />
                          {intl.formatMessage({
                            id: "add.dns",
                            defaultMessage: "Add DNS",
                          })}{" "}
                          {`(${fields.length}/${maxDnsNum})`}
                        </DesignButton>
                      )}
                      <AntForm.ErrorList errors={errors} />
                    </>
                  );
                }}
              </Form.List>
            </Form.Item>
          )
        }
      </Form.Item>
    </>
  );
}
