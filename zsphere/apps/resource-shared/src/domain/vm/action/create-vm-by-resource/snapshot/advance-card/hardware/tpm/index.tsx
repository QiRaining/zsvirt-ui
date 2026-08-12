import { Form, Radio } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

export enum TpmConfigMethodEnum {
  Retain = "Retain",
  Reset = "Reset",
}

interface TpmCardProps {
  form: any;
}

const { Item } = Form;

const TpmCard: React.FC<TpmCardProps> = () => {
  const intl = useIntl();

  return (
    <div>
      <Item
        label={intl.formatMessage({
          id: "tpm.config.method",
          defaultMessage: "TPM Configuration",
        })}
        name="tpmConfigMethod"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.clone.field.tpmConfigMethod.tooltip",
              defaultMessage: `### TPM Configuration

Select how TPM devices are handled during the clone operation:

- Retain: The cloned VM retains the TPM information from the source VM.
- Reset: The system creates a new TPM for the cloned VM using the default key provider.`,
            })}
          </ReactMarkdown>
        }
      >
        <Radio.Group>
          <Radio value={TpmConfigMethodEnum.Retain}>
            {intl.formatMessage({
              id: "tpm.config.method.retain",
              defaultMessage: "Retain",
            })}
          </Radio>
          <Radio value={TpmConfigMethodEnum.Reset}>
            {intl.formatMessage({
              id: "tpm.config.method.reset",
              defaultMessage: "Reset",
            })}
          </Radio>
        </Radio.Group>
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
