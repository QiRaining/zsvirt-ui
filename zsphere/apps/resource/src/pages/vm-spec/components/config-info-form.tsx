import { RadioGroup } from "@zstack/design";
import { ZSVForm, Form, Input, Switch } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { DomainMode, VmSpecPlatform } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import PasswordField from "./password-field";
import {
  HostnameConfigType,
  validateAdminPassword,
  validateDomainName,
  validateDomainUsername,
  validateOrganization,
  validateWorkgroupName,
} from "./utils";

import style from "./style.module.less";

const STYLE_HOSTNAME_HINT = { position: "relative", top: -4 } as const;

export interface IProps {
  name?: string;
  platform?: VmSpecPlatform;
  showResetPasswd?: boolean;
  showLinuxHostnameHint?: boolean;
}

export default function ConfigInfoForm({
  name = "vmSpecConfig",
  platform,
  showResetPasswd,
  showLinuxHostnameHint,
}: IProps) {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  return (
    <>
      {platform === VmSpecPlatform.Windows && (
        <>
          <Form.Item
            name={[name, "domainMode"]}
            label={intl.formatMessage({
              id: "vm.spec.workgroup.or.domain",
              defaultMessage: "Workgroup or Domain",
            })}
            initialValue={DomainMode.WorkGroup}
            preserve={false}
          >
            <RadioGroup
              options={[
                {
                  value: DomainMode.WorkGroup,
                  label: intl.formatMessage({
                    id: "vm.spec.workgroup",
                    defaultMessage: "Workgroup",
                  }),
                },
                {
                  value: DomainMode.Domain,
                  label: intl.formatMessage({
                    id: "vm.spec.windows.domain.server",
                    defaultMessage: "Windows Domain Server",
                  }),
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) =>
              prev[name]?.domainMode !== curr[name]?.domainMode
            }
          >
            {({ getFieldValue }) => {
              const domainMode = getFieldValue([name, "domainMode"]);
              return (
                <ZSVForm.Card showLine className={style.card}>
                  {domainMode === DomainMode.Domain ? (
                    <>
                      <Form.Item
                        name={[name, DomainMode.Domain, "domainName"]}
                        label={intl.formatMessage({
                          id: "vm.spec.domain.name",
                          defaultMessage: "Domain",
                        })}
                        initialValue=""
                        preserve={false}
                        required
                        rules={[
                          isRequired(),
                          {
                            validator: (_, value) =>
                              validateDomainName(value, intl),
                          },
                        ]}
                      >
                        <Input className="width-320" />
                      </Form.Item>
                      <Form.Item
                        name={[name, DomainMode.Domain, "domainUsername"]}
                        label={intl.formatMessage({
                          id: "vm.spec.domain.username",
                          defaultMessage: "Domain Username",
                        })}
                        initialValue=""
                        preserve={false}
                        required
                        rules={[
                          isRequired(),
                          {
                            validator: (_, value) =>
                              validateDomainUsername(value, intl),
                          },
                        ]}
                      >
                        <Input className="width-320" />
                      </Form.Item>
                      <PasswordField
                        name={[name, DomainMode.Domain, "domainPassword"]}
                        label={intl.formatMessage({
                          id: "vm.spec.domain.password",
                          defaultMessage: "Domain Password",
                        })}
                        required={showResetPasswd}
                        rules={showResetPasswd ? [isRequired()] : []}
                        resetPasswordLabel={
                          showResetPasswd
                            ? intl.formatMessage({
                                id: "vm.spec.edit.reset.domain.password",
                                defaultMessage: "Reset Domain Password",
                              })
                            : null
                        }
                      />
                      <Form.Item
                        name={[name, DomainMode.Domain, "organization"]}
                        label={intl.formatMessage({
                          id: "vm.spec.organization",
                          defaultMessage: "OU",
                        })}
                        tooltip={intl.formatMessage({
                          id: "vm.spec.organization.tooltip.example",
                          defaultMessage:
                            "Example: OU=MyOU,DC=MyDom,DC=MyCompany,DC=com",
                        })}
                        initialValue=""
                        preserve={false}
                        rules={[
                          {
                            validator: (_, value) =>
                              validateOrganization(value, intl),
                          },
                        ]}
                      >
                        <Input className="width-320" />
                      </Form.Item>
                      <Form.Item
                        label={intl.formatMessage({
                          id: "vm.spec.generate.new.sid",
                          defaultMessage: "Generate New SID",
                        })}
                      >
                        <Switch disabled checked />
                      </Form.Item>
                    </>
                  ) : (
                    <>
                      <Form.Item
                        name={[name, DomainMode.WorkGroup, "domainName"]}
                        label={intl.formatMessage({
                          id: "vm.spec.workgroup.name",
                          defaultMessage: "Workgroup Name",
                        })}
                        initialValue="WORKGROUP"
                        preserve={false}
                        required
                        rules={[
                          isRequired(),
                          {
                            validator: (_, value) =>
                              validateWorkgroupName(value, intl),
                          },
                        ]}
                      >
                        <Input className="width-320" />
                      </Form.Item>
                      <Form.Item
                        name={[name, DomainMode.WorkGroup, "generateSID"]}
                        label={intl.formatMessage({
                          id: "vm.spec.generate.new.sid",
                          defaultMessage: "Generate New SID",
                        })}
                        initialValue={false}
                        preserve={false}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </>
                  )}
                </ZSVForm.Card>
              );
            }}
          </Form.Item>
        </>
      )}
      <Form.Item
        name={[name, "hostnameConfigType"]}
        label={intl.formatMessage({
          id: "vm.spec.hostname.config.type",
          defaultMessage: "Specify Hostname",
        })}
        initialValue={HostnameConfigType.fromVm}
        preserve={false}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.spec.hostname.config.type.tooltip",
              defaultMessage:
                "### Specify Hostname\n\nWhen you use the virtual machine name as the hostname, the name will be truncated if it exceeds specific character limits.\n\n- For Linux VMs, the name will be truncated if it exceeds 60 characters.\n- For Windows VMs, the name will be truncated if it exceeds 15 characters.",
            })}
          </ReactMarkdown>
        }
        description={
          showLinuxHostnameHint && platform === VmSpecPlatform.Linux ? (
            <div style={STYLE_HOSTNAME_HINT}>
              {intl.formatMessage({
                id: "vm.spec.hostname.linux.description",
                defaultMessage:
                  "For Linux VMs, if the hostname contains Chinese characters, this setting will not take effect.",
              })}
            </div>
          ) : null
        }
      >
        <RadioGroup
          options={[
            {
              value: HostnameConfigType.fromVm,
              label: intl.formatMessage({
                id: "vm.spec.hostname.config.type.from.vm.name",
                defaultMessage: "Use the VM Name",
              }),
            },
            {
              value: HostnameConfigType.manual,
              label: intl.formatMessage({
                id: "vm.spec.hostname.config.type.manual",
                defaultMessage: "Enter a Name",
              }),
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev[name]?.hostnameConfigType !== curr[name]?.hostnameConfigType
        }
      >
        {({ getFieldValue }) => {
          const hostnameConfigType = getFieldValue([
            name,
            "hostnameConfigType",
          ]);
          return (
            hostnameConfigType === HostnameConfigType.manual && (
              <Form.Item
                name={[name, "hostname"]}
                label={intl.formatMessage({
                  id: "vm.spec.hostname",
                  defaultMessage: "Hostname",
                })}
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "vm.spec.hostname.into.tooltip",
                      defaultMessage:
                        "### Hostname\n\nLinux hostname\n\n- Length: 2–60 characters.\n- Allowed characters: Uppercase and lowercase letters, numbers, and hyphens (-).\n- Restrictions:\n  - No consecutive hyphens.\n  - Cannot start or end with a hyphen.\n\nWindows hostname\n\n- Length: 2–15 characters.\n- Allowed characters: Uppercase and lowercase letters, numbers, and hyphens (-).\n- Restrictions:\n  - No consecutive hyphens.\n  - Cannot start or end with a hyphen.\n  - Cannot be all numbers.\n\nNote: When creating multiple VMs at once, a suffix (-1, -2, -3, etc.) is automatically appended to ensure uniqueness.",
                    })}
                  </ReactMarkdown>
                }
                initialValue=""
                preserve={false}
                required
                rules={[isRequired()]}
              >
                <Input className="width-320" />
              </Form.Item>
            )
          );
        }}
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev[name]?.domainMode !== curr[name]?.domainMode ||
          prev[name]?.[DomainMode.WorkGroup]?.generateSID !==
            curr[name]?.[DomainMode.WorkGroup]?.generateSID
        }
      >
        {({ getFieldValue }) => {
          const domainMode = getFieldValue([name, "domainMode"]);
          const generateSID = getFieldValue([
            name,
            DomainMode.WorkGroup,
            "generateSID",
          ]);
          const required =
            showResetPasswd ||
            (platform === VmSpecPlatform.Windows &&
              (domainMode === DomainMode.Domain || generateSID));

          return (
            <PasswordField
              name={[name, "adminPassword"]}
              label={intl.formatMessage({
                id: "vm.spec.admin.password",
                defaultMessage: "Administrator Password",
              })}
              required={required}
              rules={[
                ...(required ? [isRequired()] : []),
                { validator: (_, value) => validateAdminPassword(value, intl) },
              ]}
              resetPasswordLabel={
                showResetPasswd
                  ? intl.formatMessage({
                      id: "vm.spec.edit.reset.admin.password",
                      defaultMessage: "Reset Administrator Password",
                    })
                  : null
              }
            />
          );
        }}
      </Form.Item>
    </>
  );
}
