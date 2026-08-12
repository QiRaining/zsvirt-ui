import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { IFormProps } from "@zstack/zsphere-components";
import { Form, Input } from "@zstack/zsphere-components";
import { Switch } from "@zstack/zsphere-components";
import type { CephMon as ICephMon } from "@zstack/zsphere-types/graphql";
import { isPoolName } from "@zstack/zsphere-utils";
import { isEmpty as _isEmpty, cloneDeep as _cloneDeep } from "lodash-es";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import SetMonNode from "../set-mon-node";
import StorageNetworkInfo from "../storageNetwork-info";

import styles from "./style.module.less";

const buttonMonPaddingStyle = {
  paddingLeft: 0,
  display: "flex",
  alignItems: "center",
} as const;

interface IProps {
  form: IFormProps["form"];
}

const CephStorageDeviceInfo: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const [currentMonNode, setCurrentMonNode] = useState<ICephMon | undefined>();
  const [monNodeModalVisible, setMonNodeModalVisible] = useState(false);

  return (
    <>
      <Form.Item
        name="cephx"
        label={intl.formatMessage({
          id: "virtualization.cephx",
          defaultMessage: "Key Authentication",
        })}
        icon="info"
        iconTooltip={{
          title: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "virtualization.primaryStorage.field.cephx.tooltip",
                defaultMessage: `###  Key Authentication

1. If the network of the storage node and compute node is relatively secure, you can turn off this option to avoid authentication failure.
2. Make sure that the authentication option on the distributed storage side is consistent with this option. If the authentication is disabled on the distributed storage side but enabled here, you might fail to create virtual machines, and vice versa.`,
              })}
            </ReactMarkdown>
          ),
        }}
        valuePropName="checked"
        textFormItem
      >
        <Switch defaultChecked />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.type !== curr.type || prev.mons !== curr.mons
        }
      >
        {({ getFieldValue }) => {
          const mons = getFieldValue("mons");
          if (_isEmpty(mons)) {
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
                  style={buttonMonPaddingStyle}
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
              className={styles.monNode}
              description={
                <div
                  className={styles.addBtn}
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
                  {(fields, { add: _add, remove }) => {
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
                                  {form?.getFieldValue([
                                    "mons",
                                    index,
                                    "hostname",
                                  ])}
                                </div>
                                <div className="w-[29.17%] px-3">
                                  {form?.getFieldValue([
                                    "mons",
                                    index,
                                    "sshPort",
                                  ])}
                                </div>
                                <div className="w-[29.17%] px-3">
                                  <div className={styles.action}>
                                    <span
                                      onClick={() => {
                                        setCurrentMonNode(
                                          form?.getFieldValue(["mons", index]),
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

      <Form.Item
        name="imageCachePoolName"
        label={intl.formatMessage({
          id: "imageCachePool",
          defaultMessage: "Image Cache Pool",
        })}
        rules={[
          () => ({
            validator(rule, values) {
              if (values === "" || isPoolName(values)) {
                return Promise.resolve();
              }
              return Promise.reject(
                Error(
                  intl.formatMessage({
                    id: "virtualization.primaryStorage.field.imageCachePool.validator.format",
                    defaultMessage: "Invalid image cache pool.",
                  }),
                ),
              );
            },
          }),
        ]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cephStoragePool.field.imageCachePool.tooltip",
              defaultMessage: `### Image Cache Pool
1. You can specify a storage pool for image caches. If you do not specify a storage pool, the system creates one automatically.
2. If you specify a storage pool, make sure that a storage pool is already available in the distributed storage cluster. Then you can specify the UUID of a storage pool.`,
            })}
          </ReactMarkdown>
        }
      >
        <Input className="width-320" />
      </Form.Item>

      <Form.Item
        name="dataVolumePoolName"
        label={intl.formatMessage({
          id: "storagePool",
          defaultMessage: "Storage Pool",
        })}
        rules={[
          () => ({
            validator(rule, values) {
              if (values === "" || isPoolName(values)) {
                return Promise.resolve();
              }
              return Promise.reject(
                Error(
                  intl.formatMessage({
                    id: "virtualization.primaryStorage.field.dataVolumePool.validator.format",
                    defaultMessage: "Invalid data disk pool.",
                  }),
                ),
              );
            },
          }),
        ]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cephStoragePool.field.dataVolumePool.tooltip",
              defaultMessage: `### Storage Pool

1. You can specify a storage pool for data disks . If you do not specify a storage pool, the system creates one automatically.
2. If you specify a storage pool, make sure that a storage pool is already available in the distributed storage cluster. Then you can specify the UUID of a storage pool.`,
            })}
          </ReactMarkdown>
        }
      >
        <Input className="width-320" />
      </Form.Item>

      <StorageNetworkInfo form={form} />

      <SetMonNode
        visible={monNodeModalVisible}
        setVisible={setMonNodeModalVisible}
        current={currentMonNode}
        mons={form?.getFieldValue("mons") || []}
        onSubmit={(_data: ICephMon) => {
          const preMonNodesData: ICephMon[] =
            _cloneDeep(form?.getFieldValue("mons")) || [];
          let curMonNodesData = [];
          if (currentMonNode?.hostname) {
            curMonNodesData = preMonNodesData?.map((monNode: ICephMon) => {
              if (monNode?.hostname === currentMonNode?.hostname) {
                monNode = _data;
              }
              return monNode;
            });
          } else {
            curMonNodesData = preMonNodesData?.concat([_data]);
          }
          form?.setFieldsValue({ mons: curMonNodesData });
        }}
      />
    </>
  );
};

export default CephStorageDeviceInfo;
