import {
  FieldStack,
  InputField,
  InputNumberField,
  InputPasswordField,
  RadioGroupField,
  SelectField,
  SwitchField,
} from "@zstack/form";
import { ZSVForm } from "@zstack/zsphere-components";
import React from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import type { CreateSnmpManagementFormValues } from "./schema";

interface IProps {
  form: UseFormReturn<CreateSnmpManagementFormValues>;
}

export enum VersionType {
  "v2c" = "v2c",
  "v3" = "v3",
}

export enum AuthAlgorithmEnum {
  "MD5" = "MD5",
  "SHA" = "SHA",
  "SHA224" = "SHA224",
  "SHA256" = "SHA256",
  "SHA384" = "SHA384",
  "SHA512" = "SHA512",
}

export enum PrivacyAlgorithmEnum {
  "DES" = "DES",
  "AES128" = "AES128",
  "AES192" = "AES192",
  "AES256" = "AES256",
  "3DES" = "3DES",
}

export const Config: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const version = useWatch({ control: form.control, name: "version" });
  const authAlgorithmSwitch = useWatch({
    control: form.control,
    name: "authAlgorithmSwitch",
  });
  const privacyAlgorithmSwitch = useWatch({
    control: form.control,
    name: "privacyAlgorithmSwitch",
  });

  React.useEffect(() => {
    if (!authAlgorithmSwitch && privacyAlgorithmSwitch) {
      form.setValue("privacyAlgorithmSwitch", false, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [authAlgorithmSwitch, form, privacyAlgorithmSwitch]);

  const authAlgorithmOptions = React.useMemo(
    () =>
      Object.values(AuthAlgorithmEnum).map((item) => ({
        value: item,
        label: item,
      })),
    [],
  );
  const privacyAlgorithmOptions = React.useMemo(
    () =>
      Object.values(PrivacyAlgorithmEnum).map((item) => ({
        value: item,
        label: item,
      })),
    [],
  );

  return (
    <FieldStack>
      <InputNumberField
        form={form}
        name="port"
        label={intl.formatMessage({
          id: "snmp.agent.port",
          defaultMessage: "SNMP Agent Port",
        })}
        required
        labelTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "snmp.management.field.port.tooltip",
              defaultMessage: `### SNMP Agent Port
A port configured on the management node which is used to receive and respond to requests from the 3rd-party platform. Default: 1161.`,
            })}
          </ReactMarkdown>
        }
        className="w-40"
        valueMode="string"
      />

      <RadioGroupField
        form={form}
        name="version"
        label={intl.formatMessage({
          id: "snmp.agent.version",
          defaultMessage: "Protocol Version",
        })}
        options={Object.values(VersionType).map((item) => ({
          value: item,
          label: item,
        }))}
      />

      {version === VersionType.v2c ? (
        <InputField
          form={form}
          name="readCommunity"
          label={intl.formatMessage({
            id: "snmp.agent.readCommunity",
            defaultMessage: "Community String",
          })}
          required
          labelTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "snmp.management.field.readCommunity.tooltip",
                defaultMessage: `### Community String

When using the v2c protocol, a community string must be set up for the connection authentication between the third-party monitoring platform and this platform.`,
              })}
            </ReactMarkdown>
          }
          size="m"
        />
      ) : (
        <>
          <InputField
            form={form}
            name="userName"
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            required
            size="m"
          />

          <SwitchField
            form={form}
            name="authAlgorithmSwitch"
            label={intl.formatMessage({
              id: "user.authentication",
              defaultMessage: "User Authentication",
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "snmp.management.field.authAlgorithmSwitch.tooltip",
                  defaultMessage: `### User Authentication
1. When using the v3 protocol, you can choose to enable user authentication for secure communication between this platform and the 3rd-party monitoring platform. Authentication agreements like SHA and MD5 are supported.
2. To reduce security risks, it is recommended to enable user authentication.`,
                })}
              </ReactMarkdown>
            }
          />

          {authAlgorithmSwitch && (
            <ZSVForm.Card showLine>
              <FieldStack>
                <SelectField
                  form={form}
                  name="authAlgorithm"
                  label={intl.formatMessage({
                    id: "authentication.protocol",
                    defaultMessage: "Protocol",
                  })}
                  options={authAlgorithmOptions}
                  size="m"
                  labelClassName="w-[148px]"
                />
                <InputPasswordField
                  form={form}
                  name="authPassword"
                  label={intl.formatMessage({
                    id: "authentication.password",
                    defaultMessage: "Password",
                  })}
                  required
                  size="m"
                  labelClassName="w-[148px]"
                />
                <InputPasswordField
                  form={form}
                  name="confirmAuthPassword"
                  label={intl.formatMessage({
                    id: "confirm.authentication.password",
                    defaultMessage: "Confirm Password",
                  })}
                  required
                  maxLength={255}
                  size="m"
                  labelClassName="w-[148px]"
                />
              </FieldStack>
            </ZSVForm.Card>
          )}

          <SwitchField
            form={form}
            name="privacyAlgorithmSwitch"
            label={intl.formatMessage({
              id: "data.encryption",
              defaultMessage: "Data Encryption",
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "snmp.management.field.privacyAlgorithmSwitch.tooltip",
                  defaultMessage: `### Data Encryption

1. When using the v3 protocol, you can choose to encrypt the communication messages between this platform and the 3rd-party monitoring platform. Encryption agreements like AES and DES are supported.
2. Data encryption can only be enabled after user authentication is enabled.`,
                })}
              </ReactMarkdown>
            }
            disabled={!authAlgorithmSwitch}
            disabledTooltip={intl.formatMessage({
              id: "snmp.management.field.privacyAlgorithmSwitch.disabled.tooltip",
              defaultMessage: "Enable User Authentication before you can enable Data Encryption.",
            })}
            rowClassName="mt-3"
          />

          {privacyAlgorithmSwitch && (
            <ZSVForm.Card showLine>
              <FieldStack>
                <SelectField
                  form={form}
                  name="privacyAlgorithm"
                  label={intl.formatMessage({
                    id: "encryption.protocol",
                    defaultMessage: "Protocol",
                  })}
                  options={privacyAlgorithmOptions}
                  size="m"
                  labelClassName="w-[148px]"
                />
                <InputPasswordField
                  form={form}
                  name="privacyPassword"
                  label={intl.formatMessage({
                    id: "encryption.password",
                    defaultMessage: "Password",
                  })}
                  required
                  size="m"
                  labelClassName="w-[148px]"
                />
                <InputPasswordField
                  form={form}
                  name="confirmPrivacyPassword"
                  label={intl.formatMessage({
                    id: "confirm.encryption.password",
                    defaultMessage: "Confirm Password",
                  })}
                  required
                  maxLength={255}
                  size="m"
                  labelClassName="w-[148px]"
                />
              </FieldStack>
            </ZSVForm.Card>
          )}
        </>
      )}
    </FieldStack>
  );
};

const BasicConfig: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  return (
    <ZSVForm.Card
      title={intl.formatMessage({
        id: "basic.config",
        defaultMessage: "Basic Configuration",
      })}
    >
      <Config form={form} />
    </ZSVForm.Card>
  );
};

export default BasicConfig;
