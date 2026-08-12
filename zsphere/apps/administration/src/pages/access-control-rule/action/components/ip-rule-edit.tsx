import { RadioGroup } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import IpRuleBulkEdit from "./ip-rule-bulk-edit";
import IpRuleListEdit from "./ip-rule-list-edit";

export enum InputType {
  Individually = "Individually",
  InBulk = "InBulk",
}

const STYLE_MARGIN_TOP_NEGATIVE_9 = { marginTop: -9 } as const;

export default function IpRuleEdit() {
  const intl = useIntl();
  return (
    <>
      <Form.Item
        name="inputType"
        label={intl.formatMessage({
          id: "virtualization.accessControlRule.ip",
          defaultMessage: "IP Address",
        })}
        required
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.accessControlRule.field.ip.adress.tooltip",
              defaultMessage:
                "### IP Address\nSupport input fixed IP address, IP address range, or IP/mask format, with multiple inputs separated by commas.",
            })}
          </ReactMarkdown>
        }
      >
        <RadioGroup
          options={[
            {
              value: InputType.Individually,
              label: intl.formatMessage({
                id: "add.individually",
                defaultMessage: "Add Individually",
              }),
            },
            {
              value: InputType.InBulk,
              label: intl.formatMessage({
                id: "add.in.bulk",
                defaultMessage: "Add in Bulk",
              }),
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        label=" "
        style={STYLE_MARGIN_TOP_NEGATIVE_9}
        shouldUpdate={(prev, curr) => prev.inputType !== curr.inputType}
      >
        {({ getFieldValue }) =>
          getFieldValue("inputType") === InputType.Individually ? (
            <IpRuleListEdit />
          ) : (
            <IpRuleBulkEdit />
          )
        }
      </Form.Item>
    </>
  );
}
