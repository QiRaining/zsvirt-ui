import { Icon } from "@zstack/icon";
import { Form, Input, Table, ZSVForm } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useValidator } from "@zstack/zsphere-hooks";
import { isPort } from "@zstack/zsphere-utils";
import type { FC } from "react";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useShallow } from "zustand/react/shallow";

import { useWizardStore } from "../../layouts/wizard-container/wizard-container";

import style from "./styles.module.less";

interface IHost {
  name: string;
  ip: string;
  port: number | string;
  username?: string;
  password?: string;
  selected?: boolean;
  index?: number;
}

const { Card } = ZSVForm;

interface IAutoWayProps {
  onSelectedHostsChange: (hosts: IHost[]) => void;
}

const AutoWay: FC<IAutoWayProps> = ({ onSelectedHostsChange }) => {
  const intl = useIntl();
  const [hosts, setHosts] = useState<IHost[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { isRequired } = useValidator(intl);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentHost, setCurrentHost] = useState<IHost | null>(null);
  const [editForm] = Form.useForm();

  const wizardInfo = useWizardStore(useShallow((state) => state.wizardInfo));

  // 初始化主机列表
  useEffect(() => {
    if (wizardInfo?.hostList && wizardInfo.hostList.length > 0) {
      const initialHosts = wizardInfo.hostList.map(
        (host: any, index: number) => ({
          key: index,
          name: `Host-${index + 1}`,
          ip: host.ip,
          port: 22,
          username: "root",
          password: host.password || "",
          selected: true,
        }),
      );

      setHosts(initialHosts);
      setSelectedRowKeys(initialHosts.map((_: any, i: number) => i));

      // 通知父组件选中的主机
      onSelectedHostsChange(initialHosts.filter((h: IHost) => h.selected));
    }
  }, [wizardInfo]);

  // 处理选择变化
  const handleSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);

    // 更新主机选中状态
    const updatedHosts = hosts.map((host, index) => ({
      ...host,
      selected: newSelectedRowKeys.includes(index),
    }));

    setHosts(updatedHosts);

    // 通知父组件选中的主机
    onSelectedHostsChange(updatedHosts.filter((host) => host.selected));
  };

  // 打开编辑弹窗
  const handleEdit = (record: IHost, index: number) => {
    const hostToEdit = {
      ...record,
      index,
    };
    setCurrentHost(hostToEdit);

    editForm.setFieldsValue({
      name: record.name,
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

      if (currentHost && typeof currentHost.index === "number") {
        const index = currentHost.index;
        const updatedHosts = [...hosts];

        updatedHosts[index] = {
          ...updatedHosts[index],
          name: values.name,
          port: values.port,
          username: values.username,
          password: values.password,
        };

        setHosts(updatedHosts);

        // 通知父组件选中的主机
        onSelectedHostsChange(updatedHosts.filter((host) => host.selected));

        setEditModalVisible(false);
      }
    } catch {
      // 表单验证失败
    }
  };

  const columns = [
    {
      title: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
      dataIndex: "name",
      key: "name",
      width: 160,
    },
    {
      title: intl.formatMessage({ id: "ipAdress", defaultMessage: "IP Address" }),
      dataIndex: "ip",
      key: "ip",
      width: 150,
    },
    {
      title: intl.formatMessage({ id: "sshPort", defaultMessage: "SSH Port" }),
      dataIndex: "port",
      key: "port",
      width: 150,
    },
    {
      title: intl.formatMessage({ id: "actions", defaultMessage: "Actions" }),
      key: "actions",
      width: 52,
      render: (_: any, record: IHost, index: number) => (
        <Icon onClick={() => handleEdit(record, index)} type="edit" />
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 24, marginTop: 20 }}>
      <Card
        title={intl.formatMessage({
          id: "hosts.info",
          defaultMessage: "Host Info",
        })}
      >
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          columns={columns}
          dataSource={hosts.map((host, index) => ({ ...host, key: index }))}
          pagination={false}
          className={style.hostTable}
        />

        {editModalVisible && currentHost && (
          <DialogForm
            form={editForm}
            title={intl.formatMessage({
              id: "edit.host",
              defaultMessage: "Edit Host",
            })}
            visible={editModalVisible}
            setVisible={setEditModalVisible}
            onCancel={() => setEditModalVisible(false)}
            onOk={handleSaveEdit}
          >
            <Form form={editForm}>
              <Form.Item
                label={intl.formatMessage({
                  id: "name",
                  defaultMessage: "Name",
                })}
                name="name"
                rules={[isRequired()]}
              >
                <Input className="width-320" />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({
                  id: "ipAdress",
                  defaultMessage: "IP Address",
                })}
              >
                {currentHost.ip}
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
                <Input className="width-320" />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({
                  id: "ssh.username",
                  defaultMessage: "SSH Username",
                })}
                name="username"
                rules={[isRequired()]}
              >
                <Input className="width-320" />
              </Form.Item>

              <Form.Item
                label={intl.formatMessage({
                  id: "ssh.password",
                  defaultMessage: "SSH Password",
                })}
                name="password"
                rules={[isRequired()]}
              >
                <Input.Password className="width-320" />
              </Form.Item>
            </Form>
          </DialogForm>
        )}
      </Card>
    </div>
  );
};

export default AutoWay;
