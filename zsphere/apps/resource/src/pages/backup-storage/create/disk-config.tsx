import { RadioGroup } from "@zstack/design";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  ModalSelect,
  ZSVForm,
  Switch,
  Form,
  Input,
} from "@zstack/zsphere-components";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { FreeHardDiskInfo } from "@zstack/zsphere-types/graphql";
import { isCidr, isPath } from "@zstack/zsphere-utils";
import type { FC } from "react";
import React, { useMemo, useState, useRef } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import DiskList from "../components/FreeDisk/list";

import styles from "./style.module.less";

export interface IProps {
  form: any;
}

export enum AddWay {
  FreeDisk = "FreeDisk",
  LocalDir = "LocalDir",
}

const { Card } = ZSVForm;

const confirmButtonStyle: React.CSSProperties = { marginRight: 8 };

const DiskConfig: FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [selectDiskVisible, setSelectDiskVisible] = useState<boolean>(false);
  const [addWay, setAddWay] = useState<AddWay>(AddWay.FreeDisk);
  const freeDiskRef = useRef<FreeHardDiskInfo[]>([]);

  const queryDiskListConditions = useMemo(() => {
    const { username, password, sshPort, hostname } = form.getFieldsValue();
    return {
      conditions: [
        { key: "username", op: Op.eq, value: username },
        { key: "password", op: Op.eq, value: password },
        { key: "sshPort", op: Op.eq, value: Number(sshPort) },
        { key: "hostName", op: Op.ne, value: hostname },
      ],
    };
  }, [form.getFieldsValue()]);

  const selectDiskHandler = (freeDisk: FreeHardDiskInfo[]) => {
    if (freeDisk?.[0]?.withPartition) {
      setConfirmVisible(true);
      freeDiskRef.current = freeDisk;
    } else {
      setSelectDiskVisible(false);
      form.setFieldsValue({ freeDisk });
    }
  };

  const confirmOk = () => {
    setConfirmVisible(false);
    setSelectDiskVisible(false);
    form.setFieldsValue({ freeDisk: freeDiskRef.current });
  };

  const addWayDesc = useMemo(() => {
    return addWay === AddWay.FreeDisk
      ? intl.formatMessage({
          id: "addWay.description",
          defaultMessage:
            "This configuration will format the selected disks and completely erase all partitions, file systems, and data on the disk.",
        })
      : null;
  }, [addWay, intl]);

  return (
    <Card
      title={intl.formatMessage({
        id: "diskConfig",
        defaultMessage: "Disk Configuration",
      })}
    >
      <Form.Item
        name="addWay"
        label={intl.formatMessage({ id: "addWay", defaultMessage: "Addition Method" })}
        description={addWayDesc}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.primaryStorage.field.addWay.tooltip",
              defaultMessage: `### Addition Method

- Free Disk: Uses the unmounted or unpartitioned disks on hosts as the storage. The system will automatically format the selected host disks and create a mount path.
- Local Directory: Uses the local directory on hosts as the storage.`,
            })}
          </ReactMarkdown>
        }
      >
        <RadioGroup
          value={AddWay.LocalDir}
          onValueChange={(val) => setAddWay(val as AddWay)}
          options={[
            {
              value: AddWay.FreeDisk,
              label: intl.formatMessage({
                id: "free.disk",
                defaultMessage: "Free Disk",
              }),
            },
            {
              value: AddWay.LocalDir,
              label: intl.formatMessage({
                id: "local.directory",
                defaultMessage: "Local Directory",
              }),
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => prev.addWay !== next.addWay}
      >
        {({ getFieldValue }) => {
          return getFieldValue("addWay") === AddWay.FreeDisk ? (
            <>
              <Form.Item
                name="freeDisk"
                label={intl.formatMessage({
                  id: "free.disk",
                  defaultMessage: "Free Disk",
                })}
                rules={[isRequired(IIsRequiredType.select)]}
              >
                <ModalSelect
                  title={intl.formatMessage({
                    id: "select.free.disk",
                    defaultMessage: "Select Free Disk",
                  })}
                  visible={selectDiskVisible}
                  setVisible={setSelectDiskVisible}
                  selectType="radio"
                  className={styles["width-320"]}
                  alertMessage={intl.formatMessage({
                    id: "select.disk.alert",
                    defaultMessage:
                      "This configuration will format the selected disks and completely erase all partitions, file systems, and data on the disk.",
                  })}
                  alertClosable={false}
                  alertType="error"
                  renderFooter={({ onCancel, selectedList }) => {
                    return (
                      <>
                        <Button
                          variant="link"
                          onClick={() => {
                            onCancel();
                          }}
                        >
                          {intl.formatMessage({
                            id: "cancel",
                            defaultMessage: "Cancel",
                          })}
                        </Button>
                        <Button
                          onClick={() => {
                            selectDiskHandler(selectedList);
                          }}
                          variant="primary"
                          style={confirmButtonStyle}
                          disabled={!selectedList.length}
                        >
                          {intl.formatMessage({
                            id: "ok",
                            defaultMessage: "OK",
                          })}
                        </Button>
                      </>
                    );
                  }}
                >
                  <DiskList
                    view="select"
                    defaultQuery={queryDiskListConditions}
                  />
                </ModalSelect>
              </Form.Item>
            </>
          ) : null;
        }}
      </Form.Item>

      <Form.Item
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
                return Promise.reject(
                  intl.formatMessage({
                    id: "global.field.validator.input.required",
                    defaultMessage: "This field is required.",
                  }),
                );
              }

              if (!isPath(value)) {
                return Promise.reject(
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
        tooltip={intl.formatMessage({
          id: "virtualization.backupStorage.field.local.url.hover",
          defaultMessage: "/vms_is",
        })}
        description={
          <div className={styles.caption}>
            <Icon
              type="alert-triangle-fill"
              color="danger"
              className="zstack-icon"
            />
            <ReactMarkdown>
              {intl.formatMessage({
                id: "backupStorage.field.url.description",
                defaultMessage:
                  "System directories such as /, /dev, /proc, /sys, /usr/bin, and /bin cannot be used. Using system directories might cause hosts unable to work properly.",
              })}
            </ReactMarkdown>
          </div>
        }
      >
        <Input className={styles["width-320"]} />
      </Form.Item>

      <Form.Item
        name="importImages"
        valuePropName="checked"
        label={intl.formatMessage({
          id: "getAvailableImage",
          defaultMessage: "Retrieve Existing Image",
        })}
        auth={{ authKey: "get.available.image", resource: "backup.storage" }}
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="syncImageNetwork"
        label={intl.formatMessage({
          id: "imageSyncNetwork",
          defaultMessage: "Image Sync Network",
        })}
        auth={{ authKey: "image.sync.network", resource: "backup.storage" }}
        validateTrigger="onBlur"
        rules={[
          {
            validator(rule, value: string) {
              if (value && !isCidr(value)) {
                return Promise.reject(
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
        <Input className={styles["width-240"]} />
      </Form.Item>

      <Form.Item
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
                return Promise.reject(
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
        <Input className={styles["width-240"]} />
      </Form.Item>

      <DialogWeakP1
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        type="warning"
        title={intl.formatMessage({
          id: "confirm.format.disk",
          defaultMessage: `Format Selected Disk?`,
        })}
        onConfirm={() => {
          confirmOk();
        }}
        description={
          <div>
            {intl.formatMessage({
              id: "confirm.format.disk.content",
              defaultMessage:
                "Formatting selected disks will erase all partitions, file systems, and data on the disk. Proceed with caution.",
            })}
          </div>
        }
      />
    </Card>
  );
};

export default DiskConfig;
