import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input, Form } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { AccessControlRuleType } from "@zstack/zsphere-types";
import { Form as AntForm } from "antd";
import { useIntl } from "react-intl";

import { useIpRuleValidators } from "./validator";

import style from "../style.module.less";

export default function IpRuleListEdit() {
  const form = Form.useFormInstance();
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const { maxRuleCount, ipRuleListEditValidator } = useIpRuleValidators(intl);
  return (
    <Form.List name="rule" rules={[ipRuleListEditValidator]}>
      {(fields, { add, remove }, { errors }) => {
        const listError = (errors[0] as any)?.list;
        const fieldError = (errors[0] as any)?.field ?? {};
        return (
          <>
            {fields.map((field) => (
              <Form.Item
                key={field.key}
                className={style.ipInputWrapper}
                validateStatus={fieldError[field.name] && "error"}
                help={fieldError[field.name]}
              >
                <Form.Item {...field} noStyle rules={[isRequired()]}>
                  <Input
                    className={style["width-320"]}
                    onChange={() => form?.validateFields(["rule"])}
                  />
                </Form.Item>
                {fields.length > 1 && (
                  <Icon
                    className={style.trash}
                    type="trash"
                    onClick={() => remove(field.name)}
                  />
                )}
              </Form.Item>
            ))}
            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) =>
                prev.controlStrategy !== curr.controlStrategy
              }
            >
              {({ getFieldValue }) => (
                <Button
                  variant="link"
                  className={style.addBtn}
                  icon={<Icon type="plus" />}
                  onClick={() => add()}
                >
                  {getFieldValue("controlStrategy") ===
                  AccessControlRuleType.REJECT
                    ? intl.formatMessage({
                        id: "add.ip.blacklist",
                        defaultMessage: "Add IP Blocklist",
                      })
                    : intl.formatMessage({
                        id: "add.ip.whitelist",
                        defaultMessage: "Add IP Allowlist",
                      })}
                  {` (${fields.length}/${maxRuleCount})`}
                </Button>
              )}
            </Form.Item>
            <AntForm.ErrorList errors={listError ? [listError] : []} />
          </>
        );
      }}
    </Form.List>
  );
}
