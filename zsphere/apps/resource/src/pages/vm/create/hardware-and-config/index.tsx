import { Icon } from "@zstack/icon";
import { Form, ZSVForm } from "@zstack/zsphere-components";
import type { FormInstance } from "antd";
import { includes } from "lodash-es";
import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useIntl } from "react-intl";

import { fieldsNeedsValidateInBasic } from "../basic-config";
import AdvanceConfig, { fieldsNeedsValidateInConfig } from "./config";
import HardwareInfo from "./hardware";

interface IProps {
  form: FormInstance;
  visible?: boolean;
}

const { Item } = Form;

const notValidatefields = [
  ...fieldsNeedsValidateInBasic,
  ...fieldsNeedsValidateInConfig,
];

const STYLE_ALERT_ICON = {
  display: "block",
  color: "var(--danger-500)",
} as const;
const STYLE_ALARM_ICON = { marginLeft: 4, color: "var(--danger-500)" } as const;

const AlertIcon: React.FC<IAlertProps> = ({ form }) => {
  const [visible, setVisible] = useState(true);
  const isValidatingRef = useRef(false);
  const lastFormValuesHashRef = useRef<string>("");

  // 使用 Form.useWatch 来监听表单值变化
  const formValues = Form.useWatch([], form);

  // 创建一个稳定的哈希值来检测真正的值变化
  // 只比较需要验证的字段，避免不必要的触发
  const formValuesHash = useMemo(() => {
    if (!formValues) {
      return "";
    }
    try {
      // 只取需要验证的字段的值
      const relevantValues: Record<string, unknown> = {};
      Object.keys(formValues).forEach((key) => {
        if (!key.match(/^ipv(4|6)-/) && !includes(notValidatefields, key)) {
          relevantValues[key] = formValues[key];
        }
      });
      return JSON.stringify(relevantValues);
    } catch {
      return "";
    }
  }, [formValues]);

  const doValidate = useCallback(async () => {
    if (isValidatingRef.current) {
      return;
    }

    // 如果哈希值没有变化，不执行验证
    if (formValuesHash === lastFormValuesHashRef.current) {
      return;
    }
    lastFormValuesHashRef.current = formValuesHash;

    isValidatingRef.current = true;

    //异步校验可能会一直触发，这里的校验先把特殊的给过滤掉，比如：网卡-IP地址

    const formFields = Object.keys(form.getFieldsValue());

    const fieldsNeedsValidate = formFields.filter(
      (t) => !t.match(/^ipv(4|6)-/) && !includes(notValidatefields, t),
    );

    const submitting = form.getFieldValue("_submitting");
    if (submitting) {
      await submitting;
    }

    await form
      .validateFields(fieldsNeedsValidate)
      .then(() => {
        setVisible(false);
      })
      .catch((errorInfo: any) => {
        const visibleFlag =
          errorInfo.errorFields.filter(
            (t: any) => !includes(notValidatefields, t.name?.[0]),
          )?.length !== 0;

        setVisible(visibleFlag);
      })
      .finally(() => {
        isValidatingRef.current = false;
      });
  }, [form, formValuesHash]);

  useEffect(() => {
    doValidate();
  }, [doValidate]);

  if (!visible) {
    return null;
  }

  return <Icon style={STYLE_ALERT_ICON} type="alert-triangle-fill" />;
};

const AdvancePart: React.FC<IProps> = ({ form, visible }) => {
  const intl = useIntl();

  return (
    <Item noStyle shouldUpdate={(prev: any, curr: any) => prev !== curr}>
      {() => {
        return (
          <ZSVForm.Tabs
            tabs={[
              {
                key: "hardware",
                title: intl.formatMessage({
                  id: "virtualization.hardware.info",
                  defaultMessage: "Hardware Info",
                }),
                titleAlarm: <AlertIcon form={form} />,
                content: <HardwareInfo form={form} visible={visible} />,
              },
              {
                key: "config",
                title: (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {intl.formatMessage({
                      id: "virtualization.advance.setting",
                      defaultMessage: "Advanced Settings",
                    })}
                    <Form.Item noStyle shouldUpdate>
                      {({ getFieldsError }: any) => {
                        return (
                          getFieldsError().find(
                            (item: any) =>
                              !!item?.errors?.length &&
                              fieldsNeedsValidateInConfig.includes(
                                item.name[0].toString(),
                              ),
                          ) && (
                            <Icon style={STYLE_ALARM_ICON} type="alert-triangle-fill" />
                          )
                        );
                      }}
                    </Form.Item>
                  </div>
                ),
                content: <AdvanceConfig form={form} />,
              },
            ]}
          />
        );
      }}
    </Item>
  );
};

export default React.memo(AdvancePart);
