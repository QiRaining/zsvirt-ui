import { Form } from "@zstack/zsphere-components";
import type { FormInstance, Rule } from "antd/es/form";
import React, { useEffect, useMemo } from "react";

import styles from "./style.module.less";

export interface FieldData {
  name: number;
  key: number;
  fieldKey: number;
}

export interface Operation {
  add: (defaultValue?: any) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
}

export interface FormListProps {
  name: string | number | (string | number)[];
  children: (
    fields: FieldData[],
    operation: Operation,
    error: any,
  ) => React.ReactNode;
  required?: boolean;
  rules?: Rule[];
  message?: string;
  form?: FormInstance;
  dependencies?: (string | number)[];
}

export default function FormListWithRequired({
  required,
  message,
  rules = [],
  form,
  dependencies,
  ...rest
}: FormListProps) {
  const namePathArray = Array.isArray(rest.name) ? rest.name : [rest.name];
  const fakeNamePathStr = `__fake_${namePathArray.join("_")}`;

  useEffect(() => {
    if (dependencies) {
      const namepath = dependencies.slice(0, dependencies.length - 1);

      form?.setFields([
        {
          name: [...namepath, fakeNamePathStr],
          touched: true,
        },
      ]);
    } else {
      form?.setFields([{ name: fakeNamePathStr, touched: true }]);
    }
  }, [form, fakeNamePathStr]);

  const _rules = useMemo(() => {
    if (required) {
      return rules.concat([
        ({ getFieldValue }) => ({
          validator() {
            const dependenciesVal = getFieldValue(
              dependencies ?? namePathArray,
            );

            return dependenciesVal && dependenciesVal.length
              ? Promise.resolve()
              : Promise.reject(new Error(message || "Please select"));
          },
        }),
      ]);
    }
    return rules;
  }, []);

  return (
    <>
      <Form.List {...rest}>
        {(fields, options, error) =>
          rest?.children?.(
            fields,
            {
              ...options,
              remove(...params) {
                options.remove(...params);

                form?.validateFields([
                  dependencies
                    ? [
                        ...dependencies.slice(0, dependencies.length - 1),
                        fakeNamePathStr,
                      ]
                    : [fakeNamePathStr],
                ]);
              },
              add(...params) {
                options.add(...params);

                form?.validateFields([
                  dependencies
                    ? [
                        ...dependencies.slice(0, dependencies.length - 1),
                        fakeNamePathStr,
                      ]
                    : [fakeNamePathStr],
                ]);
              },
            },
            error,
          )
        }
      </Form.List>

      {_rules?.length ? (
        <Form.Item
          dependencies={dependencies ? undefined : namePathArray}
          name={
            dependencies
              ? [
                  ...dependencies.slice(1, dependencies.length - 1),
                  fakeNamePathStr,
                ]
              : fakeNamePathStr
          }
          className={styles["form-list-error-item"]}
          preserve={false}
          rules={_rules}
        >
          <span style={{ display: "none" }} />
        </Form.Item>
      ) : null}
    </>
  );
}
