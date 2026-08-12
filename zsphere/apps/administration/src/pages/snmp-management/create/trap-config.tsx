import { ZSVForm } from "@zstack/zsphere-components";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import { SnmpTrapFormItem } from "../../snmp-trap/create";
import type { CreateSnmpManagementFormValues } from "./schema";

interface IProps {
  form: UseFormReturn<CreateSnmpManagementFormValues>;
}

const TrapConfig: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  return (
    <ZSVForm.Card
      title={intl.formatMessage({
        id: "trap.config",
        defaultMessage: "Receiver Configuration",
      })}
    >
      <SnmpTrapFormItem form={form} />
    </ZSVForm.Card>
  );
};

export default TrapConfig;
