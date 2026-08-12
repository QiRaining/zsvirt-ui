import { useLazyQuery } from "@apollo/client";
import { ovfFile } from "@zstack/virtualization-resource/src/gql/vm.gql";
import BSList from "@zstack/virtualization-resource/src/pages/backup-storage/list";
import { ModalSelect, Upload, ZSVForm } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { OvfFile as IOvfFile } from "@zstack/zsphere-types/graphql";
import CryptoJS from "crypto-js";
import React, { useCallback, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { CreateInstanceContext } from "../context";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  isEdit?: boolean;
  onFinish?: Function;
  source?: any;
}

type returnProps = {
  name: string;
  multiple: boolean;
  onRemove(): void;
  beforeUpload?: (file: File) => Promise<never>;
  onChange?: any;
};

const { Card } = ZSVForm;

export function blobToString(blob: Blob, encoding?: string): Promise<string> {
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const str = fileReader.result as string;
      resolve(str);
    };
    if (encoding) {
      fileReader.readAsText(blob, encoding);
    } else {
      fileReader.readAsBinaryString(blob);
    }
  });
}

export function stringToBase64(str: string): Promise<string> {
  return new Promise((resolve) => {
    resolve(CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str)));
  });
}

export const fieldsNeedsValidateInBasic = ["name", "count"];

const UploadCard: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const [OVFFileList, setOVFFileList] = useState<Array<any>>([]);
  const [VMDKFileList, setVMDKFileList] = useState<Array<any>>([]);
  const [MFFileList, setMFFileList] = useState<Array<any>>([]);
  const [OVAFileList, setOVAFileList] = useState<Array<any>>([]);
  const [fileStr, setFileStr] = useState<string>();
  const [vmdkList, setVmdkList] = useState<Array<any>>([]);
  const [draggerFile, setDraggerFile] = useState<File>();
  const { zoneUuid } = React.useContext(CreateInstanceContext);

  const [getOvf, { data: ovfData }] = useLazyQuery<{ ovfFile: IOvfFile }>(
    ovfFile,
  );

  const queryBackupStorageConditions = {
    conditions: [
      { key: "state", op: Op.eq, value: "Enabled" },
      { key: "status", op: Op.eq, value: "Connected" },
      { key: "zone.uuid", op: Op.eq, value: zoneUuid },

      {
        key: "__systemTag__",
        op: Op.notIn,
        values: ["remote", "onlybackup", "aliyun", "remotebackup"],
      },
    ],
  };

  const getProps = useCallback((type: string): returnProps => {
    if (type === "ovf") {
      return {
        name: "file",
        multiple: false,
        onRemove() {
          setOVFFileList([]);
        },
        beforeUpload: async (file: File) => {
          const _fileStr = await stringToBase64(
            await blobToString(file, "utf8"),
          );
          getOvf({ variables: { ovf: _fileStr } });
          setDraggerFile(file);
          setFileStr(_fileStr);
          throw undefined;
        },
      };
    }
    if (type === "vmdk") {
      return {
        name: "file",
        multiple: true,
        onRemove() {
          setVMDKFileList([]);
        },
        onChange: ({ fileList }: any): void => {
          setVMDKFileList(fileList);
        },
      };
    }
    if (type === "mf") {
      return {
        name: "file",
        multiple: false,
        onRemove() {
          setMFFileList([]);
        },
        beforeUpload: async (file: File) => {
          setMFFileList([
            {
              uid: "1",
              name: file.name,
              status: "done",
              errorMessage: "",
            },
          ]);
          throw undefined;
        },
      };
    }
    return {
      name: "file",
      multiple: false,
      onRemove() {
        setOVAFileList([]);
      },
      beforeUpload: async (file: File) => {
        setOVAFileList([
          {
            uid: "1",
            name: file.name,
            status: "done",
            errorMessage: "",
          },
        ]);
        throw undefined;
      },
    };
  }, []);

  useEffect(() => {
    if (!ovfData?.ovfFile) {
      return;
    }
    const { disks, cpuNum, memorySize } = ovfData!.ovfFile;
    form?.setFields([
      { name: "cpuNum", value: cpuNum },
      { name: "memorySize", value: (memorySize || 0) / (1024 * 1024 * 1024) },
      { name: "xmlBase64", value: fileStr },
    ]);
    setVmdkList(disks);

    setOVFFileList([
      {
        uid: "1",
        name: draggerFile?.name,
        status: "done",
        errorMessage: "",
      },
    ]);
  }, [ovfData, draggerFile, fileStr]);

  return (
    <Card
      title={intl.formatMessage({
        id: "upload.info",
        defaultMessage: "Upload Info",
      })}
    >
      <Form.Item
        name="backupStorage"
        id="table-select-backup-storage"
        label={intl.formatMessage({
          id: "backupStorage",
          defaultMessage: "Image Storage",
        })}
        description={intl.formatMessage({
          id: "import.instance.backupStorage.description",
          defaultMessage:
            "Temporarily stores the template file. After the VM is created, the file will be auto-deleted.",
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "image.field.backupStorage.validator.required",
              defaultMessage: "Select a backup storage.",
            }),
          },
        ]}
        hideRequiredMessage
      >
        <ModalSelect
          id="table-select-backup-storage"
          title={intl.formatMessage({
            id: "select.backupStorage",
            defaultMessage: "Select Image Storage",
          })}
          selectType="radio"
          style={{ width: 400 }}
        >
          <BSList
            view="select"
            selectType="radio"
            defaultQuery={queryBackupStorageConditions}
          />
        </ModalSelect>
      </Form.Item>
      <Form.Item
        name="ovfType"
        label={intl.formatMessage({
          id: "template.type",
          defaultMessage: "Template Type",
        })}
        textFormItem
      >
        <div>OVF</div>
      </Form.Item>
      <Form.Item
        shouldUpdate={(prev, curr) => prev.ovfType !== curr.ovfType}
        noStyle
      >
        {({ getFieldValue }: any) =>
          getFieldValue("ovfType") !== "ovf" ? (
            <>
              <Form.Item
                label={intl.formatMessage({
                  id: "ovfFile",
                  defaultMessage: "OVF File",
                })}
                name="ovfDragger"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "image.field.templateImport.validator.format",
                      defaultMessage: "Upload a file.",
                    }),
                  },
                  () => ({
                    validator() {
                      const fileValue = getFieldValue("ovfDragger");
                      if (
                        !fileValue?.fileList?.length ||
                        fileValue?.fileList?.length === 0
                      ) {
                        return Promise.reject(
                          intl.formatMessage({
                            id: "image.field.templateImport.validator.format",
                            defaultMessage: "Upload a file.",
                          }),
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Upload
                  // acceptText={intl.formatMessage({
                  //   id: 'import.ovf.acceptText',
                  //   defaultMessage: '仅支持ovf类型'
                  // })}
                  accept=".ovf"
                  {...(getProps("ovf") as any)}
                  fileList={OVFFileList}
                  multipleSelect={false}
                />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: "vmdk",
                  defaultMessage: "VMDK File",
                })}
                name="vmdkDragger"
                description={intl.formatMessage({
                  id: "import.vmdk.acceptText",
                  defaultMessage:
                    "The VMDK-formatted files in the uploaded OVF template. The number of files and the file configurations must be consistent with that defined in the OVF-formatted file.",
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "image.field.templateImport.validator.ovf.format",
                      defaultMessage: "Upload a file.",
                    }),
                  },
                  () => ({
                    validator() {
                      const fileValue = getFieldValue("vmdkDragger");
                      if (fileValue?.fileList?.length !== vmdkList.length) {
                        return Promise.reject(
                          intl.formatMessage({
                            id: "image.field.templateImport.validator.vmdk.format",
                            defaultMessage: `The number of VMDK-formatted files is inconsistent with that defined in the OVF-formatted file.`,
                          }),
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Upload
                  accept=".vmdk"
                  {...getProps("vmdk")}
                  fileList={VMDKFileList}
                  multipleSelect
                />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: "mf",
                  defaultMessage: "MF File",
                })}
                name="mfDragger"
              >
                <Upload
                  // acceptText={intl.formatMessage({
                  //   id: 'import.mf.acceptText',
                  //   defaultMessage: '仅支持mf格式'
                  // })}
                  accept=".mf"
                  {...getProps("mf")}
                  fileList={MFFileList}
                  multipleSelect={false}
                />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              label={intl.formatMessage({
                id: "ovaFile",
                defaultMessage: "OVA File",
              })}
              name="ovaDragger"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "image.field.templateImport.validator.format",
                    defaultMessage: "Upload a file.",
                  }),
                },
                () => ({
                  validator() {
                    const fileValue = getFieldValue("ovaDragger");
                    if (fileValue?.fileList?.length === 0) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "image.field.templateImport.validator.format",
                          defaultMessage: "Upload a file.",
                        }),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Upload
                {...getProps("ova")}
                fileList={OVAFileList}
                multipleSelect={false}
              />
            </Form.Item>
          )
        }
      </Form.Item>
    </Card>
  );
};

export default React.memo(UploadCard);
