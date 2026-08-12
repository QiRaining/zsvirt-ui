import { ZSVForm, TextArea, Form, Input } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FC } from "react";
import React, { useContext } from "react";
import { useIntl } from "react-intl";

import BackupStorageCreateContext from "./context";

import styles from "./style.module.less";

const { Card } = ZSVForm;
export interface IProps {}

const BasicConfig: FC<IProps> = () => {
  const intl = useIntl();
  const { source } = useContext(BackupStorageCreateContext);
  const { commonNameRules, longDescriptionRules } = useValidator(intl);

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Form.Item
        name="name"
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        rules={commonNameRules}
      >
        <Input className={styles["width-320"]} />
      </Form.Item>
      <Form.Item
        name="description"
        label={intl.formatMessage({
          id: "introduction",
          defaultMessage: "Description",
        })}
        rules={longDescriptionRules}
      >
        <TextArea
          rows={3}
          className={styles["width-320"]}
          isShowLimit
          limit={2000}
        />
      </Form.Item>
      <Form.Item
        name="type"
        label={intl.formatMessage({
          id: "backupStorage.type",
          defaultMessage: "Type",
        })}
      >
        {source?.createWay === "ImageStoreBackupStorage"
          ? intl.formatMessage({
              id: "backupStorage.type.imageStore",
              defaultMessage: "Standalone Image Storage",
            })
          : intl.formatMessage({
              id: "backupStorage.type.ceph",
              defaultMessage: "Distributed Image Storage",
            })}
      </Form.Item>
      <Form.Item
        name="zoneUuid"
        label={intl.formatMessage({ id: "zone", defaultMessage: "Data Center" })}
        textFormItem
      >
        {source?.zone?.name}
      </Form.Item>
    </Card>
  );
};

export default BasicConfig;
