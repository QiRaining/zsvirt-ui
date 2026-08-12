import { gql, useQuery } from "@apollo/client";
import { Button, Text } from "@zstack/design";
import { Select, Alert, Form, Table } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import type {
  DiscoveredSharedBlock,
  SharedBlockGroupLunInfo,
} from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onCancel?: () => void;
  onOk: (sharedBlocks: DiscoveredSharedBlock[], vgUuid: string) => void;
  clusterUuid?: string;
}
const GET_SHARED_BLOCK_GROUP_LUNS = gql`
  query getSharedBlockGroupLuns($clusterUuid: String!) {
    getSharedBlockGroupLuns(clusterUuid: $clusterUuid) {
      lunInfos {
        vgUuid
        status
        sharedBlocks {
          diskUuid
          totalCapacity
          vendor
        }
      }
    }
  }
`;

const RegisterLunSelectModal: React.FC<IProps> = ({
  visible,
  setVisible,
  onCancel,
  onOk,
  clusterUuid: _clusterUuid,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [showLunIntegrityError, setShowLunIntegrityError] = useState(false);

  const { data } = useQuery(GET_SHARED_BLOCK_GROUP_LUNS, {
    variables: {
      clusterUuid: _clusterUuid,
    },
    skip: !_clusterUuid,
    fetchPolicy: "no-cache",
  });

  const lunInfos: SharedBlockGroupLunInfo[] = useMemo(
    () =>
      (data?.getSharedBlockGroupLuns?.lunInfos as SharedBlockGroupLunInfo[]) ??
      [],
    [data],
  );

  const selectedVgUuid = Form.useWatch<string>("vgUuid", form);

  const vgOptions = useMemo(() => {
    return lunInfos.map((entry) => ({
      label: `san-uuid-${entry.vgUuid}`,
      value: entry.vgUuid,
    }));
  }, [lunInfos]);

  const selectedLunInfo = useMemo(() => {
    if (!selectedVgUuid) {
      return;
    }
    return lunInfos.find((entry) => entry.vgUuid === selectedVgUuid);
  }, [selectedVgUuid, lunInfos]);

  const sharedBlockList = useMemo(() => {
    return selectedLunInfo?.sharedBlocks || [];
  }, [selectedLunInfo]);

  // 完整性校验：status 为 Disconnected 时表示 VG 不完整
  const lunIntegrityError = useMemo(() => {
    return selectedLunInfo?.status === "Disconnected";
  }, [selectedLunInfo]);

  // VG 切换时，清空上一次"确定校验"的错误提示
  useEffect(() => {
    setShowLunIntegrityError(false);
  }, [selectedVgUuid]);

  useEffect(() => {
    if (visible) {
      if (lunInfos.length > 0) {
        form.setFieldsValue({ vgUuid: lunInfos[0].vgUuid });
      } else {
        form.resetFields();
      }
    } else {
      form.resetFields();
    }
  }, [visible, form, lunInfos]);

  const columns = useMemo(
    () => [
      {
        key: "diskUuid",
        title: "WWID",
        width: 200,
        render: (current: DiscoveredSharedBlock) => (
          <Text>{current.diskUuid || "无"}</Text>
        ),
      },
      {
        key: "vendor",
        title: intl.formatMessage({
          id: "vendor",
          defaultMessage: "Vendor",
        }),
        width: 100,
        render: (current: DiscoveredSharedBlock) => (
          <Text>{current.vendor || "无"}</Text>
        ),
      },
      {
        key: "totalCapacity",
        title: intl.formatMessage({
          id: "capacity",
          defaultMessage: "Capacity",
        }),
        width: 100,
        render: (current: DiscoveredSharedBlock) => (
          <Text>
            {current.totalCapacity
              ? formatBytesToSize(current.totalCapacity)
              : "无"}
          </Text>
        ),
      },
    ],
    [intl],
  );
  // 处理确定
  const handleOk = () => {
    if (!selectedVgUuid || sharedBlockList.length === 0) {
      return;
    }
    // 点击"确定"时做完整性校验，不通过则提示并阻止提交
    if (lunIntegrityError) {
      setShowLunIntegrityError(true);
      return;
    }
    onOk(sharedBlockList, selectedVgUuid);
  };

  return (
    <DialogBase
      title={intl.formatMessage({
        id: "virtualization.primaryStorage.field.LunDevice.select.modal.title",
        defaultMessage: "Select LUN",
      })}
      visible={visible}
      setVisible={(v) => {
        setVisible(v);
        if (!v && onCancel) {
          onCancel();
        }
      }}
      widthClassName="w-[800px]"
      footer={
        <div className="flex gap-2">
          <Button
            variant="subtle"
            onClick={() => {
              setVisible(false);
              onCancel?.();
            }}
          >
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button
            variant="primary"
            onClick={handleOk}
            disabled={!selectedVgUuid || sharedBlockList.length === 0}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </div>
      }
    >
      <div className={styles.registerLunModal}>
        {/* 提示信息 */}
        <Alert
          display="blockStrong"
          type="info"
          message={intl.formatMessage({
            id: "primaryStorage.register.lun.select.tip",
            defaultMessage:
              "When a SAN storage is selected, all LUN devices under that storage will be automatically added.",
          })}
          style={{ marginBottom: 16 }}
        />

        <Form form={form}>
          {/* VG 选择器 */}
          <Form.Item label="VG" name="vgUuid" required>
            <Select
              options={vgOptions}
              style={{ width: 400 }}
              getPopupContainer={(triggerNode) =>
                triggerNode.parentElement || document.body
              }
            />
          </Form.Item>

          {/* LUN设备表格 */}
          <Form.Item
            label={intl.formatMessage({
              id: "LunDevice",
              defaultMessage: "LUN",
            })}
            className={styles.lunDeviceTable}
          >
            <Table
              tableLayout="fixed"
              className="zsv-table zsv-table-height-320"
              columns={columns}
              dataSource={sharedBlockList}
              rowKey="diskUuid"
              pagination={false}
              scroll={{ y: 320 }}
              size="small"
            />
            {showLunIntegrityError && lunIntegrityError && (
              <div className={styles.lunIntegrityError}>
                {intl.formatMessage({
                  id: "primaryStorage.register.lun.integrity.error",
                  defaultMessage:
                    "The number of LUNs displayed does not match the actual LUN count in the selected SAN storage. Check and try again.",
                })}
              </div>
            )}
          </Form.Item>
        </Form>
      </div>
    </DialogBase>
  );
};

export default RegisterLunSelectModal;
