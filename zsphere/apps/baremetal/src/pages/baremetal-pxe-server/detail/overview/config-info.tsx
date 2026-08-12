import { Field, Card } from "@zstack/zsphere-components";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IBaremetalPxeServer;
}

const BasicInfo: FC<IProps> = ({ detail }) => {
  const intl = useIntl();

  return (
    <Card
      title={intl.formatMessage({
        id: "info.config",
        defaultMessage: "More Info",
      })}
    >
      <Field
        copyable
        ellipsis={true}
        label={intl.formatMessage({
          id: "UUID",
          defaultMessage: "UUID",
        })}
      >
        {detail?.uuid}
      </Field>
    </Card>
  );
};

export default BasicInfo;
