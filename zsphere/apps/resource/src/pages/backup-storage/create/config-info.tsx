import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ZSVForm, Form, Input } from "@zstack/zsphere-components";
import { BackupStorageType } from "@zstack/zsphere-types";
import type {
  CephMon as ICephMon,
  Zone as IZone,
} from "@zstack/zsphere-types/graphql";
import { isCidr, isPoolName, isPort, reject } from "@zstack/zsphere-utils";
import { Form as AntForm } from "antd";
import cls from "classnames";
import { cloneDeep, isEmpty } from "lodash-es";
import React, { useState, useContext, useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useValidator as useBSValidator } from "../utils";
import BackupStorageCreateContext from "./context";
import SetMonNode from "./set-mon-node";

import style from "./style.module.less";

interface IProps {
  form: any;
  zone?: IZone;
}

const { Item } = Form;
const { Card } = ZSVForm;

const addMonitorNodeButtonStyle: React.CSSProperties = { paddingLeft: 0 };

interface IErrorFieldProps {
  value?: React.ReactNode;
  className?: string;
}

export const ErrorField = ({ value, className }: IErrorFieldProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      divRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [value]);

  if (!value) {
    return null;
  }
  return (
    <div
      ref={divRef}
      className={cls(
        "ant-form-item-explain ant-form-item-explain-error",
        style["error-field"],
        className,
      )}
    >
      {value}
    </div>
  );
};

const ConfigPart: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { source } = useContext(BackupStorageCreateContext);
  const [monNodeModalVisible, setMonNodeModalVisible] = useState(false);
  const [currentMonNode, setCurrentMonNode] = useState<ICephMon | undefined>();
  const [monListErrors, setMonListErrors] = useState<
    React.ReactNode[] | undefined
  >();
  const { validatorBSHostname } = useBSValidator();

  const ImageStoreFormDom = (
    <>
      <Item
        name="hostname"
        label={intl.formatMessage({
          id: "backupStorage.hostname",
          defaultMessage: "Image Storage IP",
        })}
        validateTrigger="onBlur"
        required
        rules={[
          {
            async validator(rule: any, value: string) {
              return validatorBSHostname(source?.zone?.uuid ?? -1, value);
            },
          },
        ]}
      >
        <Input className={style["width-320"]} />
      </Item>
      <Item
        name="sshPort"
        label={intl.formatMessage({
          id: "sshPort",
          defaultMessage: "SSH Port",
        })}
        validateTrigger="onBlur"
        required
        rules={[
          {
            validator(rule, value: string) {
              if (!value) {
                return reject(
                  intl.formatMessage({
                    id: "global.field.validator.input.required",
                    defaultMessage: "This field is required.",
                  }),
                );
              }
              if (!isPort(value)) {
                return reject(
                  intl.formatMessage({
                    id: "backupStorage.field.sshPort.validator.format",
                    defaultMessage: "Invalid SSH port",
                  }),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input className={style["width-160"]} />
      </Item>
      <Item
        name="username"
        label={intl.formatMessage({
          id: "username",
          defaultMessage: "Username",
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "global.field.validator.input.required",
              defaultMessage: "This field is required.",
            }),
          },
        ]}
      >
        <Input className={style["width-320"]} />
      </Item>
      <Item
        name="password"
        label={intl.formatMessage({
          id: "password",
          defaultMessage: "Password",
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "global.field.validator.input.required",
              defaultMessage: "This field is required.",
            }),
          },
        ]}
      >
        <Input.Password className={style["width-320"]} />
      </Item>
      <Form.Item noStyle name="testConnError">
        <ErrorField />
      </Form.Item>
    </>
  );

  const CephFormDom = (getFieldValue: any) => {
    return (
      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.mons !== curr.mons}>
        {() => {
          const mons = form.getFieldValue("mons");
          if (isEmpty(mons)) {
            return (
              <Form.Item
                label={intl.formatMessage({
                  id: "monitorNode",
                  defaultMessage: "Monitoring Node",
                })}
                name="monitorNode"
                required
                rules={[
                  {
                    validator: () => {
                      if (mons?.length < 1) {
                        return Promise.reject(
                          intl.formatMessage({
                            id: "backupStorage.field.monitorNode.validator.required",
                            defaultMessage: "Add a monitoring node.",
                          }),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Button
                  style={addMonitorNodeButtonStyle}
                  variant="link"
                  icon={<Icon type="plus" />}
                  onClick={() => {
                    setCurrentMonNode(undefined);
                    setMonNodeModalVisible(true);
                  }}
                >
                  {intl.formatMessage({
                    id: "add.monNode",
                    defaultMessage: "Add Monitoring Node",
                  })}
                </Button>
              </Form.Item>
            );
          }
          return (
            <Form.Item
              label={intl.formatMessage({
                id: "monitorNode",
                defaultMessage: "Monitoring Node",
              })}
              className={style.monNode}
              description={
                <div
                  className={style.addBtn}
                  onClick={() => {
                    setCurrentMonNode(undefined);
                    setMonNodeModalVisible(true);
                  }}
                >
                  <Icon type="plus" />
                  <span>
                    {intl.formatMessage({
                      id: "add.monNode",
                      defaultMessage: "Add Monitoring Node",
                    })}
                  </span>
                  <div className={style.errMsg}>
                    <AntForm.ErrorList errors={monListErrors} />
                  </div>
                </div>
              }
            >
              <>
                <div className="flex border-b border-neutral-300 py-1.5 text-neutral-600">
                  <div className="relative w-[41.67%] px-3 after:absolute after:top-1/2 after:right-0 after:h-3 after:w-px after:-translate-y-1/2 after:bg-neutral-300 after:content-['']">
                    {intl.formatMessage({
                      id: "monNodeManageIp",
                      defaultMessage: "Monitoring Node IP",
                    })}
                  </div>
                  <div className="relative w-[29.17%] px-3 after:absolute after:top-1/2 after:right-0 after:h-3 after:w-px after:-translate-y-1/2 after:bg-neutral-300 after:content-['']">
                    {intl.formatMessage({
                      id: "sshPort",
                      defaultMessage: "SSH Port",
                    })}
                  </div>
                  <div className="w-[29.17%] px-3">
                    {intl.formatMessage({
                      id: "action",
                      defaultMessage: "Actions",
                    })}
                  </div>
                </div>
                <Form.List name="mons">
                  {(fields, { remove }, { errors }) => {
                    if (errors?.length && fields?.length < 1) {
                      setMonListErrors(errors);
                    } else {
                      setMonListErrors(undefined);
                    }
                    return (
                      <div className="overflow-y-auto">
                        {fields?.map((field, index) => {
                          return (
                            <div
                              className="border-b border-neutral-300 text-neutral-700"
                              key={field.key}
                            >
                              <div className="flex py-1.5">
                                <div className="w-[41.67%] px-3">
                                  {getFieldValue(["mons", index, "hostname"])}
                                </div>
                                <div className="w-[29.17%] px-3">
                                  {getFieldValue(["mons", index, "sshPort"])}
                                </div>
                                <div className="w-[29.17%] px-3">
                                  <div className={style.action}>
                                    <span
                                      onClick={() => {
                                        setCurrentMonNode(
                                          getFieldValue(["mons", index]),
                                        );
                                        setMonNodeModalVisible(true);
                                      }}
                                    >
                                      <Icon type="edit" />
                                    </span>
                                    <span onClick={() => remove(index)}>
                                      <Icon type="trash" />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                </Form.List>
              </>
            </Form.Item>
          );
        }}
      </Form.Item>
    );
  };

  return (
    <Card
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
    >
      <Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
        {({ getFieldValue }) => {
          switch (source?.createWay) {
            case BackupStorageType.ImageStoreBackupStorage:
              return ImageStoreFormDom;
            case BackupStorageType.Ceph:
              return CephFormDom(getFieldValue);
            default:
              break;
          }
        }}
      </Item>

      <Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
        {() => {
          switch (source?.createWay) {
            case BackupStorageType.Ceph:
              return (
                <Item
                  name="poolName"
                  label={intl.formatMessage({
                    id: "backupStorage.pool",
                    defaultMessage: "Image Storage Pool",
                  })}
                  validateTrigger="onBlur"
                  rules={[
                    {
                      validator(rule, value: string) {
                        if (value && !isPoolName(value)) {
                          return reject(
                            intl.formatMessage({
                              id: "backupStorage.field.poolName.validator.format",
                              defaultMessage: "Invalid backup storage pool. ",
                            }),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "backupStorage.field.backupStoragePool.tooltip",
                        defaultMessage: `### Image Storage Pool
1. You can specify a storage pool for the  Distributed Storage  backup storage to store images. If not specified, the Cloud creates one automatically.
2. To specify a storage pool, make sure that a storage pool is already available in the  Distributed Storage  cluster. Then you can specify the UUID of the storage pool.`,
                      })}
                    </ReactMarkdown>
                  }
                >
                  <Input className={style["width-240"]} />
                </Item>
              );
            default:
              break;
          }
        }}
      </Item>

      {source?.createWay === BackupStorageType.Ceph && (
        <>
          <Item
            name="dataNetwork"
            label={intl.formatMessage({
              id: "dataNetwork",
              defaultMessage: "Data Network",
            })}
            validateTrigger="onBlur"
            rules={[
              {
                validator(rule, value: string) {
                  if (value && !isCidr(value)) {
                    return reject(
                      intl.formatMessage({
                        id: "backupStorage.field.dataNetwork.validator.format",
                        defaultMessage: "Invalid data network",
                      }),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backupStorage.field.dataNetwork.tooltip",
                  defaultMessage: `### Data Network

A data network is a type of network where compute nodes and image storage can communicate with each other.

1. An independent data network can be used to avoid network congestion and improve transfer efficiencies.

2. If not set, management networks will be used by default.`,
                })}
              </ReactMarkdown>
            }
          >
            <Input className={style["width-240"]} />
          </Item>
          <SetMonNode
            visible={monNodeModalVisible}
            setVisible={setMonNodeModalVisible}
            mons={form.getFieldValue("mons") || []}
            current={currentMonNode}
            onSubmit={(data: any) => {
              const preMonsData: ICephMon[] =
                cloneDeep(form.getFieldValue("mons")) || [];
              let curMonsData = [];
              if (currentMonNode?.hostname) {
                curMonsData = preMonsData?.map((mon: ICephMon) => {
                  if (mon?.hostname === currentMonNode?.hostname) {
                    mon = data;
                  }
                  return mon;
                });
              } else {
                curMonsData = preMonsData?.concat([data]);
              }
              form.setFieldsValue({ mons: curMonsData });
            }}
          />
        </>
      )}
    </Card>
  );
};

export default React.memo(ConfigPart);
