import { useMutation } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form } from "@zstack/zsphere-components";
import { CloudUpload } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalChassis } from "@zstack/zsphere-types/graphql";
import { downloadFile } from "@zstack/zsphere-utils";
import { message } from "antd";
import GBK from "gbk.js";
import React, { useRef, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  batchCreateBaremetalChassis,
  checkBaremetalChassisConfigFile,
} from "../../../gql/baremetal-chassis.gql";

const downloadButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
};
const downloadIconStyle: React.CSSProperties = { marginRight: 4 };

const contentParser = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = () => {
      reject?.(reader?.error);
    };
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e?.target?.result as ArrayBuffer;

      const byteArray = GBK.decode(new Uint8Array(text) as unknown as number[]);

      const blob = new window.Blob([byteArray], {
        type: "text/plain",
      });
      const _reader = new window.FileReader();

      _reader.onerror = () => {
        reject?.(_reader?.error);
      };

      _reader.onload = (event: ProgressEvent<FileReader>) => {
        const fileInfo = event?.target?.result as string;
        const res = window.btoa(unescape(encodeURIComponent(fileInfo)));
        resolve(res);
      };

      _reader.readAsText(blob);
    };
    reader?.readAsArrayBuffer(file);
  });
};

const { Item } = Form;

const Action: React.FC<IActionWrapperProps<BaremetalChassis>> = ({
  visible,
  setVisible,
  selectedList: _selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const [checkVisible, setCheckVisible] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");
  const [fileList, setFileList] = useState<Array<any>>([]);

  const hostInfoRef = useRef<string | ArrayBuffer | null | undefined>("");

  const [checkBaremetalChassisConfigFileAction] = useMutation(
    checkBaremetalChassisConfigFile,
  );

  const handleDownloadFile = () => {
    const file = {
      nameList: [
        `${intl.formatMessage({
          id: "name",
          defaultMessage: "Name",
        })}*(name)`,
        `${intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}(description)`,
        `${intl.formatMessage({
          id: "baremetalCluster",
          defaultMessage: "Bare Metal Cluster",
        })}*(clusterUuid)`,
        `${intl.formatMessage({
          id: "ipmiAddress",
          defaultMessage: "IPMI Address",
        })}*(ipmiAddress)`,
        `${intl.formatMessage({
          id: "ipmiPort",
          defaultMessage: "IPMI Port",
        })}*(ipmiPort)`,
        `${intl.formatMessage({
          id: "ipmiUsername",
          defaultMessage: "IPMI Username",
        })}*(ipmiUsername)`,
        `${intl.formatMessage({
          id: "ipmiPassword",
          defaultMessage: "IPMI Password",
        })}*(ipmiPassword)`,
        `${intl.formatMessage({
          id: "restart.baremetalChassis",
          defaultMessage: "Reboot Bare Metal Chassis",
        })}[Yes/No](reboot)`,
      ],
      valueList: [
        "baremetal-host-1",
        "",
        "d09347e964084c12a945a45cac384b87",
        "127.0.0.1",
        "623",
        "root",
        "password",
        "No",
      ],
    };

    downloadFile(
      `${intl.formatMessage({
        id: "add.baremetalChassisTemplate",
        defaultMessage: "Add Baremetal Chassis Template",
      })}.csv`,
      `${file?.nameList.join(",")}\r\n${file?.valueList.join(",")}`,
    );
  };

  const onOk = async (_values: any) => {
    const payload = {
      baremetalChassisInfo: hostInfoRef?.current,
    };

    doAction({
      mutation: batchCreateBaremetalChassis,
      payload,
      name: intl.formatMessage({
        id: "import.baremetalChassis.from.template",
        defaultMessage: "Import baremetal chassis from templates",
      }),
      total: 1,
      type: "BaremetalChassis",
    });

    setVisible(false);
  };

  const uploadProps = {
    name: "hostUploadFile",
    accept: ".csv,.xlsx",
    onChange(data: any) {
      const {
        file: { status, name, originFileObj },
      } = data;
      if (status !== "removed") {
        setFileList([
          {
            uid: "1",
            name,
            status: "done",
            errorMessage: "",
          },
        ]);

        contentParser(originFileObj)
          .then((res) => {
            hostInfoRef.current = res as string;
          })
          .catch((err) => {
            console.log("err", err);
          });
      }
    },
    async onCheck() {
      const payload = {
        baremetalChassisInfo: hostInfoRef.current,
      };
      message.loading({
        content: intl.formatMessage({
          id: "checking.grammar",
          defaultMessage: "Checking syntax...",
        }),
        icon: <Icon type="loader" />,
        key: "check-grammar",
      });
      const result = await checkBaremetalChassisConfigFileAction({
        variables: payload,
      });
      if (result?.data?.checkBaremetalChassisConfigFile.error) {
        message.destroy("check-grammar");
        setErrorInfo(result?.data?.checkBaremetalChassisConfigFile.error);
        setVisible(true);
      } else {
        message.success({
          content: intl.formatMessage({
            id: "finish.checking.grammar.success",
            defaultMessage: "Syntax checks complete: Success",
          }),
          key: "check-grammar",
          duration: 1,
        });
      }
    },
    onRemove() {
      setFileList([]);
    },
  };

  return (
    <>
      <DialogForm
        title={intl.formatMessage({
          id: "baremetalChassis.modal.title.add",
          defaultMessage: "Add Bare Metal Chassis",
        })}
        form={form}
        visible={visible}
        setVisible={setVisible}
        onOk={onOk}
      >
        <Form form={form}>
          <Item
            label={intl.formatMessage({
              id: "template",
              defaultMessage: "Template",
            })}
            textFormItem
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "template.tooltip",
                  defaultMessage: "### Template\n\nDownload the template. Fill in the bare metal chassis configuration in the specified format. Then, upload the file.\n\n1. The template includes a header row and an example row. Delete or overwrite the example row when editing.\n2. Parameters marked with * are required.\n3. IPMI address format:\n    - Supports single IP address or IP range.\n    - For IP ranges, use commas to separate addresses and use ^ to exclude a range. Example: 127.0.0.1-127.0.0.10,^127.0.0.2-127.0.0.3\n4. Bare metal reboot option:\n    - Auto-reboot to obtain hardware information: Enter YES/Yes/yes/Y/y.\n    - Manual reboot: Enter NO/No/no/N/n or leave blank.",
                })}
              </ReactMarkdown>
            }
          >
            <Button
              variant="link"
              onClick={handleDownloadFile}
              style={downloadButtonStyle}
              icon={<Icon type="download" style={downloadIconStyle} />}
            >
              {intl.formatMessage({
                id: "downloadTemplate",
                defaultMessage: "Download Template",
              })}
            </Button>
          </Item>

          <Item
            label={intl.formatMessage({
              id: "upload.template.file",
              defaultMessage: "Upload Template File",
            })}
            required
          >
            <Item
              name="dragger"
              noStyle
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "user.field.templateImport.validator.format",
                    defaultMessage: "Incorrect syntaxes in the file content.",
                  }),
                },
                ({ getFieldValue }: any) => ({
                  validator() {
                    const fileValue = getFieldValue("dragger");
                    if (fileValue.fileList.length === 0) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "user.field.templateImport.validator.format",
                          defaultMessage: "Incorrect syntaxes in the file content.",
                        }),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <CloudUpload.Dragger
                {...uploadProps}
                text={intl.formatMessage({
                  id: "upload.file/drag.file",
                  defaultMessage: "Upload or drop your file here",
                })}
                fileList={fileList}
              />
            </Item>
          </Item>
        </Form>
      </DialogForm>

      <DialogBase
        visible={checkVisible}
        setVisible={setCheckVisible}
        title={String(
          intl.formatMessage({
            id: "checkSyntaxCompletionFailed",
            defaultMessage: "Syntax checks complete: Failed",
          }),
        )}
        hideCancelButton
      >
        {errorInfo}
      </DialogBase>
    </>
  );
};

export default Action;
