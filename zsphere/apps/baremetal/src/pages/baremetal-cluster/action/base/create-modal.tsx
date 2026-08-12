import { gql } from "@apollo/client";
import { RadioGroup, Tooltip } from "@zstack/design";
import { ModalSelect, ZSVForm } from "@zstack/zsphere-components";
import { Form, TextArea, Input } from "@zstack/zsphere-components";
import { Switch } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import { ipToInt, isIP } from "@zstack/zsphere-utils";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import PxeServerList from "../../../baremetal-pxe-server/list";

import style from "../style.module.less";

const leftMarginStyle: React.CSSProperties = { marginLeft: 12 };

const CREATE_BAREMETAL_CLUSTER = gql`
  mutation createBaremetalCluster($input: CreateBaremetalClusterInput!) {
    createBaremetalCluster(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICluster>> = ({
  refetch,
  visible,
  source,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const { commonNameRules, commonDescriptionRules } = useValidator(intl);

  const defaultValues = useMemo(() => {
    const value = {
      name: "",
      description: "",
      pxeServerSshPort: "22",
      pxeServerSshUsername: "root",
      configType: "manual",
    };
    if (selectedList?.length && selectedList?.[0]?.__typename !== "Zone") {
      value.name = selectedList[0].name;
      value.description = selectedList[0].description || "";
    }
    return value;
  }, [selectedList]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(defaultValues);
    }
  }, [visible, defaultValues, form]);

  const onOk = async (values: any) => {
    setVisible(false);

    doAction({
      mutation: CREATE_BAREMETAL_CLUSTER,
      payload: {
        ...values,
        needCreatePxeServer: values.needCreatePxeServer,
        pxeServerUuid: values?.pxeServerUuid?.[0]?.uuid,
        zoneUuid:
          selectedList?.[0]?.__typename !== "Zone"
            ? source?.uuid
            : selectedList?.[0]?.uuid,
      },
      type: "Cluster",
      name: intl.formatMessage({
        id: "create.baremetalCluster",
        defaultMessage: "New Bare Metal Cluster",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "baremetalCluster.modal.title.create.baremetalCluster",
        defaultMessage: "New Bare Metal Cluster",
      })}
    >
      <Form form={form}>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "basic.info",
            defaultMessage: "Basic Info",
          })}
        >
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            rules={commonNameRules}
            tooltip={intl.formatMessage({
              id: "global.field.name.hover",
              defaultMessage:
                'Names must be 1-128 characters in length and can contain Chinese characters, letters, digits, hyphens ("-"), underscores ("_"), periods ("."), parenthesis ("()"), colons (":"), and plus signs ("+").',
            })}
          >
            <Input className={style["width-320"]} />
          </Form.Item>
          <Form.Item
            name="description"
            label={intl.formatMessage({
              id: "description",
              defaultMessage: "Description",
            })}
            rules={commonDescriptionRules}
          >
            <TextArea
              isShowLimit
              rows={3}
              className={style["width-320"]}
              maxLength={256}
            />
          </Form.Item>
        </ZSVForm.Card>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "config.info",
            defaultMessage: "Configurations",
          })}
        >
          <Form.Item
            name="needCreatePxeServer"
            label={intl.formatMessage({
              id: "baremetal.pxeservice.needCreatePxeServer.label",
              defaultMessage: "Attach Deployment Server",
            })}
            valuePropName="checked"
          >
            <Switch style={leftMarginStyle} />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.needCreatePxeServer !==
              currentValues.needCreatePxeServer
            }
          >
            {({ getFieldValue }) => {
              const needCreatePxeServer = getFieldValue("needCreatePxeServer");
              if (!needCreatePxeServer) {
                return null;
              }
              return (
                <>
                  <Form.Item
                    name="configType"
                    label={intl.formatMessage({
                      id: "config.type",
                      defaultMessage: "Deployment Server Source",
                    })}
                    // icon="info"
                    // iconTooltip={intl.formatMessage({
                    //   id: 'baremetal.cluster.config.type.tooltip',
                    //   defaultMessage: '配置方式说明'
                    // })}
                  >
                    <RadioGroup
                      style={leftMarginStyle}
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
                            id: "load.pxeservice",
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
                          <ZSVForm.Card showLine>
                            <Form.Item
                              name="pxeServerName"
                              label={intl.formatMessage({
                                id: "baremetal.pxeservice.name",
                                defaultMessage: "Deployment Server Name",
                              })}
                              rules={[
                                {
                                  required: true,
                                  message: "请输入部署服务器名称",
                                },
                              ]}
                            >
                              <Input className={style["width-320"]} />
                            </Form.Item>
                            <Form.Item
                              name="pxeServerDhcpInterface"
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
                                {
                                  required: true,
                                  message: "请输入DHCP监听网卡",
                                },
                              ]}
                            >
                              <Input className={style["width-320"]} />
                            </Form.Item>
                            <Form.Item
                              name="pxeServerStoragePath"
                              label={intl.formatMessage({
                                id: "baremetal.pxeservice.storagePath",
                                defaultMessage: "Storage Path",
                              })}
                              rules={[
                                { required: true, message: "请输入存储路径" },
                              ]}
                            >
                              <Input className={style["width-320"]} />
                            </Form.Item>
                            <Form.Item
                              name="pxeServerHostname"
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
                                            defaultMessage:
                                              "Enter a deployment server IP.",
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
                              <Input className={style["width-320"]} />
                            </Form.Item>
                            <Form.Item
                              name="pxeServerSshPort"
                              label={intl.formatMessage({
                                id: "baremetal.pxeservice.sshPort",
                                defaultMessage: "SSH Port",
                              })}
                              rules={[
                                { required: true, message: "请输入SSH端口" },
                              ]}
                            >
                              <Input className={style["width-80"]} />
                            </Form.Item>
                            <Form.Item
                              name="pxeServerSshUsername"
                              label={intl.formatMessage({
                                id: "baremetal.pxeservice.username",
                                defaultMessage: "Username",
                              })}
                              rules={[
                                { required: true, message: "请输入用户名" },
                              ]}
                            >
                              <Input className={style["width-320"]} />
                            </Form.Item>
                            <Form.Item
                              name="pxeServerSshPassword"
                              label={intl.formatMessage({
                                id: "baremetal.pxeservice.sshPassword",
                                defaultMessage: "Password",
                              })}
                              rules={[
                                { required: true, message: "请输入密码" },
                              ]}
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
                              name="pxeServerDhcpRangeBegin"
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
                                    return Promise.reject(
                                      Error("无效的DHCP起始IP"),
                                    );
                                  },
                                }),
                              ]}
                            >
                              <Tooltip
                                title={intl.formatMessage({
                                  id: "baremetalpxeservice.dhcp.begin.ip",
                                  defaultMessage: "Example: 192.168.0.100",
                                })}
                              >
                                <span>
                                  <Input className={style["width-320"]} />
                                </span>
                              </Tooltip>
                            </Form.Item>
                            <Form.Item
                              label={intl.formatMessage({
                                id: "baremetal.pxeservice.dhcpRangeEnd",
                                defaultMessage: "DHCP End IP",
                              })}
                              name="pxeServerDhcpRangeEnd"
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
                                    return Promise.reject(
                                      Error("无效的DHCP结束IP"),
                                    );
                                  },
                                }),
                              ]}
                            >
                              <Tooltip
                                title={intl.formatMessage({
                                  id: "baremetalpxeservice.dhcp.end.ip",
                                  defaultMessage: "Example: 192.168.0.255",
                                })}
                              >
                                <span>
                                  <Input className={style["width-320"]} />
                                </span>
                              </Tooltip>
                            </Form.Item>
                          </ZSVForm.Card>
                        );
                      }
                      if (configType === "attach") {
                        return (
                          <ZSVForm.Card showLine className={style.card}>
                            <Form.Item
                              name="pxeServerUuid"
                              label={intl.formatMessage({
                                id: "baremetal.pxeservice",
                                defaultMessage: "Deployment Server",
                              })}
                              rules={[
                                { required: true, message: "请选择部署服务器" },
                              ]}
                            >
                              <ModalSelect
                                title={intl.formatMessage({
                                  id: "select.pxeservice",
                                  defaultMessage: "Select Deployment Server",
                                })}
                                className={style["width-320"]}
                                selectType="radio"
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
                </>
              );
            }}
          </Form.Item>
        </ZSVForm.Card>
      </Form>
    </DialogForm>
  );
};

export default Action;
