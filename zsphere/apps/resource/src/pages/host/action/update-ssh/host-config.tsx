import { InputField, InputPasswordField } from "@zstack/form";
import type { FC } from "react";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import type { UpdateHostSshInfoFormValues } from "../schema";

interface HostConfigProps {
  form: UseFormReturn<UpdateHostSshInfoFormValues>;
}

const HostConfig: FC<HostConfigProps> = ({ form }) => {
  const intl = useIntl();

  return (
    <>
      <InputField
        form={form}
        name="managementIp"
        label={intl.formatMessage({ id: "ipAdress", defaultMessage: "IP Address" })}
        inputTooltip={intl.formatMessage(
          {
            id: "host.field.hostIp.hover",
            defaultMessage: "Sample: {ip}",
          },
          {
            ip: "192.168.0.100",
          },
        )}
        required
        size="m"
      />
      <InputField
        form={form}
        label={intl.formatMessage({ id: "sshPort", defaultMessage: "SSH Port" })}
        name="sshPort"
        required
        className="w-20"
      />
      <InputField
        form={form}
        label={intl.formatMessage({
          id: "ssh.username",
          defaultMessage: "SSH Username",
        })}
        name="username"
        required
        size="m"
      />

      <InputPasswordField
        form={form}
        label={intl.formatMessage({
          id: "ssh.password",
          defaultMessage: "SSH Password",
        })}
        name="password"
        required
        size="m"
      />
    </>
  );
};

export default HostConfig;
