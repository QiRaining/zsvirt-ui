import { Form } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import IpRuleTextArea from "./ip-rule-text-area";
import { useIpRuleValidators } from "./validator";

import style from "../style.module.less";

export default function IpRuleBulkEdit() {
  const intl = useIntl();
  const { ipRuleBulkEditValidator } = useIpRuleValidators(intl);
  return (
    <>
      <Form.Item noStyle name="rule" rules={[ipRuleBulkEditValidator]}>
        <IpRuleTextArea />
      </Form.Item>
      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.rule !== curr.rule}>
        {({ getFieldValue }) => (
          <div className={style.description}>
            {intl.formatMessage(
              {
                id: "virtualization.accessControlRule.ip.num",
                defaultMessage: "Input {num} IP addresses.",
              },
              {
                num:
                  getFieldValue("rule")?.filter(
                    (item?: string) => !!item?.trim(),
                  ).length ?? 0,
              },
            )}
          </div>
        )}
      </Form.Item>
    </>
  );
}
