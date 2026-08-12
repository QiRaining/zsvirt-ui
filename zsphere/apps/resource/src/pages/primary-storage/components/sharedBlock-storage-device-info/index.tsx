import { Checkbox, RadioGroup, Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form, ModalSelect, useAuth } from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { CandidateSharedBlock as ICandidateSharedBlock } from "@zstack/zsphere-types/graphql";
import { List } from "antd";
import type { FormProps } from "antd/lib/form";
import { includes as _includes } from "lodash-es";
import React, { useContext, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import SharedBlockSelectList from "../../../shared-block/select-list/list";
import { PrimaryStorageResourceContext } from "../../create/contexts/storageContexts";
import type { IPrimaryStorageResourceContext } from "../../create/type";
import StorageNetworkInfo from "../storageNetwork-info";
import RegisterLunSelectModal from "./register-lun-select-modal";

import styles from "./style.module.less";

const iconAlertStyleShared = { color: "var(--alert-500)" } as const;

interface IProps {
  form: FormProps["form"];
}

const SharedBlockStorageDeviceInfo: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const { resource } = useContext(
    PrimaryStorageResourceContext,
  ) as IPrimaryStorageResourceContext;

  const hasRegisterAuth = hasAuth({
    type: "block",
    resource: "primary.storage",
    authKey: "sharedBlock.register",
  });

  const diskUuidList =
    Form.useWatch<ICandidateSharedBlock[]>("diskUuidList", form) ?? [];
  const clusterUuid = Form.useWatch<string[]>("clusterUuid", form) ?? [];

  const diskLunQuery = useMemo(() => {
    const conditions: IQuery["conditions"] = [];
    if (clusterUuid?.length > 0) {
      conditions.push({
        key: "clusterUuid",
        op: Op.eq,
        value: clusterUuid,
      });
    }

    if (_includes(["IscsiServer"], resource?.__typename)) {
      conditions.push({
        key: "__IscsiServerUuids__",
        op: Op.eq,
        value: resource?.uuid,
      });
    }

    if (_includes(["FiberChannelStorage"], resource?.__typename)) {
      conditions.push({
        key: "__FiberChannelStorageUuids__",
        op: Op.eq,
        value: resource?.uuid,
      });
    }

    if (_includes(["NvmeTarget"], resource?.__typename)) {
      conditions.push({
        key: "__NvmeTargetUuids__",
        op: Op.eq,
        value: resource?.uuid,
      });
    }

    return {
      conditions,
    };
  }, [clusterUuid, resource?.uuid, resource?.__typename]);

  const handleAddlun = (
    sharedBlocks: { diskUuid: string; totalCapacity: number; vendor: string }[],
    sanStorageUuid: string,
  ) => {
    const diskUuidList = sharedBlocks.map((block) => ({
      wwid: block.diskUuid,
      vendor: block.vendor,
    }));
    form?.setFieldsValue({
      diskUuidList,
      sanStorageUuid: sanStorageUuid, // 保存 vg name（resourceUuid）
    });
    setRegisterModalVisible(false);
  };
  return (
    <>
      <Form.Item
        name="thinProvision"
        label={intl.formatMessage({
          id: "virtualization.default.provisioning.type",
          defaultMessage: "Default Provisioning Method of Storage Space",
        })}
        initialValue={false}
        required
      >
        <RadioGroup
          options={[
            {
              value: false,
              label: intl.formatMessage({
                id: "thickProvision",
                defaultMessage: "Thick Provision",
              }),
            },
            {
              value: true,
              label: intl.formatMessage({
                id: "thinProvision",
                defaultMessage: "Thin Provision",
              }),
            },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="storageAddMode"
        label={intl.formatMessage({
          id: "primaryStorage.create.storage.addMode",
          defaultMessage: "Storage Addition Method",
        })}
        icon="info"
        iconTooltip={{
          title: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "primaryStorage.create.storage.addMode.info",
                defaultMessage: `### Storage Addition Method

- New: Creates a brand new data storage by initializing an unused LUN into a data storage usable by the platform. You can choose whether to clear existing data on the LUN device during addition.
- Register: Imports LUNs that already contain data (for example, storage migrated from another platform or replicated through disaster recovery) into the platform. The platform will identify its SAN storage structure and repair the metadata. During registration, all LUN devices under that SAN storage will be automatically added.`,
              })}
            </ReactMarkdown>
          ),
        }}
        initialValue="create"
        required
      >
        <RadioGroup
          onChange={() => {
            form?.setFieldsValue({
              diskUuidList: [],
              sanStorageUuid: undefined,
            });
          }}
          options={[
            {
              value: "create",
              label: intl.formatMessage({
                id: "primaryStorage.create.storage.addMode.create",
                defaultMessage: "New",
              }),
            },
            ...(hasRegisterAuth
              ? [
                  {
                    value: "register",
                    label: intl.formatMessage({
                      id: "primaryStorage.create.storage.addMode.register",
                      defaultMessage: "Register",
                    }),
                  },
                ]
              : []),
          ]}
        />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.storageAddMode !== currentValues.storageAddMode ||
          prevValues.cluster !== currentValues.cluster
        }
      >
        {({ getFieldValue }) => {
          const storageAddMode = getFieldValue("storageAddMode");

          // 注册模式：显示已选择的 LUN 设备列表和重新选择按钮
          if (storageAddMode === "register") {
            return (
              <Form.Item
                name="diskUuidList"
                label={intl.formatMessage({
                  id: "LunDevice",
                  defaultMessage: "LUN",
                })}
                icon="info"
                iconTooltip={{
                  title: (
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "virtualization.primaryStorage.field.sharedblock.tooltip",
                        defaultMessage: `### LUN

1. LUNs are provided by iSCSI, FC, or NVMe storage. Make sure the iSCSI, FC, or NVMe storage are connected to the host and added to the platform.
2. To use LUNs provided by iSCSI storage, attach the iSCSI storage to the cluster you select in advance.`,
                      })}
                    </ReactMarkdown>
                  ),
                }}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "virtualization.primaryStorage.field.LunDevice.validator.required",
                      defaultMessage: "Select a LUN.",
                    }),
                  },
                ]}
                description={
                  <div className={styles.lunCaption}>
                    {intl.formatMessage({
                      id: "primarystorage.field.select.sharedblock.alert.info",
                      defaultMessage:
                        "Select LUNs provided by iSCSI, FC, or NVMe storage. Attach an iSCSI storage to the cluster in advance if you need the LUNs it provides.",
                    })}
                  </div>
                }
              >
                <div className={styles.registerLunContainer}>
                  {diskUuidList.length > 0 ? (
                    <>
                      <div
                        id="diskUuidList"
                        className={styles["select-lun-width"]}
                      >
                        <List
                          size="small"
                          bordered
                          dataSource={diskUuidList}
                          renderItem={(lun) => (
                            <List.Item>{lun.wwid}</List.Item>
                          )}
                        />
                      </div>
                      <Button
                        variant="link"
                        className={styles["add-lun-link"]}
                        onClick={() => setRegisterModalVisible(true)}
                      >
                        <Icon style={{ verticalAlign: "middle" }} type="plus" />
                        {intl.formatMessage({
                          id: "primaryStorage.register.lun.reselect",
                          defaultMessage: "Reselect",
                        })}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="link"
                      className={styles["add-lun-link"]}
                      onClick={() => setRegisterModalVisible(true)}
                    >
                      <Icon style={{ verticalAlign: "middle" }} type="plus" />
                      {intl.formatMessage({
                        id: "primaryStorage.register.lun.add",
                        defaultMessage: "Add LUN",
                      })}
                    </Button>
                  )}
                </div>
              </Form.Item>
            );
          }
          return (
            <Form.Item
              name="diskUuidList"
              label={intl.formatMessage({
                id: "LunDevice",
                defaultMessage: "LUN",
              })}
              icon="info"
              iconTooltip={{
                title: (
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "virtualization.primaryStorage.field.sharedblock.tooltip",
                      defaultMessage: `### LUN

1. LUNs are provided by iSCSI, FC, or NVMe storage. Make sure the iSCSI, FC, or NVMe storage are connected to the host and added to the platform.
2. To use LUNs provided by iSCSI storage, attach the iSCSI storage to the cluster you select in advance.`,
                    })}
                  </ReactMarkdown>
                ),
              }}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "virtualization.primaryStorage.field.LunDevice.validator.required",
                    defaultMessage: "Select a LUN.",
                  }),
                },
              ]}
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.cluster !== currentValues.cluster
              }
              description={
                <div className={styles.lunCaption}>
                  {intl.formatMessage({
                    id: "primarystorage.field.select.sharedblock.alert.info",
                    defaultMessage:
                      "Select LUNs provided by iSCSI, FC, or NVMe storage. Attach an iSCSI storage to the cluster in advance if you need the LUNs it provides.",
                  })}
                </div>
              }
            >
              <ModalSelect
                className={styles["select-lun-width"]}
                onChange={(value: ICandidateSharedBlock[]) => {
                  form?.setFieldsValue({ diskUuidList: value });
                }}
                title={intl.formatMessage({
                  id: "virtualization.primaryStorage.field.LunDevice.select.modal.title",
                  defaultMessage: "Select LUN",
                })}
                selectType="checkbox"
                needRemoveSelected={false}
                modalWidth={800}
                primaryKey="wwid"
                value={diskUuidList}
                label={intl.formatMessage({
                  id: "primaryStorage.register.lun.add",
                  defaultMessage: "Add LUN",
                })}
              >
                <SharedBlockSelectList
                  view="select"
                  defaultQuery={diskLunQuery}
                />
              </ModalSelect>
            </Form.Item>
          );
        }}
      </Form.Item>

      <StorageNetworkInfo form={form} diskUuidList={diskUuidList} />

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.storageAddMode !== currentValues.storageAddMode ||
          prevValues.forceWipe !== currentValues.forceWipe
        }
      >
        {({ getFieldValue }) => {
          const storageAddMode = getFieldValue("storageAddMode");
          if (storageAddMode === "register") {
            return null;
          }
          return (
            <Form.Item
              name="forceWipe"
              label={intl.formatMessage({
                id: "clearLunDevice",
                defaultMessage: "Cleanse LUN",
              })}
              valuePropName="checked"
              description={
                <div className={styles.caption}>
                  <Icon style={iconAlertStyleShared} type="alert-triangle-fill" />
                  {form?.getFieldValue("forceWipe")
                    ? intl.formatMessage({
                        id: "virtualization.primaryStorage.field.force.blockDevice.true.validator.tips",
                        defaultMessage:
                          "Forcibly clean up the data in the LUN, such as the signature in the file system, RAID, and partition table.",
                      })
                    : intl.formatMessage({
                        id: "virtualization.primaryStorage.field.force.blockDevice.false.validator.tips",
                        defaultMessage:
                          "If data exists in the LUN, you might fail to add LUNs or attach data storage.",
                      })}
                </div>
              }
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Checkbox />
                {intl.formatMessage({
                  id: "virtualization.primaryStorage.field.forceWipe.checkbox.clearLunDevice",
                  defaultMessage: "Cleanse existing data in LUNs",
                })}
              </span>
            </Form.Item>
          );
        }}
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.storageAddMode !== currentValues.storageAddMode
        }
      >
        {({ getFieldValue }) => {
          const storageAddMode = getFieldValue("storageAddMode");
          // 只在注册模式下显示存储UUID字段
          if (storageAddMode !== "register") {
            return null;
          }
          return (
            <Form.Item
              name="storageUuidMode"
              label={intl.formatMessage({
                id: "primaryStorage.create.storage.uuid",
                defaultMessage: "Storage UUID",
              })}
              icon="info"
              iconTooltip={{
                title: (
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "primaryStorage.create.storage.uuid.info",
                      defaultMessage: `### Storage UUID

- Keep: Retains the existing UUID of the SAN storage unchanged.
- Reset: Regenerates a new UUID for the SAN storage. This is useful in scenarios such as UUID conflicts after cloning or snapshots, or when decoupling from the production environment during disaster recovery drills. After reset, the original UUID becomes invalid. If other hosts continue to access the storage using the original UUID, I/O errors will occur.`,
                    })}
                  </ReactMarkdown>
                ),
              }}
              initialValue="keep"
              required
            >
              <RadioGroup
                options={[
                  {
                    value: "keep",
                    label: intl.formatMessage({
                      id: "primaryStorage.create.storage.uuid.keep",
                      defaultMessage: "Keep",
                    }),
                  },
                  {
                    value: "reset",
                    label: intl.formatMessage({
                      id: "primaryStorage.create.storage.uuid.reset",
                      defaultMessage: "Reset",
                    }),
                  },
                ]}
              />
            </Form.Item>
          );
        }}
      </Form.Item>

      <RegisterLunSelectModal
        visible={registerModalVisible}
        setVisible={setRegisterModalVisible}
        onOk={handleAddlun}
        clusterUuid={form?.getFieldValue("clusterUuid")}
      />
    </>
  );
};

export default SharedBlockStorageDeviceInfo;
