import { Switch, TextArea, Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormInstance } from "antd";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import ImportButton from "./ImportButton";

export interface IProps {
  form: FormInstance;
}

export default function ThirdParty({ form }: IProps) {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  return (
    <>
      <Form.Item
        required
        name="certFile"
        label={intl.formatMessage({
          id: "cert.field.pubkey",
          defaultMessage: "Certificate File",
        })}
        validateTrigger="onBlur"
        rules={[
          isRequired(),
          {
            pattern:
              /^-----BEGIN CERTIFICATE-----.+-----END CERTIFICATE-----$/s,
            transform: (value) => value?.trim(),
            message: intl.formatMessage({
              id: "cert.field.pubkey.validator",
              defaultMessage: "Certificate content format is incorrect...",
            }),
          },
        ]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cert.field.pubkey.tip",
              defaultMessage:
                '### Certificate File\n\n1. You can paste the certificate to import or upload the certificate file.\n2. Only CRT and PEM formats are supported.\n3. The certificate body should begin with ----BEGIN CERTIFICATE---- and end with ----END CERTIFICATE----.',
            })}
          </ReactMarkdown>
        }
        extra={
          <ImportButton
            accept=".crt,.pem"
            onload={(certFile) => form.setFieldsValue({ certFile })}
          >
            {intl.formatMessage({
              id: "cert.field.pubkey.extra",
              defaultMessage: "Import File",
            })}
          </ImportButton>
        }
      >
        <TextArea
          className="width-320"
          placeholder={intl.formatMessage({
            id: "cert.field.pubkey.placeholder",
            defaultMessage:
              'Begin with ----BEGIN CERTIFICATE---- and end with ----END CERTIFICATE----',
          })}
        />
      </Form.Item>
      <Form.Item
        required
        name="certPrivatekey"
        label={intl.formatMessage({
          id: "cert.field.privatekey",
          defaultMessage: "Certificate Private Key",
        })}
        validateTrigger="onBlur"
        rules={[
          isRequired(),
          {
            pattern:
              /^-----BEGIN .*PRIVATE KEY-----.+-----END .*PRIVATE KEY-----$/s,
            transform: (value) => value?.trim(),
            message: intl.formatMessage({
              id: "cert.field.privatekey.validator",
              defaultMessage: "Private key content format is incorrect...",
            }),
          },
        ]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cert.field.privatekey.tip",
              defaultMessage:
                '### Certificate Private Key \n\n1. You can upload the private key content by copying and pasting, or by importing the private key document.\n2. Only KEY and PEM formats are supported.\n3. The private key should begin with ----BEGIN (RSAIEC) PRIVATE KEY---- and end with ----END (RSAIEC) PRIVATE KEY----.',
            })}
          </ReactMarkdown>
        }
        extra={
          <ImportButton
            accept=".key,.pem"
            onload={(certPrivatekey) => form.setFieldsValue({ certPrivatekey })}
          >
            {intl.formatMessage({
              id: "cert.field.privatekey.extra",
              defaultMessage: "Import Private Key",
            })}
          </ImportButton>
        }
      >
        <TextArea
          className="width-320"
          placeholder={intl.formatMessage({
            id: "cert.field.privatekey.placeholder",
            defaultMessage:
              'Begin with ----BEGIN (RSAIEC) PRIVATE KEY---- and end with ----END (RSAIEC) PRIVATE KEY----',
          })}
        />
      </Form.Item>
      <Form.Item
        name="certChain"
        label={intl.formatMessage({
          id: "cert.field.chain",
          defaultMessage: "Certificate Chain",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cert.field.chain.tip",
              defaultMessage:
                '### Certificate Chain\n\n1. You can paste the certificate to import or upload the certificate file.\n2. Only CRT and PEM formats are supported.\n3. The certificate body should begin with ----BEGIN CERTIFICATE---- and end with ----END CERTIFICATE----.',
            })}
          </ReactMarkdown>
        }
        extra={
          <ImportButton
            accept=".crt,.pem"
            onload={(certChain) => form.setFieldsValue({ certChain })}
          >
            {intl.formatMessage({
              id: "cert.field.chain.extra",
              defaultMessage: "Import Certificate Chain",
            })}
          </ImportButton>
        }
      >
        <TextArea
          className="width-320"
          placeholder={intl.formatMessage({
            id: "cert.field.chain.placeholder",
            defaultMessage:
              'Begin with ----BEGIN CERTIFICATE---- and end with ----END CERTIFICATE----',
          })}
        />
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
    </>
  );
}
