import { Button, RadioGroup } from "@zstack/design";
import { Form, Input } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormCreateType } from "@zstack/zsphere-types";
import type { IRandomWordParams } from "@zstack/zsphere-utils";
import { randomWord } from "@zstack/zsphere-utils";
import { useControllableValue } from "ahooks";
import type { PasswordProps } from "antd/lib/input";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

// Style constants
const INPUT_WIDTH_236_STYLE = { width: 236 } as const;
const MARGIN_TOP_16_STYLE = { marginTop: 16 } as const;
const INPUT_WIDTH_320_STYLE = { width: 320 } as const;

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
}

const { Item } = Form;

interface IRandomPasswordProps extends PasswordProps {
  randomConfig?: IRandomWordParams;
}

export const RandomPassword: React.FC<IRandomPasswordProps> = ({
  randomConfig,
  ...props
}) => {
  const intl = useIntl();

  const [, onChange] = useControllableValue(props);

  return (
    <div className={styles.randomPassword}>
      <Input.Password
        style={INPUT_WIDTH_236_STYLE}
        autoComplete="new-password"
        {...props}
      />
      <Button
        onClick={() => randomConfig && onChange?.(randomWord(randomConfig))}
        className={styles.button}
      >
        {intl.formatMessage({
          id: "randomGenerator",
          defaultMessage: "Generate",
        })}
      </Button>
    </div>
  );
};

const LoginAccess: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  const [loginTypeRadioValue, setLoginTypeRadioValue] = useState("none");

  const { isRequired } = useValidator(intl);

  return (
    <div className={styles.content}>
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          return pre.guest !== cur.guest;
        }}
      >
        {() => {
          const guest = form.getFieldValue("guest");

          return (
            <Item name="loginType">
              <RadioGroup
                value={loginTypeRadioValue}
                onValueChange={(value) => setLoginTypeRadioValue(value)}
                options={[
                  {
                    value: "none",
                    label: intl.formatMessage({
                      id: "virtualization.create.instance.loginType.createType.none",
                      defaultMessage: "None",
                    }),
                  },
                  {
                    value: "password",
                    label: intl.formatMessage({
                      id: "virtualization.create.instance.loginType.createType.password",
                      defaultMessage: "Password",
                    }),
                  },
                  ...(guest !== "Windows"
                    ? [
                        {
                          value: "sshkey",
                          label: intl.formatMessage({
                            id: "virtualization.create.instance.loginType.createType.sshkey",
                            defaultMessage: "SSH Key",
                          }),
                        },
                      ]
                    : []),
                ]}
              />
            </Item>
          );
        }}
      </Item>

      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          return pre.loginType !== cur.loginType || pre.guest !== cur.guest;
        }}
      >
        {() => {
          const type = form.getFieldValue(`loginType`);
          const guest = form.getFieldValue("guest");

          if (type === "password") {
            return (
              <>
                <Item
                  name="loginName"
                  label={intl.formatMessage({
                    id: "virtualization.login.access.loginName",
                    defaultMessage: "Username",
                  })}
                >
                  <span>{guest === "Windows" ? "Administrator" : "root"}</span>
                </Item>
                <Item
                  name="rootPassword"
                  label={intl.formatMessage({
                    id: "virtualization.login.access.password",
                    defaultMessage: "Password",
                  })}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "zsv.login.access.password.tooltip",
                        defaultMessage: `### Password
1. For Linux VMs:
    * The fixed username is root. After you set a password, you can SSH to a running VM by using the password.
    * Before you set a password, make sure that Cloud-Init is installed for the VM image. Recommended Cloud-Init versions: 0.7.9, 17.1, 19.4, 19.4, and later.
    * If a VM runs CentOS, you can install Cloud-Init by running the yum install cloud-init command.
2. For Windows VMs:
    * The fixed username is administrator. After you set a password, you can log in to a running VM by using the password.
    * Before you set a login password, make sure that Cloudbase-Init is installed for the VM image. Recommended Cloudbase-Init version: 0.9.11.
    * For more information about how to install Cloudbase-Init, see [Cloudbase official documentation](https://cloudbase.it/cloudbase-init/).
3. After you set the password, do not set it again via User Data to avoid conflicts of duplicate operations.
4. If you set the password, the password is displayed on User Data of the VM details page. Secure your password as needed.`,
                      })}
                    </ReactMarkdown>
                  }
                  rules={[isRequired()]}
                  description={
                    <div style={MARGIN_TOP_16_STYLE}>
                      {intl.formatMessage({
                        id: "virtualization.vm.field.password.tips.info",
                        defaultMessage:
                          "Before you set a password, make sure that Cloud-Init is installed for the VM image.",
                      })}{" "}
                    </div>
                  }
                >
                  <RandomPassword
                    randomConfig={{
                      randomFlag: true,
                      min: 6,
                      max: 8,
                      isWindow: false,
                    }}
                  />
                </Item>
              </>
            );
          }

          if (type === "sshkey") {
            return (
              <Item
                name="sshkey"
                label={intl.formatMessage({
                  id: "virtualization.login.access.sshkey",
                  defaultMessage: "SSH key",
                })}
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "zsv.login.access.sshkey.tooltip",
                      defaultMessage: `Injecting Specified Virtual Machine SSH Public Key to Support Password-Free Login.\\n\\n1. Generate SSH public key by running the ssh-keygen command in the specified virtual machine console and save it at ~/.ssh/id_rsa.pub.\\n2. Ensure that the virtual machine image has cloud-init installed, recommended versions: 7.9, 17.1, 19.4 or later.\\n3. After cloud-init installation, set the ssh_pwauth option to \\"1\\" in /etc/cloud/cloud.cfg to enable SSH password authentication.`,
                    })}
                  </ReactMarkdown>
                }
                rules={[isRequired()]}
                description={
                  <div style={MARGIN_TOP_16_STYLE}>
                    {intl.formatMessage({
                      id: "virtualization.vm.field.sshPublicKey.tips.info",
                      defaultMessage: "Before you inject the SSH public key of a VM, make sure that cloud-init is installed on the VM image.",
                    })}
                  </div>
                }
              >
                <Input style={INPUT_WIDTH_320_STYLE} />
              </Item>
            );
          }

          return null;
        }}
      </Item>
    </div>
  );
};

export default React.memo(LoginAccess);
