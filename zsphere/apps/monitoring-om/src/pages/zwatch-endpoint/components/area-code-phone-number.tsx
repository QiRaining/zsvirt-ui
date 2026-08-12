import { isPhoneNumber } from "@zstack/zsphere-utils";
import { Input, Form } from "antd";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

interface IProps {
  form: any;
  fieldName: number | string;
  parentName?: string;
}

interface AreaCodePhoneNumber {
  areaCode: string;
  phoneNumber: string;
}

const AreaCodePhoneNumberInput: React.FC<IProps> = ({
  form,
  fieldName,
  parentName,
}) => {
  const intl = useIntl();
  let rules = [
    {
      validator(rule: any, value: string) {
        if (!value) {
          return Promise.reject(
            intl.formatMessage({
              id: "zwatchEndpoint.field.phoneNumber.validator.required",
              defaultMessage: "This field is required.",
            }),
          );
        }
        if (!isPhoneNumber(value)) {
          return Promise.reject(
            intl.formatMessage({
              id: "zwatchEndpoint.field.phoneNumber.validator.format",
              defaultMessage: "Invalid phone number.",
            }),
          );
        }
        if (parentName === "atPersonPhoneNumbers") {
          const phoneNumbers =
            form.getFieldValue("addDingTalk")?.atPersonPhoneNumbers;
          const repeatNumbers = phoneNumbers?.filter(
            (it: AreaCodePhoneNumber) => it?.phoneNumber === value,
          );
          if (repeatNumbers?.length > 1) {
            return Promise.reject(
              intl.formatMessage({
                id: "zwatchEndpoint.field.phoneNumber.validator.repeat",
                defaultMessage: "Duplicated phone number.",
              }),
            );
          }
        }
        return Promise.resolve();
      },
    },
  ];
  if (parentName === "sms") {
    rules = [
      {
        validator(rule, value: string) {
          if (!value) {
            return Promise.reject(
              intl.formatMessage({
                id: "zwatch.endpoint.form.sms.address.validator.required",
                defaultMessage: "This field is required.",
              }),
            );
          }
          if (value && !isPhoneNumber(value)) {
            return Promise.reject(
              intl.formatMessage({
                id: "zwatch.endpoint.form.sms.address.validator.format",
                defaultMessage: "Invalid phone number.",
              }),
            );
          }
          return Promise.resolve();
        },
      },
    ];
  }

  return (
    <>
      <Form.Item
        name={[fieldName, "areaCode"]}
        validateTrigger="onBlur"
        rules={[
          {
            validator(rule, value: string) {
              if (!value) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "zwatchEndpoint.field.areaCode.validator.required",
                    defaultMessage: "Enter an international telephone code.",
                  }),
                );
              }
              if (!/^[1-9][0-9]{0,2}$/.test(value)) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "zwatchEndpoint.field.areaCode.validator.format",
                    defaultMessage: "Enter a valid international telephone code.",
                  }),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
        initialValue="86"
        className={style.addSmsAreaCode}
      >
        <Input prefix="+" />
      </Form.Item>
      <Form.Item
        name={[fieldName, "phoneNumber"]}
        validateTrigger="onBlur"
        rules={rules}
        className={style.addSmsPhoneNumber}
      >
        <Input />
      </Form.Item>
    </>
  );
};

export default AreaCodePhoneNumberInput;
