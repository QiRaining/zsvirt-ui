import { ZSVForm } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

const { Card } = ZSVForm;

const FunctionIntroCard: React.FC = React.memo(() => {
  const intl = useIntl();

  return (
    <Card
      title={intl.formatMessage({
        id: "migration.function.introduction",
        defaultMessage: "Overview",
      })}
    >
      <div>
        {intl.formatMessage({
          id: "migration.function.introduction.content",
          defaultMessage:
            "The migration service enables complete migration of virtual machine systems and data from other virtualization platforms to the current platform. Supported source platforms include VMware vSphere and other KVM-based cloud platforms. A step-by-step wizard guides you through the end-to-end migration process.",
        })}
      </div>
    </Card>
  );
});

export default FunctionIntroCard;
