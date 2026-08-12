import { Icon } from "@zstack/icon";
import { Form, Input, Table, ZSVForm } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useValidator } from "@zstack/zsphere-hooks";
import { isPort } from "@zstack/zsphere-utils";
import type { FC } from "react";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useShallow } from "zustand/react/shallow";

import { useWizardStore } from "../../layouts/wizard-container/wizard-container";

import style from "./style.module.less";

interface IBackupStorage {
  name: string;
  ip: string;
  port: number | string;
  username?: string;
  password?: string;
  selected?: boolean;
  index?: number;
  sn?: string;
}

const { Card } = ZSVForm;

interface IAutoWayProps {
  onSelectedBsChange: (backupStorages: IBackupStorage[]) => void;
}

const AutoWay: FC<IAutoWayProps> = ({ onSelectedBsChange }) => {
  const intl = useIntl();
  const [backupStorages, setBackupStorages] = useState<IBackupStorage[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { isRequired } = useValidator(intl);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentBs, setCurrentBs] = useState<IBackupStorage | null>(null);
  const [editForm] = Form.useForm();
  const [_poolName, setPoolName] = useState<string>("");

  const wizardInfo = useWizardStore(useShallow((state) => state.wizardInfo));

  // 初始化备份存储列表
  useEffect(() => {
    // 使用storageInfo.monList作为监控节点数据源
    if (
      wizardInfo?.storageInfo?.monList &&
      wizardInfo.storageInfo.monList.length > 0
    ) {
      const initialBs = wizardInfo.storageInfo.monList.map(
        (node: any, index: number) => ({
          key: index,
          name: `Mon-${index + 1}`,
          ip: node.ip,
          port: node.port || 22,
          username: node.username || "root",
          password: node.password || "",
          selected: true,
          sn: node.sn,
        }),
      );

      setBackupStorages(initialBs);
      setSelectedRowKeys(initialBs.map((_: any, i: number) => i));

      // 通知父组件选中的备份存储
      onSelectedBsChange(initialBs.filter((bs: IBackupStorage) => bs.selected));

      // 保存存储池名称
      if (wizardInfo.storageInfo.poolName) {
        setPoolName(wizardInfo.storageInfo.poolName);
      }
    }
  }, [wizardInfo]);

  // 处理选择变化
  const handleSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);

    // 更新备份存储选中状态
    const updatedBs = backupStorages.map((bs, index) => ({
      ...bs,
      selected: newSelectedRowKeys.includes(index),
    }));

    setBackupStorages(updatedBs);

    // 通知父组件选中的备份存储
    onSelectedBsChange(updatedBs.filter((bs) => bs.selected));
  };

  // 打开编辑弹窗
  const handleEdit = (record: IBackupStorage, index: number) => {
    const bsToEdit = {
      ...record,
      index,
    };
    setCurrentBs(bsToEdit);

    editForm.setFieldsValue({
      port: record.port,
      username: record.username || "root",
      password: record.password || "",
    });

    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();

      if (currentBs && typeof currentBs.index === "number") {
        const index = currentBs.index;
        const updatedBs = [...backupStorages];

        updatedBs[index] = {
          ...updatedBs[index],
          port: values.port,
          username: values.username,
          password: values.password,
        };

        setBackupStorages(updatedBs);

        // 通知父组件选中的备份存储
        onSelectedBsChange(updatedBs.filter((bs) => bs.selected));

        setEditModalVisible(false);
      }
    } catch {
      // 表单验证失败
    }
  };

  const columns = [
    {
      title: intl.formatMessage({
        id: "monNodeManageIP",
        defaultMessage: "Monitoring Node IP",
      }),
      dataIndex: "ip",
      key: "ip",
      width: 160,
    },
    {
      title: intl.formatMessage({ id: "sshPort", defaultMessage: "SSH Port" }),
      dataIndex: "port",
      key: "port",
      width: 150,
    },
    {
      title: intl.formatMessage({ id: "username", defaultMessage: "Username" }),
      dataIndex: "username",
      key: "username",
      width: 150,
    },
    {
      title: intl.formatMessage({ id: "actions", defaultMessage: "Actions" }),
      key: "actions",
      width: 52,
      render: (_: any, record: IBackupStorage, index: number) => (
        <Icon onClick={() => handleEdit(record, index)} type="edit" />
      ),
    },
  ];

  return (
    <div style={{ margin: "20px 0 24px" }}>
      <Card
        title={intl.formatMessage({
          id: "monitor.nodes",
          defaultMessage: "Monitoring Node",
        })}
      >
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          columns={columns}
          dataSource={backupStorages.map((bs, index) => ({
            ...bs,
            key: index,
          }))}
          pagination={false}
          className={style.monitorTable}
        />

        {editModalVisible && currentBs && (
          <DialogBase
            title={intl.formatMessage({
              id: "edit.monitor.node",
              defaultMessage: "Modify Monitoring Node",
            })}
            visible={editModalVisible}
            setVisible={setEditModalVisible}
            onCancel={() => setEditModalVisible(false)}
            onOk={handleSaveEdit}
          >
            <Form form={editForm} style={{ padding: "24px 40px" }}>
              <Form.Item
                label={intl.formatMessage({
                  id: "monNodeManageIP",
                  defaultMessage: "Monitoring Node IP",
                })}
                name="ip"
              >
                {currentBs.ip}
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({
                  id: "sshPort",
                  defaultMessage: "SSH Port",
                })}
                name="port"
                rules={[
                  isRequired(),
                  () => ({
                    validator(rule, values) {
                      if (values === "" || isPort(values)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        Error(
                          intl.formatMessage({
                            id: "host.field.sshPort.validator.format",
                            defaultMessage: "Invalid SSH port.",
                          }),
                        ),
                      );
                    },
                  }),
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({
                  id: "username",
                  defaultMessage: "Username",
                })}
                name="username"
                rules={[isRequired()]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({
                  id: "password",
                  defaultMessage: "Password",
                })}
                name="password"
                rules={[isRequired()]}
              >
                <Input.Password />
              </Form.Item>
            </Form>
          </DialogBase>
        )}
      </Card>
    </div>
  );
};

export default AutoWay;
