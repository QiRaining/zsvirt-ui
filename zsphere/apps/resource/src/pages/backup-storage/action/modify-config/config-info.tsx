import { Form, Input } from "@zstack/zsphere-components";
import { BackupStorageType } from "@zstack/zsphere-types";
import type {
  BackupStorage as IBackupStorage,
  CephMon as ICephMon,
} from "@zstack/zsphere-types/graphql";
import { isCidr, isPath, isPort, reject } from "@zstack/zsphere-utils";
import { cloneDeep as _cloneDeep } from "lodash-es";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useValidator as useBSValidator } from "../../utils";
import SetMonNode from "./set-mon-node";

import style from "./style.module.less";

interface IProps {
  form: any;
  current?: IBackupStorage;
}

const { Item } = Form;

const ConfigPart: React.FC<IProps> = ({ form, current }) => {
  const intl = useIntl();
  const [monNodeModalVisible, setMonNodeModalVisible] =
    useState<boolean>(false);
  const [currentMonNode, _setCurrentMonNode] = useState<ICephMon | undefined>();
  const [_monListErrors, _setMonListErrors] = useState<
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
              if (value === current?.hostname) {
                return;
              }
              return validatorBSHostname(current?.zone?.uuid ?? "", value);
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
        <Input className={style["width-320"]} />
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
        name="url"
        label={intl.formatMessage({
          id: "mountPath",
          defaultMessage: "Mount Path",
        })}
        required
        validateTrigger="onBlur"
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

              if (!isPath(value)) {
                return reject(
                  intl.formatMessage({
                    id: "backupStorage.field.url.validator.format",
                    defaultMessage: "Invalid mount path.",
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
              id: "backupStorage.field.url.tooltip",
              defaultMessage: `### Mount Path
It is recommended to mount a large capacity for this URL. Ensure that you enter the absolute path of this directory.`,
            })}
          </ReactMarkdown>
        }
        description={intl.formatMessage({
          id: "backupStorage.field.url.description",
          defaultMessage:
            "System directories such as /, /dev, /proc, /sys, /usr/bin, and /bin cannot be used. Using system directories might cause hosts unable to work properly.",
        })}
        textFormItem
      >
        {form.getFieldValue("url")}
      </Item>
    </>
  );
  //TODO: 临时禁用Ceph监控节点配置  ZSV-9249
  // const CephFormDom = (getFieldValue: any) => {
  //   return (
  //     <>
  //       <Form.Item
  //         label={intl.formatMessage({
  //           id: 'monitorNode',
  //           defaultMessage: '监控节点'
  //         })}
  //         className={style.monNode}
  //         required
  //       >
  //         <Row gutter={24} className={style.header}>
  //           <Col span={10}>
  //             {intl.formatMessage({ id: 'monNodeManageIp', defaultMessage: 'Mon节点管理IP' })}
  //           </Col>
  //           <Col span={7}>{intl.formatMessage({ id: 'sshPort', defaultMessage: 'SSH端口' })}</Col>
  //           <Col span={7}>{intl.formatMessage({ id: 'action', defaultMessage: '操作' })}</Col>
  //         </Row>
  //         <Form.List
  //           name="mons"
  //           rules={[
  //             {
  //               validator: (restParams, mons) => {
  //                 if (mons?.length === 0) {
  //                   return Promise.reject(
  //                     intl.formatMessage({
  //                       id: 'backupStorage.field.monitorNode.validator.required',
  //                       defaultMessage: '请选择添加监控节点'
  //                     })
  //                   )
  //                 }
  //                 return Promise.resolve()
  //               }
  //             }
  //           ]}
  //         >
  //           {(fields, { remove }, { errors }) => {
  //             if (errors?.length && fields?.length < 1) {
  //               setMonListErrors(errors)
  //             } else {
  //               setMonListErrors(undefined)
  //             }
  //             return (
  //               <div className={style.content}>
  //                 {fields?.length < 1 && (
  //                   <div className={style.noData}>
  //                     <div className={style.icon}>
  //                       <Icon type="inbox" />
  //                     </div>
  //                     <span>
  //                       {intl.formatMessage({
  //                         id: 'backupStorage.field.mons.noData',
  //                         defaultMessage: '暂无数据，请添加监控节点'
  //                       })}
  //                     </span>
  //                   </div>
  //                 )}
  //                 {fields?.map((field, index) => {
  //                   return (
  //                     <div className={style.item}>
  //                       <Row gutter={24} key={field.key}>
  //                         <Col span={10}>{getFieldValue(['mons', index, 'hostname'])}</Col>
  //                         <Col span={7}>{getFieldValue(['mons', index, 'sshPort'])}</Col>
  //                         <Col span={7}>
  //                           <div className={style.action}>
  //                             <span
  //                               onClick={() => {
  //                                 setCurrentMonNode(getFieldValue(['mons', index]))
  //                                 setMonNodeModalVisible(true)
  //                               }}
  //                             >
  //                               <Icon type="edit" />
  //                             </span>
  //                             <span onClick={() => remove(index)}>
  //                               <Icon type="trash" />
  //                             </span>
  //                           </div>
  //                         </Col>
  //                       </Row>
  //                     </div>
  //                   )
  //                 })}
  //               </div>
  //             )
  //           }}
  //         </Form.List>
  //       </Form.Item>
  //       <div
  //         className={style.addBtn}
  //         onClick={() => {
  //           setCurrentMonNode(undefined)
  //           setMonNodeModalVisible(true)
  //         }}
  //       >
  //         <Icon type="plus" />
  //         <span>{intl.formatMessage({ id: 'add.monNode', defaultMessage: '添加监控节点' })}</span>
  //         <div className={style.errMsg}>
  //           <AntForm.ErrorList errors={monListErrors} />
  //         </div>
  //       </div>
  //     </>
  //   )
  // }

  return (
    <div className={style.card}>
      <div className={style.title}>
        <div className={style.rect} />
        <div className={style.text}>
          {intl.formatMessage({
            id: "config.info",
            defaultMessage: "Configurations",
          })}
        </div>
      </div>

      <Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
        {({ getFieldValue }) => {
          switch (getFieldValue("type")) {
            case BackupStorageType.ImageStoreBackupStorage:
              return ImageStoreFormDom;
            // case BackupStorageType.Ceph:
            //   return CephFormDom(getFieldValue)
            default:
              break;
          }
        }}
      </Item>

      <Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
        {({ getFieldValue }) => {
          switch (getFieldValue("type")) {
            case BackupStorageType.Ceph:
              return (
                <Item
                  name="poolName"
                  label={intl.formatMessage({
                    id: "backupStorage.pool",
                    defaultMessage: "Image Storage Pool",
                  })}
                  validateTrigger="onBlur"
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
                  textFormItem
                >
                  {getFieldValue("poolName")}
                </Item>
              );
            case BackupStorageType.ImageStoreBackupStorage:
              return (
                <Item
                  name="syncImageNetwork"
                  label={intl.formatMessage({
                    id: "imageSyncNetwork",
                    defaultMessage: "Image Sync Network",
                  })}
                  auth={{
                    authKey: "image.sync.network",
                    resource: "backup.storage",
                  }}
                  validateTrigger="onBlur"
                  rules={[
                    {
                      validator(rule, value: string) {
                        if (value && !isCidr(value)) {
                          return reject(
                            intl.formatMessage({
                              id: "backupStorage.field.imageSyncNetwork.validator.format",
                              defaultMessage: "Invalid image synchronization network",
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
                        id: "backupStorage.field.imageSyncNetwork.tooltip",
                        defaultMessage: `### Image Sync Network

1. If you deployed a dedicated network for image synchronization, enter its CIDR.
2. If not set, a management network will be used by default for image synchronization.
3. If you set an image synchronization network for both a source image storage and a destination image storage, only the image synchronization network of the destination image storage works.`,
                      })}
                    </ReactMarkdown>
                  }
                >
                  <Input className={style["width-320"]} />
                </Item>
              );
            default:
              break;
          }
        }}
      </Item>

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
        <Input className={style["width-320"]} />
      </Item>
      <SetMonNode
        visible={monNodeModalVisible}
        setVisible={setMonNodeModalVisible}
        current={currentMonNode}
        onSubmit={(data: any) => {
          const preMonsData = _cloneDeep(form.getFieldValue("mons")) || [];
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
    </div>
  );
};

export default React.memo(ConfigPart);
