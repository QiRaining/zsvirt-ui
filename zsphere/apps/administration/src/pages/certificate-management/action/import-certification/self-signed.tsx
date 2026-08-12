import { Switch, Form, Input, Select } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export default function SelfSigned() {
  const intl = useIntl();
  const { lengthRange } = useValidator(intl);

  const options = useMemo(
    () => [
      {
        value: 90,
        label: intl.formatMessage({
          id: "cert.validTime.option.three.months",
          defaultMessage: "Three months",
        }),
      },
      {
        value: 365,
        label: intl.formatMessage({
          id: "cert.validTime.option.one.year",
          defaultMessage: "One year",
        }),
      },
      {
        value: 1095,
        label: intl.formatMessage({
          id: "cert.validTime.option.three.years",
          defaultMessage: "Three years",
        }),
      },
      {
        value: 1825,
        label: intl.formatMessage({
          id: "cert.validTime.option.five.years",
          defaultMessage: "Five years",
        }),
      },
      {
        value: 3650,
        label: intl.formatMessage({
          id: "cert.validTime.option.ten.years",
          defaultMessage: "Ten years",
        }),
      },
    ],
    [intl],
  );

  return (
    <>
      <Form.Item
        name="validTime"
        label={intl.formatMessage({
          id: "cert.field.validTime",
          defaultMessage: "Validity Period",
        })}
      >
        <Select className="width-240" options={options} />
      </Form.Item>
      <Form.Item
        name="httpRedirect"
        label={intl.formatMessage({
          id: "cert.field.httpRedirect",
          defaultMessage: "HTTP Redirect",
        })}
        description={intl.formatMessage({
          id: "cert.field.httpRedirect.description",
          defaultMessage:
            "When enabled, requests are redirected from HTTP address port 80 to HTTPS address port 443 by default.",
        })}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item
        name="customizeCertInfo"
        label={intl.formatMessage({
          id: "cert.field.customizeCertInfo",
          defaultMessage: "Custom Information",
        })}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.customizeCertInfo !== curr.customizeCertInfo
        }
      >
        {({ getFieldValue }) => {
          return (
            getFieldValue("customizeCertInfo") && (
              <>
                <Form.Item
                  name="commonName"
                  label={intl.formatMessage({
                    id: "cert.info.commonName",
                    defaultMessage: "Common Name",
                  })}
                  rules={[
                    lengthRange(1, 64),
                    {
                      pattern: /^[\da-zA-Z~`@#$%^&*()\-_+={}[\]|:;'<>.?/]*$/,
                      message: intl.formatMessage({
                        id: "cert.field.name.validator",
                        defaultMessage:
                          "Only supports input of English uppercase and lowercase letters, numbers, and the following special characters: ~`@#$%^&*()-_+={}[]|;'<>.?/",
                      }),
                    },
                  ]}
                >
                  <Input className="width-240" />
                </Form.Item>
                <Form.Item
                  name="organization"
                  label={intl.formatMessage({
                    id: "cert.info.companyName",
                    defaultMessage: "Organization",
                  })}
                  rules={[
                    lengthRange(1, 64),
                    {
                      pattern: /^[\da-zA-Z~`@#$%^&*()\-_+={}[\]|:;'<>.?/]*$/,
                      message: intl.formatMessage({
                        id: "cert.field.name.validator",
                        defaultMessage:
                          "Only supports input of English uppercase and lowercase letters, numbers, and the following special characters: ~`@#$%^&*()-_+={}[]|;'<>.?/",
                      }),
                    },
                  ]}
                >
                  <Input className="width-240" />
                </Form.Item>
                <Form.Item
                  name="department"
                  label={intl.formatMessage({
                    id: "cert.info.department",
                    defaultMessage: "Organizational Unit",
                  })}
                  rules={[
                    lengthRange(1, 64),
                    {
                      pattern: /^[\da-zA-Z~`@#$%^&*()\-_+={}[\]|:;'<>.?/]*$/,
                      message: intl.formatMessage({
                        id: "cert.field.name.validator",
                        defaultMessage:
                          "Only supports input of English uppercase and lowercase letters, numbers, and the following special characters: ~`@#$%^&*()-_+={}[]|;'<>.?/",
                      }),
                    },
                  ]}
                >
                  <Input className="width-240" />
                </Form.Item>
                <Form.Item
                  name="country"
                  label={intl.formatMessage({
                    id: "cert.info.country",
                    defaultMessage: "Country/Region",
                  })}
                >
                  <span>CN</span>
                </Form.Item>
                <Form.Item
                  name="province"
                  label={intl.formatMessage({
                    id: "cert.info.province",
                    defaultMessage: "State/Province",
                  })}
                  rules={[
                    lengthRange(1, 128),
                    {
                      pattern:
                        /^[\da-zA-Z\u4e00-\u9fa5~`@#$%^&*()\-_+={}[\]|:;'<>.?/]*$/,
                      message: intl.formatMessage({
                        id: "cert.field.province.city.validator",
                        defaultMessage:
                          "Only supports input of Chinese, English letters (both uppercase and lowercase), numbers, and the following special characters: ~`@#$%^&*()-_+={}[\\\\]:;'<>.?/",
                      }),
                    },
                  ]}
                >
                  <Input className="width-240" />
                </Form.Item>
                <Form.Item
                  name="city"
                  label={intl.formatMessage({
                    id: "cert.info.city",
                    defaultMessage: "Locality",
                  })}
                  rules={[
                    lengthRange(1, 128),
                    {
                      pattern:
                        /^[\da-zA-Z\u4e00-\u9fa5~`@#$%^&*()\-_+={}[\]|:;'<>.?/]*$/,
                      message: intl.formatMessage({
                        id: "cert.field.province.city.validator",
                        defaultMessage:
                          "Only supports input of Chinese, English letters (both uppercase and lowercase), numbers, and the following special characters: ~`@#$%^&*()-_+={}[\\\\]:;'<>.?/",
                      }),
                    },
                  ]}
                >
                  <Input className="width-240" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label={intl.formatMessage({
                    id: "cert.info.email",
                    defaultMessage: "Email Address",
                  })}
                  validateTrigger="onBlur"
                  rules={[
                    {
                      type: "email",
                      message: intl.formatMessage({
                        id: "cert.field.email.validator",
                        defaultMessage: "Invalid input.",
                      }),
                    },
                  ]}
                >
                  <Input className="width-240" />
                </Form.Item>
              </>
            )
          );
        }}
      </Form.Item>
    </>
  );
}
