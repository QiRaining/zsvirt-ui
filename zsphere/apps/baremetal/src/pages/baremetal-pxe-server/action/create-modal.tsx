import { gql } from "@apollo/client";
import { RadioGroup, Tooltip } from "@zstack/design";
import { Form, Input, ModalSelect, ZSVForm } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import { formatResourceName, ipToInt, isIP } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import PxeServerList from "../list";

import style from "./style.module.less";

const radioGroupStyle = { marginLeft: 12 } as const;

// 注意：以下带 Tooltip 的 Input 包装组件必须定义在组件外部，
// 否则每次父组件重渲染都会产生新的组件标识，导致 Radix Tooltip 内部
// 的 composeRefs 不断挂载/卸载 ref，触发 "Maximum update depth exceeded"。
// 同时必须用 <span> 包裹 <Input>，避免 Radix Tooltip 的 asChild
// ref 合并与 antd Input 自身的 ref setState 产生循环（参考 ZSV-12031 /
// baremetal-cluster/action/base/create-modal.tsx 的同款写法）。
const TooltipInput: React.FC<
  { title: React.ReactNode; className?: string } & Record<string, any>
> = ({ title, className, ...props }) => (
  <Tooltip title={title}>
    <span>
      <Input {...props} className={className} />
    </span>
  </Tooltip>
);

const configBaremetalPxeServer = gql`
  mutation configBaremetalPxeServer($input: ConfigBaremetalPxeServerInput!) {
    configBaremetalPxeServer(input: $input) {
      actionId
    }
  }
`;

interface IProps extends IActionWrapperProps<IBaremetalPxeServer> {
  initialValues?: any;
}

const CreatePxeModal: React.FC<IProps> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  source,
  setSelectedList,
  initialValues,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const { commonNameRules } = useValidator(intl);

  const defaultValues = {
    sshUsername: "root",
    sshPort: 22,
    configType: "manual",
    ...initialValues,
  };

  const storagePathTooltip = intl.formatMessage({
    id: "baremetalpxeservice.storage.path",
    defaultMessage: "Example: /pxe_store",
  });
  const dhcpRangeEndTooltip = intl.formatMessage({
    id: "baremetalpxeservice.dhcp.end.ip",
    defaultMessage: "Example: 192.168.0.255",
  });
  const hostnameTooltip = intl.formatMessage({
    id: "baremetalpxeservice.ip",
    defaultMessage: "Example: 192.168.0.1",
  });
  const dhcpRangeBeginTooltip = intl.formatMessage({
    id: "baremetalpxeservice.dhcp.begin.ip",
    defaultMessage: "Example: 192.168.0.100",
  });
  const dhcpInterfaceTooltip = intl.formatMessage({
    id: "baremetalpxeservice.dhcp.monitor.network.card",
    defaultMessage: "Example: eth0",
  });

  const onOk = async (values: any) => {
    // source 在不同入口下含义不同：
    // - 数据中心详情页打开：source 是 Zone（无 zoneUuid 字段，zone.uuid 也为 undefined）
    // - 集群列表页打开：source 是 Cluster（有 zoneUuid）
    // 选中行 selectedList[0] 始终是被操作的 Cluster，优先从中取 uuid 与 zoneUuid。
    const targetCluster: any = selectedList?.[0];
    const isZoneSource = source?.__typename === "Zone";
    const clusterUuid =
      targetCluster?.uuid ?? (isZoneSource ? undefined : source?.uuid);
    const zoneUuid =
      targetCluster?.zoneUuid ||
      targetCluster?.zone?.uuid ||
      (isZoneSource ? source?.uuid : source?.zoneUuid || source?.zone?.uuid);

    const payload = {
      name: values.pxeName,
      description: values.description,
      dhcpInterface: values.dhcpInterface,
      storagePath: values.storagePath,
      sshPort: Number(values.sshPort),
      sshUsername: values.sshUsername,
      sshPassword: values.sshPassword,
      dhcpRangeBegin: values.dhcpRangeBegin,
      dhcpRangeEnd: values.dhcpRangeEnd,
      clusterUuid: clusterUuid ? [clusterUuid] : [],
      hostname: values.hostname,
      zoneUuid,
      configType: values.configType,
      pxeServerUuid: values?.pxeServer?.[0]?.uuid,
    };
    doAction({
      mutation: configBaremetalPxeServer,
      payload,
      type: "BaremetalPxeServer",
      name: intl.formatMessage({
        id: "baremetal.pxeservice.action.config",
        defaultMessage: "Attach Deployment Server",
      }),
      total: 1,
      onFinish: () => {
        setVisible(false);
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <DialogForm
      form={form}
      visible={visible}
      resourceName={formatResourceName(selectedList, intl)}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "baremetal.pxeservice.modal.title.create",
        defaultMessage: "Attach Deployment Server",
      })}
      widthClassName="w-150"
    >
      <Form form={form} initialValues={defaultValues}>
        <Form.Item
          name="configType"
          label={intl.formatMessage({
            id: "config.type",
            defaultMessage: "Deployment Server Source",
          })}
        >
          <RadioGroup
            style={radioGroupStyle}
            options={[
              {
                value: "manual",
                label: intl.formatMessage({
                  id: "manual.config",
                  defaultMessage: "New",
                }),
              },
              {
                value: "attach",
                label: intl.formatMessage({
                  id: "attach.pxeservice",
                  defaultMessage: "Existing",
                }),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.configType !== currentValues.configType
          }
        >
          {({ getFieldValue }) => {
            const configType = getFieldValue("configType");
            if (configType === "manual") {
              return (
                <>
                  <ZSVForm.Card className={style.card} showLine>
                    <Form.Item
                      name="pxeName"
                      label={intl.formatMessage({
                        id: "baremetal.pxeservice.name",
                        defaultMessage: "Deployment Server Name",
                      })}
                      rules={commonNameRules}
                    >
                      <Input className={style["width-320"]} />
                    </Form.Item>
                    <Form.Item
                      name="dhcpInterface"
                      label={intl.formatMessage({
                        id: "baremetal.pxeservice.dhcpInterfaces",
                        defaultMessage: "DHCP Listening NIC",
                      })}
                      icon="info"
                      iconTooltip={
                        <>
                          <ReactMarkdown>
                            {intl.formatMessage({
                              id: "baremetal.pxeservice.dhcpInterfaces.type.tooltip",
                              defaultMessage: "DHCP Monitoring NIC\n\nThe NIC device number on the deployment server that connects to the provisioning network.\n\n- This NIC must be connected to the deployment network of the bare metal chassis and have a configured IP address.\n- The network where this NIC resides must not have any other DHCP services.",
                            })}
                          </ReactMarkdown>
                        </>
                      }
                      rules={[
                        { required: true, message: "请输入DHCP监听网卡" },
                      ]}
                    >
                      <TooltipInput
                        title={dhcpInterfaceTooltip}
                        className={style["width-320"]}
                      />
                    </Form.Item>
                    <Form.Item
                      name="storagePath"
                      label={intl.formatMessage({
                        id: "baremetal.pxeservice.storagePath",
                        defaultMessage: "Storage Path",
                      })}
                      rules={[{ required: true, message: "请输入存储路径" }]}
                    >
                      <TooltipInput
                        title={storagePathTooltip}
                        className={style["width-320"]}
                      />
                    </Form.Item>
                    <Form.Item
                      name="hostname"
                      label={intl.formatMessage({
                        id: "baremetal.pxeservice.hostname",
                        defaultMessage: "Deployment Server IP",
                      })}
                      required
                      rules={[
                        () => ({
                          validator(rule, value) {
                            if (!value) {
                              return Promise.reject(
                                Error(
                                  intl.formatMessage({
                                    id: "baremetal.pxeservice.hostname.required",
                                    defaultMessage: "Enter a deployment server IP.",
                                  }),
                                ),
                              );
                            }
                            if (isIP(value)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              Error(
                                intl.formatMessage({
                                  id: "baremetal.pxeservice.hostname.format",
                                  defaultMessage: "Invalid deployment server IP",
                                }),
                              ),
                            );
                          },
                        }),
                      ]}
                    >
                      <TooltipInput
                        title={hostnameTooltip}
                        className={style["width-320"]}
                      />
                    </Form.Item>
                    <Form.Item
                      name="sshPort"
                      label={intl.formatMessage({
                        id: "baremetal.pxeservice.sshPort",
                        defaultMessage: "SSH Port",
                      })}
                      rules={[{ required: true, message: "请输入SSH端口" }]}
                    >
                      <Input className={style["width-80"]} />
                    </Form.Item>
                    <Form.Item
                      name="sshUsername"
                      label={intl.formatMessage({
                        id: "baremetal.pxeservice.username",
                        defaultMessage: "Username",
                      })}
                      rules={[{ required: true, message: "请输入用户名" }]}
                    >
                      <Input className={style["width-320"]} />
                    </Form.Item>
                    <Form.Item
                      name="sshPassword"
                      label={intl.formatMessage({
                        id: "baremetal.pxeservice.sshPassword",
                        defaultMessage: "Password",
                      })}
                      rules={[{ required: true, message: "请输入密码" }]}
                    >
                      <Input.Password className={style["width-320"]} />
                    </Form.Item>{" "}
                    <Form.Item
                      label={intl.formatMessage({
                        id: "baremetal.pxeservice.dhcpRangeBegin",
                        defaultMessage: "DHCP Start IP",
                      })}
                      icon="info"
                      iconTooltip={{
                        title: (
                          <>
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "baremetal.pxeservice.field.dhcpRangeBegin.tooltip",
                                defaultMessage: `### Start IP/ End IP

1. Used for traversing IP ranges of DHCP services.
2. If this field can be left blank, the system will detect and filter used IP address as IP ranges according to this NIC IP addresses.`,
                              })}
                            </ReactMarkdown>
                          </>
                        ),
                      }}
                      name="dhcpRangeBegin"
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(rule, value) {
                            if (
                              !value ||
                              !getFieldValue("dhcpRangeBegin") ||
                              !getFieldValue("dhcpRangeEnd") ||
                              ipToInt(getFieldValue("dhcpRangeEnd")) >
                                ipToInt(value)
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(Error("无效的DHCP起始IP"));
                          },
                        }),
                      ]}
                    >
                      <TooltipInput
                        title={dhcpRangeBeginTooltip}
                        className={style["width-320"]}
                      />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "baremetal.pxeservice.dhcpRangeEnd",
                        defaultMessage: "DHCP End IP",
                      })}
                      name="dhcpRangeEnd"
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(rule, value) {
                            if (
                              !value ||
                              !getFieldValue("dhcpRangeBegin") ||
                              !getFieldValue("dhcpRangeEnd") ||
                              ipToInt(getFieldValue("dhcpRangeBegin")) <
                                ipToInt(value)
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(Error("无效的DHCP结束IP"));
                          },
                        }),
                      ]}
                    >
                      <TooltipInput
                        title={dhcpRangeEndTooltip}
                        className={style["width-320"]}
                      />
                    </Form.Item>
                  </ZSVForm.Card>
                </>
              );
            }
            if (configType === "attach") {
              return (
                <ZSVForm.Card showLine className={style.card}>
                  <Form.Item
                    name="pxeServer"
                    label={intl.formatMessage({
                      id: "baremetal.pxeservice",
                      defaultMessage: "Deployment Server",
                    })}
                    rules={[{ required: true, message: "请选择部署服务器" }]}
                  >
                    <ModalSelect
                      title={intl.formatMessage({
                        id: "select.pxeservice",
                        defaultMessage: "Select Deployment Server",
                      })}
                      className={style["width-320"]}
                    >
                      <PxeServerList
                        view="select.baremetal.cluster"
                        defaultQuery={{
                          conditions: [
                            {
                              key: "state",
                              op: Op.eq,
                              value: "Enabled",
                            },
                          ],
                        }}
                      />
                    </ModalSelect>
                  </Form.Item>
                </ZSVForm.Card>
              );
            }
            return null;
          }}
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default CreatePxeModal;
