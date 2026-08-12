import { gql } from "@apollo/client";
import { Button, Input } from "@zstack/design";
import {
  Form,
  Modal,
  Select,
  TextArea,
  Upload,
} from "@zstack/zsphere-components";
import { CodeMirrorEditor } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import { isEmpty } from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

const { Item } = Form;

export interface CreatePreConfigTemplateModalRef {
  form?: any;
  open: () => void;
  close: () => void;
}

const ADD_PRECONFIGURATION_TEMPLATE = gql`
  mutation addPreconfigurationTemplate(
    $input: AddPreconfigurationTemplateInput!
  ) {
    addPreconfigurationTemplate(input: $input) {
      actionId
    }
  }
`;

const CreatePreConfigTemplateModal: React.FC<
  IActionWrapperProps<IPreconfigurationTemplate>
> = ({ visible, setVisible, refetch }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any>([]);
  const [templateContent, setTemplateContent] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const { commonDescriptionRules, commonNameRules } = useValidator(intl);

  const typeList = [
    { label: "kickstart", value: "kickstart" },
    { label: "preseed", value: "preseed" },
    { label: "autoyast", value: "autoyast" },
    { label: "autoinstall", value: "autoinstall" },
  ];

  const distributionList = [
    "centos-x86_64",
    "zstack-x86_64",
    "ubuntu-x86_64",
    "opensuse-x86_64",
    "others",
  ].map((t) => ({ label: t.replace("zstack", "cloud"), value: t }));

  // 提交逻辑
  const onOk = async (values: any) => {
    const { name, description, distribution, type } = values;

    const payload = {
      name,
      description,
      distribution,
      type,
      content: templateContent,
    };

    doAction({
      mutation: ADD_PRECONFIGURATION_TEMPLATE,
      payload,
      name: intl.formatMessage({
        id: "add.preConfigurationTemplate",
        defaultMessage: "Add Bare Metal Template",
      }),
      type: "PreconfigurationTemplate",
      total: 1,
      onFinish: () => {
        setVisible(false);
        refetch?.();
      },
    });
  };

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible]);

  return (
    <>
      <DialogForm
        form={form}
        visible={visible}
        setVisible={setVisible}
        onOk={onOk}
        title={intl.formatMessage({
          id: "preConfigurationTemplate.create",
          defaultMessage: "Add Bare Metal Template",
        })}
        widthClassName="w-150"
      >
        <Form
          form={form}
          initialValues={{ distribution: "centos-x86_64", type: "kickstart" }}
        >
          <Item
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            name="name"
            rules={commonNameRules}
          >
            <Input className={styles["width-320"]} />
          </Item>
          <Item
            name="description"
            rules={commonDescriptionRules}
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
          >
            <TextArea
              limit={256}
              rows={4}
              isShowLimit
              className={styles["width-320"]}
            />
          </Item>
          <Item
            label={intl.formatMessage({
              id: "operating.system",
              defaultMessage: "Operating System",
            })}
            name="distribution"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "preConfigurationTemplate.field.operating.system.validator.required",
                  defaultMessage: "Select an operating system.",
                }),
              },
            ]}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "preConfigurationTemplate.field.operating.system.tooltip",
                  defaultMessage: `### Operating System

Select a template OS for unattended deployment.

- Supports custom platform-optimized OS.
- Supports major Linux distributions, such as RHEL/CentOS series, Debian/Ubuntu series, and SUSE/openSUSE series.`,
                })}
              </ReactMarkdown>
            }
          >
            <Select width="l">
              {distributionList.map((item) => (
                <Select.Option key={item.label} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Item>
          <Item
            label={intl.formatMessage({
              id: "template.type",
              defaultMessage: "Template Type",
            })}
            name="type"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "preConfigurationTemplate.field.template.type.validator.required",
                  defaultMessage: "Select a template type.",
                }),
              },
            ]}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "preConfigurationTemplate.field.template.type.tooltip",
                  defaultMessage: `### Template Type

The template type must match the selected operating system.

- Custom platform-optimized OS: Select kickstart.
- RHEL/CentOS series: Select kickstart.
- Debian/Ubuntu series: Select preseed.
- Ubuntu Live: Select autoinstall.
- SUSE/openSUSE series: Select autoyast.`,
                })}
              </ReactMarkdown>
            }
          >
            <Select width="l">
              {typeList.map((item) => (
                <Select.Option key={item.label} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Item>
          <Item
            className={styles.upload}
            name="content"
            label={intl.formatMessage({
              id: "template.import",
              defaultMessage: "Template Import",
            })}
            required
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "preConfigurationTemplate.field.content.tooltip",
                  defaultMessage: `### Template Import

1. File format:
    - Supports uploading custom template files encoded in UTF-8.
    - Recommended file size: less than or equal to 50 KB.

2. Variable definitions:
   - System variables (All uppercase, underscore-separated): REPO_URL, USERNAME, PASSWORD, NETWORK_CFGS, FORCE_INSTALL, PRE_SCRIPTS, POST_SCRIPTS
   - Custom variables (All lowercase, underscore-separated): hostname, keyboard, timezone

3. Template syntax rules:
    - kickstart: Refer to Red Hat official documentation.
    - preseed/autoinstall: Refer to Ubuntu official documentation.
    - autoyast: Refer to SUSE official documentation.

Note: Custom bare metal templates must strictly follow the syntax rules of the corresponding selected template type.`,
                })}
              </ReactMarkdown>
            }
          >
            <Item
              name="dragger"
              noStyle
              rules={[
                {
                  validator: (
                    _: any,
                    values: {
                      file: { size: number };
                      fileList: string | any[];
                    },
                  ) => {
                    const isLt50KB = values?.file.size / 1024 < 50;
                    if (
                      !values ||
                      values?.file.size === 0 ||
                      values.fileList.length === 0
                    ) {
                      return Promise.reject(
                        Error(
                          intl.formatMessage({
                            id: "user.field.template.import.validator.format",
                            defaultMessage: "Upload a file.",
                          }),
                        ),
                      );
                    }
                    if (!isLt50KB) {
                      return Promise.reject(
                        Error(
                          intl.formatMessage({
                            id: "preConfigurationTemplate.field.content.size",
                            defaultMessage: "The file must be less than 50 KB.",
                          }),
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Upload.Dragger
                name="preconfigurationTemplateUploadContent"
                onChange={(data: any) => {
                  const {
                    file: { status, name, originFileObj },
                  } = data;
                  if (status !== "removed") {
                    const reader = new window.FileReader();
                    reader.onload = (e) => {
                      const text = e?.target?.result as string;
                      if (!isEmpty(text)) {
                        setTemplateContent(text);
                      }
                    };
                    reader.readAsBinaryString(originFileObj);
                  }
                  if (data.fileList.length !== 0) {
                    setFileList([
                      {
                        uid: "1",
                        name,
                        status: "done",
                      },
                    ]);
                  }
                }}
                fileList={fileList}
                className={styles["width-320"]}
                onRemove={() => setFileList([])}
                onCheck={() => setPreviewVisible(true)}
                checkText={intl.formatMessage({
                  id: "preConfigurationTemplate.modal.title.see.content",
                  defaultMessage: "View Baremetal Preconfigured Template Content",
                })}
              />
            </Item>
          </Item>
        </Form>
      </DialogForm>
      <DialogBase
        title={intl.formatMessage({
          id: "preConfigurationTemplate.modal.title.see.content",
          defaultMessage: "View Baremetal Preconfigured Template Content",
        })}
        setVisible={setPreviewVisible}
        visible={previewVisible}
        style={{ width: 1000 }}
        onCancel={() => setPreviewVisible(false)}
        footer={
          <Button
            key="submit"
            variant="primary"
            onClick={() => setPreviewVisible(false)}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      >
        <CodeMirrorEditor
          height="60vh"
          value={templateContent}
          readonly
          minimap
        />
      </DialogBase>
    </>
  );
};

export default CreatePreConfigTemplateModal;
