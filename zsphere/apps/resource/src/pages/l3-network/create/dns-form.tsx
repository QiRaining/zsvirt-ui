import { Input } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { isIP } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const { Item } = Form;

export const useDnsForm = () => {
  const intl = useIntl();

  return (
    <Item
      noStyle
      shouldUpdate={(prev, curr) =>
        prev.enableIPAM !== curr.enableIPAM || prev.ipVersion !== curr.ipVersion
      }
    >
      {({ getFieldValue }) => {
        const ipVersion = getFieldValue("enableIPAM")
          ? getFieldValue("ipVersion")
          : 4;
        return (
          <Item
            name={["dns", String(ipVersion)]}
            label="DNS"
            icon="info"
            dependencies={["ipVersion", "enableIPAM"]}
            validateTrigger="onBlur"
            rules={[
              {
                validator: (_: any, value: string) =>
                  !value || isIP(value, ipVersion)
                    ? Promise.resolve()
                    : Promise.reject(
                        Error(
                          intl.formatMessage({
                            id: "l3Network.field.dns.validator.format",
                            defaultMessage: "Invalid DNS.",
                          }),
                        ),
                      ),
              },
            ]}
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "l3Network.field.dns.tooltip",
                  defaultMessage:
                    "### DNS\n\nSpecify a DNS to provide DNS resolution service for the distributed port group.\n\n- When IPAM is disabled, only IPv4 DNS is supported.\n- When IPAM is enabled, enter DNS in the correct format based on the IP address type.\n\nExamples:\n\n- IPv4 DNS: 223.5.5.5\n- IPv6 DNS: 240c::6666",
                })}
              </ReactMarkdown>
            }
            tooltip={ipVersion === 4 ? "223.5.5.5" : "240c::6666"}
          >
            <Input className="width-320" />
          </Item>
        );
      }}
    </Item>
  );
};
