import { CodeEditor } from "@zstack/unifie";
import {
  Radio,
  Form,
  Select,
  TextArea,
  Icon,
  InputUnit,
  Input,
  Row,
  Col,
} from "@zstack/zsphere-components";
import type { FormInstance, IInputUnitProps } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { ImagePlatform, ScriptType } from "@zstack/zsphere-types";
import { isInteger as _isInteger } from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import type { IntlShape } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "../../../style.module.less";

export const validScriptTimeout = (value: number, intl: IntlShape) => {
  if (value >= 0 && _isInteger(value)) {
    return Promise.resolve();
  }
  return Promise.reject(
    intl.formatMessage({
      id: "script.field.scriptTimeout.validator.invalid",
      defaultMessage: "Enter an integer equal to or greater than 0.",
    }),
  );
};

export const useUnitList = (intl: IntlShape): IInputUnitProps["unitList"] => {
  return [
    {
      value: "second",
      displayName: intl.formatMessage({ id: "second", defaultMessage: " seconds" }),
    },
    {
      value: "minute",
      displayName: intl.formatMessage({
        id: "minute",
        defaultMessage: "minutes",
      }),
    },
    {
      value: "hour",
      displayName: intl.formatMessage({ id: "hour", defaultMessage: "hours" }),
    },
  ];
};

export const maxNumOfCustomParam: number = 20;

const platformOptions = [
  {
    value: ImagePlatform.Linux,
    name: "Linux",
    iconType: "linux",
  },
  {
    value: ImagePlatform.Windows,
    name: "Windows",
    iconType: "windows",
  },
];

interface IProps {
  form: FormInstance;
}

const BasicConfig: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { isRequired, commonNameRules, commonDescriptionRules, lengthRange } =
    useValidator(intl);

  const unitList = useUnitList(intl);

  const [scriptTypeList, setScriptTypeList] = useState<Array<string>>([
    ScriptType.Shell,
    ScriptType.Python,
    ScriptType.Perl,
  ]);

  // 最多可输入20个自定义参数

  useEffect(() => {
    const subscription = form.getFieldsValue();
    const platform = subscription.platform;
    if (platform === ImagePlatform.Linux) {
      setScriptTypeList([ScriptType.Shell, ScriptType.Python, ScriptType.Perl]);
      const currentScriptType = form.getFieldValue("scriptType");
      if (
        !currentScriptType ||
        ![ScriptType.Shell, ScriptType.Python, ScriptType.Perl].includes(
          currentScriptType,
        )
      ) {
        form.setFieldsValue({ scriptType: ScriptType.Shell });
        handleScriptContent(ScriptType.Shell);
      }
    } else if (platform === ImagePlatform.Windows) {
      setScriptTypeList([ScriptType.Bat, ScriptType.Powershell]);
      const currentScriptType = form.getFieldValue("scriptType");
      if (
        !currentScriptType ||
        ![ScriptType.Bat, ScriptType.Powershell].includes(currentScriptType)
      ) {
        form.setFieldsValue({ scriptType: ScriptType.Bat });
        handleScriptContent(ScriptType.Bat);
      }
    }
  }, [form.getFieldValue("platform")]);

  const handleScriptContent = (type: ScriptType) => {
    switch (type) {
      case ScriptType.Shell:
        form.setFieldsValue({ scriptContent: "#!/bin/bash" });
        break;
      case ScriptType.Python:
        form.setFieldsValue({ scriptContent: "#!/usr/bin/python" });
        break;
      case ScriptType.Perl:
        form.setFieldsValue({ scriptContent: "#!/usr/bin/Perl" });
        break;
      case ScriptType.Bat:
      case ScriptType.Powershell:
        form.setFieldsValue({ scriptContent: "" });
        break;
    }
  };

  return (
    <Form form={form} name="basicConfig">
      <div className={style.card}>
        <Form.Item
          name="name"
          label={intl.formatMessage({
            id: "name",
            defaultMessage: "Name",
          })}
          validateTrigger="onBlur"
          required
          rules={commonNameRules}
        >
          <Input className={style["width-320"]} />
        </Form.Item>
        <Form.Item
          name="description"
          label={intl.formatMessage({
            id: "description",
            defaultMessage: "Description",
          })}
          validateTrigger="onBlur"
          rules={commonDescriptionRules}
        >
          <TextArea
            rows={3}
            className={style["width-320"]}
            isShowLimit
            limit={256}
          />
        </Form.Item>
      </div>
      <div className={style.card}>
        <Form.Item
          name="platform"
          label={intl.formatMessage({
            id: "platformType",
            defaultMessage: "Platform Type",
          })}
          required
        >
          <Select
            className={style["width-160"]}
            onChange={(value) => {
              if (value === ImagePlatform.Linux) {
                setScriptTypeList([
                  ScriptType.Shell,
                  ScriptType.Python,
                  ScriptType.Perl,
                ]);
                form.setFieldsValue({ scriptType: ScriptType.Shell });
                handleScriptContent(ScriptType.Shell);
              } else if (value === ImagePlatform.Windows) {
                setScriptTypeList([ScriptType.Bat, ScriptType.Powershell]);
                form.setFieldsValue({ scriptType: ScriptType.Bat });
                handleScriptContent(ScriptType.Bat);
              }
            }}
          >
            {platformOptions
              ?.filter((it) =>
                [ImagePlatform.Linux, ImagePlatform.Windows].includes(
                  it?.value,
                ),
              )
              .map((it) => (
                <Select.Option key={it.value} value={it.value}>
                  <Icon
                    type={it.iconType as "linux" | "windows"}
                    color="neutral"
                  />
                  {it.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          required
          name="scriptType"
          label={intl.formatMessage({
            id: "scriptType",
            defaultMessage: "Script Type",
          })}
          description={
            form.getFieldValue("scriptType") === ScriptType.Powershell && (
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "script.field.scriptType.Powershell.description",
                  defaultMessage:
                    "If you fail to execute a Powershell script in a Windows 2008 VM instance, check the .NET runtime environment.",
                })}
              </ReactMarkdown>
            )
          }
        >
          <Radio.Group
            buttonStyle="solid"
            onChange={(e) => handleScriptContent(e.target.value)}
          >
            {scriptTypeList.map((v) => (
              <Radio.Button key={v} value={v}>
                {v}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="scriptContent"
          rules={[isRequired()]}
          label={intl.formatMessage({
            id: "scriptContent",
            defaultMessage: "Script Content",
          })}
          required
          description={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "script.field.scriptContent.description",
                defaultMessage:
                  "If you want to pass custom parameters, ensure that your script content follows Jinja2 template syntax.",
              })}
            </ReactMarkdown>
          }
        >
          <CodeEditor className="h-[400px] w-[600px]">
            <CodeEditor.Toolbar className="items-center justify-end px-[12px]">
              <CodeEditor.FullscreenPreview
                title={intl.formatMessage({
                  id: "scriptContent",
                  defaultMessage: "Script Content",
                })}
              />
            </CodeEditor.Toolbar>
          </CodeEditor>
        </Form.Item>
        <Form.Item
          name="scriptTimeout"
          label={intl.formatMessage({
            id: "scriptTimeout",
            defaultMessage: "Timeout Period",
          })}
          rules={[
            {
              validator: (rule, value) =>
                validScriptTimeout(value?.number, intl),
            },
          ]}
        >
          <InputUnit unitList={unitList} />
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const currenNum = getFieldValue("renderParams")?.length || 0;
            return (
              <Form.Item
                label={intl.formatMessage({
                  id: "customParam",
                  defaultMessage: "Custom Parameters",
                })}
                className={style.customParam}
              >
                <>
                  {currenNum > 0 && (
                    <Row gutter={20} className={style.header}>
                      <Col span={8}>
                        {intl.formatMessage({
                          id: "customParam.name",
                          defaultMessage: "Parameter Name",
                        })}
                        <span className={style.required}>*</span>
                      </Col>
                      <Col span={8}>
                        {intl.formatMessage({
                          id: "customParam.value",
                          defaultMessage: "Parameter Value",
                        })}
                        <span className={style.required}>*</span>
                      </Col>
                      <Col span={8}>
                        {intl.formatMessage({
                          id: "customParam.desc",
                          defaultMessage: "Description",
                        })}
                      </Col>
                    </Row>
                  )}
                  <Form.List name="renderParams">
                    {(fields, { add, remove }) => {
                      return (
                        <>
                          {fields?.map((field, index) => {
                            return (
                              <div
                                key={field.key}
                                className={style.collectList}
                              >
                                <div className={style.left}>
                                  <Row gutter={20} className={style.item}>
                                    <Col span={8}>
                                      <Form.Item
                                        rules={[
                                          isRequired(),
                                          lengthRange(1, 64),
                                          {
                                            validator: (rule, value) => {
                                              if (
                                                !/^[a-zA-Z0-9_-]+$/.test(value)
                                              ) {
                                                return Promise.reject(
                                                  Error(
                                                    intl.formatMessage({
                                                      id: "script.field.renderParams.key.validator.format",
                                                      defaultMessage:
                                                        'The parameter name can contain letters, digits, hyphens (-), and underscores (_).',
                                                    }),
                                                  ),
                                                );
                                              }
                                              return Promise.resolve();
                                            },
                                          },
                                        ]}
                                        {...field}
                                        required
                                        name={[field.name, "key"]}
                                      >
                                        <Input />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        rules={[
                                          isRequired(),
                                          lengthRange(1, 64),
                                          {
                                            validator: (rule, value) => {
                                              if (
                                                !/^[a-zA-Z0-9,;{}\-_.():+#$]*$/.test(
                                                  value,
                                                )
                                              ) {
                                                return Promise.reject(
                                                  Error(
                                                    intl.formatMessage({
                                                      id: "script.field.renderParams.value.validator.format",
                                                      defaultMessage:
                                                        'The parameter value can contain letters, digits, and the following characters: , ; { } - _ . ( ) : + # $.',
                                                    }),
                                                  ),
                                                );
                                              }
                                              return Promise.resolve();
                                            },
                                          },
                                        ]}
                                        {...field}
                                        required
                                        name={[field.name, "value"]}
                                      >
                                        <Input />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        {...field}
                                        name={[field.name, "description"]}
                                        rules={[lengthRange(1, 64)]}
                                      >
                                        <Input />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </div>
                                <div
                                  className={style.right}
                                  onClick={() => remove(index)}
                                >
                                  <Icon type="trash" />
                                </div>
                              </div>
                            );
                          })}
                          <div className={style.buttonContainer}>
                            <div
                              className={
                                currenNum < Number(maxNumOfCustomParam)
                                  ? style.addBtn
                                  : style.disabledAddBtn
                              }
                              onClick={() =>
                                !!(currenNum < Number(maxNumOfCustomParam)) &&
                                add({})
                              }
                            >
                              <Icon type="plus" />
                              {intl.formatMessage({
                                id: "vmscript.create.params.add",
                                defaultMessage: "Add Custom Parameter",
                              })}
                              {` (${currenNum}/${maxNumOfCustomParam})`}
                            </div>
                          </div>
                        </>
                      );
                    }}
                  </Form.List>
                </>
              </Form.Item>
            );
          }}
        </Form.Item>
      </div>
    </Form>
  );
};

export default BasicConfig;
