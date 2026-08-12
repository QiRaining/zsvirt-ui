import { gql, useLazyQuery } from "@apollo/client";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useIpAllocationItem } from "@zstack/virtualization-resource/src/pages/l3-network/create/ip-range-form";
import { useValidatorIp } from "@zstack/virtualization-resource/src/pages/vm/utils";
import {
  Switch,
  TextArea,
  Form,
  Modal,
  Input,
} from "@zstack/zsphere-components";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, ResourceQueryType } from "@zstack/zsphere-types";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type { Rule } from "antd/lib/form";
import React, { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "../create/style.module.less";

const FORM_ITEM_MARGIN_STYLE = { marginBottom: "16px" } as const;
const INPUT_WIDTH_STYLE = { width: "80px" } as const;

const editL3NetworkConfig = gql`
  mutation editL3NetworkConfig($input: EditL3NetworkConfigInput!) {
    editL3NetworkConfig(input: $input) {
      actionId
    }
  }
`;

const queryResourceCount = gql`
  query validateVlanIdUsed($vlanId: String!, $vSwitchUuid: String!) {
    validateVlanIdUsed(vlanId: $vlanId, vSwitchUuid: $vSwitchUuid) {
      result
    }
  }
`;

const queryVlanId = gql`
  query queryL3NetworkList($conditions: [Condition!]) {
    l3NetworkList(conditions: $conditions) {
      list {
        uuid
        portGroup {
          uuid
          vlanId
        }
      }
    }
  }
`;

function isValidNumberString(str: string) {
  // 去除字符串两端的空白
  str = str.trim();

  // 如果字符串为空，返回 false
  if (str === "") {
    throw new Error("输入的字符串为空");
  }

  // 使用正则表达式匹配整数格式
  const integerPattern = /^0$|^[1-9]\d*$/;

  if (!integerPattern.test(str)) {
    return false;
  }

  // 检查是否在 JavaScript 的安全整数范围内
  const num = Number(str);
  if (!Number.isSafeInteger(num)) {
    return false;
  }

  return true;
}
const Action: React.FC<IActionWrapperProps<Partial<IL3Network>>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const [dhcpConfirmVisible, setDhcpConfirmVisible] = useState(false);
  const [dhcp4Validating, setDhcp4Validating] = useState(false);
  const [dhcp6Validating, setDhcp6Validating] = useState(false);
  const doAction = useAction();
  const [form] = Form.useForm();
  const { isRequired, numberRange, validatorUniqName, longDescriptionRules } =
    useValidator(intl);
  const validateIp = useValidatorIp();
  const IpAllocationItem = useIpAllocationItem();

  const current = selectedList?.[0];
  const enableIPAM = !!current?.enableIPAM;
  const l2NetworkUuid = current?.l2NetworkUuid || "";
  const l3NetworkUuid = current?.uuid || "";
  const vSwitchUuid = current?.vSwitch?.uuid || "";

  const hasIpv4Range = !!current?.ipRanges?.find(
    (item) => item.ipVersion === 4 && item.ipRangeType === "Normal",
  );
  const hasIpv6Range = !!current?.ipRanges?.find(
    (item) => item.ipVersion === 6 && item.ipRangeType === "Normal",
  );

  const initialValues = useMemo(() => {
    if (!current) {
      return {};
    }
    return {
      dhcpService: !!current.networkServices?.find(
        (item) => item.networkServiceType === "DHCP",
      ),
      dhcpIpv4: current.dhcpIp?.ipv4 ?? "",
      dhcpIpv6: current.dhcpIp?.ipv6 ?? "",
      mtu: current.mtu,
      name: current.name,
      vlanId:
        current.portGroup?.vlanId && current.portGroup.vlanId !== "0"
          ? current.portGroup.vlanId
          : undefined,
      description: current.description,
      ipAllocateStrategy:
        current.ipAllocateStrategy?.split("Strategy")?.[0] ??
        "RandomIpAllocator",
    };
  }, [current]);

  const [query, { data }] = useLazyQuery(queryVlanId, {
    variables: {
      conditions: [
        {
          key: "portGroup.vSwitchUuid",
          op: Op.eq,
          value: vSwitchUuid,
        },
        {
          key: "__systemTag__",
          op: Op.eq,
          value: "portGroup::default",
        },
      ],
    },
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
  });
  const defaultPortGroup = data?.l3NetworkList?.list?.[0]?.portGroup;
  const defaultVlanId = defaultPortGroup && Number(defaultPortGroup.vlanId);
  const originVlanId = initialValues.vlanId ? Number(initialValues.vlanId) : 0;
  const vlanFieldDisabled = defaultVlanId === originVlanId;

  const getVlanFieldDisabledTooltip = () => {
    return originVlanId
      ? intl.formatMessage({
          id: "vlanId.field.disabled.tooltip",
          defaultMessage:
            "Cannot modify VLAN ID. The VLAN ID is the same as that of the default distributed port group.",
        })
      : intl.formatMessage({
          id: "vlanId.field.empty.disabled.tooltip",
          defaultMessage:
            "Cannot modify VLAN ID. The current distributed port group and the default distributed port group both have VLAN type set to none.",
        });
  };

  const onOk = async (input: any) => {
    const payload: Record<string, any> = {};

    if (
      input.name !== initialValues.name ||
      input.description !== initialValues.description
    ) {
      payload.name = input.name;
      payload.description = input.description;
    }

    const mtu = Number(input.mtu);
    if (mtu !== initialValues.mtu) {
      payload.mtu = mtu;
    }

    if (
      enableIPAM &&
      input.ipAllocateStrategy &&
      input.ipAllocateStrategy !== initialValues.ipAllocateStrategy
    ) {
      payload.ipAllocateStrategy = `${input.ipAllocateStrategy}Strategy`;
    }

    const vlanId = input.vlanId ? Number(input.vlanId) : 0;
    if (vlanId !== originVlanId) {
      payload.vlanIdParams = {
        uuid: l2NetworkUuid,
        virtualNetworkId: vlanId,
      };
    }

    if (enableIPAM && input.dhcpService !== initialValues.dhcpService) {
      payload.dhcpService = input.dhcpService;
      if (input.dhcpService) {
        payload.dhcpIpv4 = input.dhcpIpv4;
        payload.dhcpIpv6 = input.dhcpIpv6;
      }
    }

    if (
      enableIPAM &&
      hasIpv4Range &&
      input.dhcpService &&
      input.dhcpIpv4 !== initialValues.dhcpIpv4
    ) {
      payload.dhcpIpv4 = input.dhcpIpv4;
    }

    if (
      enableIPAM &&
      hasIpv6Range &&
      input.dhcpService &&
      input.dhcpIpv6 !== initialValues.dhcpIpv6
    ) {
      payload.dhcpIpv6 = input.dhcpIpv6;
    }

    if (!Object.keys(payload).length) {
      setVisible(false);
      return;
    }

    doAction({
      mutation: editL3NetworkConfig,
      payload: { l3NetworkUuid, ...payload },
      name: intl.formatMessage({
        id: "virtualization.edit.config",
        defaultMessage: "Modify Configuration",
      }),
      total: 1,
      type: "L3Network",
    });

    setVisible(false);
  };

  const validatorVlanIdUsed = () => {
    return {
      validator: async (__: Rule, value: any) => {
        const currentVlanId = value ? Number(value) : 0;

        if (originVlanId === currentVlanId) {
          return;
        }

        try {
          const res = await window.g_main.apolloClient.query({
            query: queryResourceCount,
            variables: {
              vlanId: String(currentVlanId),
              vSwitchUuid,
            },
          });

          const isUsed = res?.data?.validateVlanIdUsed?.result;

          if (!isUsed) {
            const errorMessage = currentVlanId
              ? intl.formatMessage({
                  id: "vlanId.validate.used",
                  defaultMessage: "The VLAN ID is already in use.",
                })
              : intl.formatMessage({
                  id: "vlanId.validate.used.empty",
                  defaultMessage: "A distributed port group with VLAN type set to \"None\" already exists.",
                });
            return Promise.reject(errorMessage);
          }
        } catch (error) {
          console.error("Error occurred during name validation:", error);
          const errorMessage = intl.formatMessage({
            id: "vlanId.validate.used.error",
            defaultMessage: "The VLAN ID Used Query Error",
          });
          return Promise.reject(errorMessage);
        }

        return;
      },
    };
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ ...initialValues });
      query();
    }
  }, [initialValues, form, visible, query]);

  return (
    <>
      <DialogForm
        onOk={onOk}
        form={form}
        setVisible={setVisible}
        visible={visible}
        onCancel={() => setVisible(false)}
        title={intl.formatMessage({
          id: "virtualization.edit.config",
          defaultMessage: "Modify Configuration",
        })}
        resourceName={formatResourceName(selectedList, intl)}
        confirmLoading={dhcp4Validating || dhcp6Validating}
      >
        <Form form={form} className={styles.card}>
          <div className={styles.title}>
            {intl.formatMessage({
              id: "basic.info",
              defaultMessage: "Basic Info",
            })}
          </div>
          <Form.Item
            name="name"
            label={intl.formatMessage({
              id: "name",
              defaultMessage: "Name",
            })}
            rules={[
              isRequired(),
              validatorUniqName(
                ResourceQueryType.L3Network,
                selectedList?.[0]?.name,
                intl.formatMessage({
                  id: "l3Network.field.name.validator.duplicate",
                  defaultMessage: "This name is already in use. Enter a different name.",
                }),
                true,
              ),
            ]}
          >
            <Input className="width-320" />
          </Form.Item>
          <Form.Item
            name="description"
            label={intl.formatMessage({
              id: "description",
              defaultMessage: "Description",
            })}
            rules={longDescriptionRules}
          >
            <TextArea isShowLimit limit={2000} className="width-320" rows={3} />
          </Form.Item>
          <div className={styles.title}>
            {intl.formatMessage({
              id: "config.info",
              defaultMessage: "Configurations",
            })}
          </div>
          <Form.Item
            name="vlanId"
            label={intl.formatMessage({
              id: "vlanId",
              defaultMessage: "VLAN ID",
            })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "protGroup.vlan.validator.invalid.icon.tooltip",
                  defaultMessage:
                    "VLAN ID\n\nThe valid range for VLAN ID is 1 to 4094. Leaving the input field blank indicates that the VLAN type is \"None\".\n\n- Before modifying the VLAN ID, check if any other port groups are using the same VLAN ID. This modification will impact all port groups that reuse this VLAN ID.\n- The modified VLAN ID cannot be duplicated wth the existing port groups.\n- If the current distributed port group and the default distributed port group have the same VLAN ID or both have VLAN type set to none, you cannot modify the VLAN ID.",
                })}
              </ReactMarkdown>
            }
            validateFirst
            rules={[
              () => ({
                validator(rule, values) {
                  if (!values) {
                    return Promise.resolve();
                  }

                  const vlanId = Number(values);

                  const isValidVlan =
                    Number.isInteger(vlanId) &&
                    vlanId >= 1 &&
                    vlanId <= 4094 &&
                    isValidNumberString(values);

                  if ((!vlanId || (!vlanId && vlanId !== 0)) && isValidVlan) {
                    return Promise.resolve();
                  }
                  return isValidVlan
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          intl.formatMessage({
                            id: "protGroup.vlan.validator.invalid",
                            defaultMessage:
                              "Invalid VLAN ID. Enter an integer from 1 to 4094.",
                          }),
                        ),
                      );
                },
              }),
              validatorVlanIdUsed(),
            ]}
            description={
              <div className={styles["icon-alert"]}>
                <Icon
                  className={styles.icon}
                  color="danger"
                  colorNumber={500}
                  type="alert-triangle-fill"
                />
                <span>
                  {intl.formatMessage({
                    id: "edit.prot.group.field.vlanId.description",
                    defaultMessage:
                      "Modifying VLAN ID causes VM network interruption. Suggested to perform this operation during off-peak hours. Proceed with caution.",
                  })}
                </span>
              </div>
            }
          >
            {vlanFieldDisabled ? (
              <Tooltip title={getVlanFieldDisabledTooltip()}>
                <span>
                  <Input
                    className="width-80"
                    value={initialValues.vlanId}
                    disabled
                  />
                </span>
              </Tooltip>
            ) : (
              <Input className="width-80" />
            )}
          </Form.Item>
          <Form.Item
            validateTrigger="onBlur"
            validateFirst
            name="mtu"
            rules={[
              isRequired(),
              {
                validator(rule, value) {
                  return isValidNumberString(String(value))
                    ? Promise.resolve()
                    : Promise.reject(
                        intl.formatMessage({
                          id: "please.input.positive.int.number",
                          defaultMessage: "Enter a positive integer.",
                        }),
                      );
                },
              },
              numberRange(68, 9216),
            ]}
            label="MTU"
            style={FORM_ITEM_MARGIN_STYLE}
          >
            <Input style={INPUT_WIDTH_STYLE} />
          </Form.Item>
          <Form.Item
            name="dhcpService"
            label={intl.formatMessage({
              id: "dhcp.service",
              defaultMessage: "DHCP Service",
            })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "l3Network.field.dhcpService.tooltip",
                  defaultMessage:
                    "### DHCP Service\n\nThe DHCP service is a built-in distributed service in the platform, which assigns IP addresses only to resources in the platform and does not conflict with your existing DHCP server.\n\n- By default, the DHCP service is disabled. When enabled, IP addresses are automatically assigned to resources in the platform. You can customize a DHCP IP or use the DHCP IP that the system assigned according to the IP allocation policy.",
                })}
              </ReactMarkdown>
            }
            valuePropName="checked"
            tooltip={
              !enableIPAM
                ? intl.formatMessage({
                    id: "l3Network.field.dhcpService.tooltip.ipam.not.enabled",
                    defaultMessage: "You cannot enable DHCP service because IPAM is disabled.",
                  })
                : undefined
            }
            getValueFromEvent={(value: boolean) => {
              if (initialValues.dhcpService && !value) {
                setDhcpConfirmVisible(true);
                return true;
              }
              return value;
            }}
          >
            <Switch disabled={!enableIPAM} />
          </Form.Item>
          {enableIPAM && hasIpv4Range && IpAllocationItem}
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.dhcpService !== curr.dhcpService}
          >
            {({ getFieldValue }) => {
              if (!hasIpv4Range || !getFieldValue("dhcpService")) {
                return null;
              }
              return (
                <Form.Item
                  name="dhcpIpv4"
                  label={intl.formatMessage({
                    id: "ipv4.dhcpService.ip",
                    defaultMessage: "IPv4 DHCP IP",
                  })}
                  className={styles.dhcpIpField}
                  hasFeedback={dhcp4Validating}
                  validateTrigger="onBlur"
                  required
                  rules={[
                    isRequired(),
                    {
                      validator: async (_: any, value: string) => {
                        if (value === initialValues.dhcpIpv4) {
                          return;
                        }
                        await new Promise((resolve) =>
                          setTimeout(resolve, 100),
                        );
                        setDhcp4Validating(true);
                        try {
                          await validateIp({
                            arpCheck: true,
                            ipRangeCheck: false,
                            ip: value,
                            network: { uuid: l3NetworkUuid },
                          });
                        } finally {
                          setDhcp4Validating(false);
                        }
                      },
                    },
                  ]}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "l3Network.field.dhcpServiceIp.tooltip",
                        defaultMessage:
                          "### DHCP IP\n\n1. A DHCP IP is an IP address used by the DHCP service to assign IP addresses to resources that use this distributed port group.\n2. If you create a distributed port group for the first time with the DHCP service enabled, or if you add the first network range to adistributed port group with the DHCP service enabled, you can customize the DHCP IP.\n3. If the distributed port group has a DHCP IP, you cannot customize the DHCP IP when you add a network range.\n4. The DHCP IP can be in or outside the added IP range, but it must be an unoccupied IP address in the CIDR block of the added IP range.",
                      })}
                    </ReactMarkdown>
                  }
                >
                  <Form.Tooltip
                    tooltip={intl.formatMessage({
                      id: "l3Network.field.dhcpServiceIpv4Ip.tooltip",
                      defaultMessage: "Example: 192.168.0.100",
                    })}
                  >
                    <Input className="width-320" />
                  </Form.Tooltip>
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.dhcpService !== curr.dhcpService}
          >
            {({ getFieldValue }) => {
              if (!hasIpv6Range || !getFieldValue("dhcpService")) {
                return null;
              }
              return (
                <Form.Item
                  name="dhcpIpv6"
                  label={intl.formatMessage({
                    id: "ipv6.dhcpService.ip",
                    defaultMessage: "IPv6 DHCP IP",
                  })}
                  className={styles.dhcpIpField}
                  hasFeedback={dhcp6Validating}
                  validateTrigger="onBlur"
                  required
                  rules={[
                    isRequired(),
                    {
                      validator: async (_: any, value: string) => {
                        if (value === initialValues.dhcpIpv6) {
                          return;
                        }
                        await new Promise((resolve) =>
                          setTimeout(resolve, 100),
                        );
                        setDhcp6Validating(true);
                        try {
                          await validateIp({
                            arpCheck: true,
                            ipRangeCheck: false,
                            ip: value,
                            network: { uuid: l3NetworkUuid },
                          });
                        } finally {
                          setDhcp6Validating(false);
                        }
                      },
                    },
                  ]}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "l3Network.field.dhcpServiceIp.tooltip",
                        defaultMessage:
                          "### DHCP IP\n\n1. A DHCP IP is an IP address used by the DHCP service to assign IP addresses to resources that use this distributed port group.\n2. If you create a distributed port group for the first time with the DHCP service enabled, or if you add the first network range to adistributed port group with the DHCP service enabled, you can customize the DHCP IP.\n3. If the distributed port group has a DHCP IP, you cannot customize the DHCP IP when you add a network range.\n4. The DHCP IP can be in or outside the added IP range, but it must be an unoccupied IP address in the CIDR block of the added IP range.",
                      })}
                    </ReactMarkdown>
                  }
                >
                  <Form.Tooltip
                    tooltip={intl.formatMessage({
                      id: "l3Network.field.dhcpServiceIpv6Ip.tooltip",
                      defaultMessage: "Example: 240c::6644",
                    })}
                  >
                    <Input className="width-320" />
                  </Form.Tooltip>
                </Form.Item>
              );
            }}
          </Form.Item>
        </Form>
      </DialogForm>
      <DialogWeakP1
        visible={dhcpConfirmVisible}
        setVisible={setDhcpConfirmVisible}
        type="error"
        title={String(
          intl.formatMessage({
            id: "l3Network.field.dhcpService.confirm.modal.title",
            defaultMessage: "Disable DHCP Service?",
          }),
        )}
        onConfirm={() => {
          form.setFieldsValue({ dhcpService: false });
        }}
        onCancel={() => {
          form.setFieldsValue({ dhcpService: true });
        }}
        description={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "l3Network.field.dhcpService.confirm.modal.content",
              defaultMessage:
                "1. After disabled, if VMs in this distributed port group do not have static IP addresses, proceed with caution as these VMs will lose network connections upon reboot. Recommendation: Install VMTools and configure static IPs beforehand.\n2. After disabled, no IP addresses will be automatically assigned to newly created VMs using this distributed port group.",
            })}
          </ReactMarkdown>
        }
      />
    </>
  );
};

export default Action;
