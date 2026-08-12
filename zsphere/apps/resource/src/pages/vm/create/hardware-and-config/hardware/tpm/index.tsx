import { Form, State } from "@zstack/zsphere-components";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

interface TpmCardProps {
  form: any;
}

const { Item } = Form;

const TpmCard: React.FC<TpmCardProps> = ({ form }) => {
  const intl = useIntl();

  useEffect(() => {
    form.setFieldsValue({ tpmEnabled: true });
  }, [form]);

  return (
    <div>
      <Item
        label={intl.formatMessage({
          id: "tpm.field.enabled",
          defaultMessage: "Trusted Platform Module",
        })}
        name="tpmEnabled"
      >
        <State
          name={intl.formatMessage({
            id: "tpm.status.added",
            defaultMessage: "Added",
          })}
          prefix="dot"
          type="running"
        />
      </Item>

      <Item
        label={intl.formatMessage({
          id: "tpm.field.version",
          defaultMessage: "TPM Spec",
        })}
        name="tpmVersion"
      >
        2.0
      </Item>
    </div>
  );
};

export default React.memo(TpmCard);
