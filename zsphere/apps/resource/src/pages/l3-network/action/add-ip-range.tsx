import { Input } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  addIpRange,
  addIpRangeByCidr,
} from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import { useIpRangeFormForAdd } from "@zstack/virtualization-resource/src/pages/l3-network/create/ip-range-form";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type {
  L3Network as IL3Network,
  IpRange,
} from "@zstack/zsphere-types/graphql";
import { isIP } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/lib/form";
import { get as _get } from "lodash-es";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

type IProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  refetch?: Function;
  refetchCount?: Function;
  ipVersion: 4 | 6;
  current?: IL3Network; // 当用于三层网络的时候，详情页需要传入当前三层网络current
  selectedList?: IL3Network[] | IpRange[]; // 三层网络主列表操作时。
  isEmpty?: boolean; // 网络段是否为空
};

const validatorIP = (ip: string, ipVersion: 4 | 6, msg: string) =>
  !ip || isIP(ip, ipVersion) ? Promise.resolve() : Promise.reject(Error(msg));

const Action: React.FC<IProps> = (props) => {
  const { refetchCount, visible, setVisible, selectedList } = props;
  const ipVersion = props.ipVersion || selectedList?.[0]?.ipVersion || 4;
  const current = props.current || (selectedList?.[0] as IL3Network);
  const isEmpty =
    props.isEmpty ??
    !current?.ipRanges?.some((range) => range.ipVersion === ipVersion);
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const formRef = React.createRef<FormInstance>();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        ipAllocateStrategy:
          current?.ipAllocateStrategy?.split("Strategy")?.[0] ??
          "RandomIpAllocator",
      });
    }
  }, [form, visible, current]);

  const addIpRangeFn = async (input: any) => {
    const { uuid = "" } = current || {};
    const {
      dhcpIp,
      isByCidr,
      startIp,
      endIp,
      networkCidr,
      gateway,
      ipAllocateStrategy,
      ...rest
    } = input;
    const name = isByCidr
      ? networkCidr?.[ipVersion]
      : `${startIp?.[ipVersion]}-${endIp?.[ipVersion]}`;

    const payload = {
      name,
      l3NetworkUuid: uuid,
      ipVersion: Number(ipVersion),
      startIp: startIp?.[ipVersion],
      endIp: endIp?.[ipVersion],
      gateway: gateway?.[ipVersion],
      networkCidr: networkCidr?.[ipVersion],
      ...rest,
    };

    if (ipAllocateStrategy) {
      payload.ipAllocateStrategy = `${ipAllocateStrategy}Strategy`;
    }

    if (dhcpIp) {
      payload.systemTags = [
        `flatNetwork::DhcpServer::${dhcpIp.replace("::", "--")}::ipUuid::null`,
      ];
    }

    const fn = isByCidr ? addIpRangeByCidr : addIpRange;

    doAction({
      mutation: fn,
      payload,
      name: intl.formatMessage({
        id: "add.ipRange",
        defaultMessage: "Add Network Range",
      }),
      total: 1,
      type: selectedList?.[0]?.uuid ? "L3Network" : "IpRange",
      onFinish: () => refetchCount?.(),
    });
  };

  const onOk = async (input: any) => {
    addIpRangeFn(input);
  };

  const ipRangeForm = useIpRangeFormForAdd({
    ipVersion,
    isEmpty,
  });

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "add.ipRange",
        defaultMessage: "Add Network Range",
      })}
      widthClassName="w-150"
      visible={visible}
      onOk={onOk}
      form={form}
      setVisible={setVisible}
      resourceName={current?.name}
    >
      <Form
        form={form}
        ref={formRef}
        onFinish={onOk}
        initialValues={{
          isByCidr: false,
          ipRangeType: "Normal",
        }}
      >
        {ipRangeForm}

        <Form.Item
          noStyle
          shouldUpdate={(prev: any, curr: any) =>
            prev.ipRangeType !== curr.ipRangeType
          }
        >
          {({ getFieldValue }: any) => {
            const ipRangeType = getFieldValue("ipRangeType");
            const showDhcp =
              ipRangeType !== "AddressPool" &&
              current?.networkServices?.some(
                ({ networkServiceType }) => networkServiceType === "DHCP",
              );
            return (
              showDhcp && (
                <Form.Item
                  name="dhcpIp"
                  label={
                    ipVersion === 4
                      ? intl.formatMessage({
                          id: "ipv4.dhcpService.ip",
                          defaultMessage: "IPv4 DHCP IP",
                        })
                      : intl.formatMessage({
                          id: "ipv6.dhcpService.ip",
                          defaultMessage: "IPv6 DHCP IP",
                        })
                  }
                  icon="info"
                  validateTrigger="onBlur"
                  rules={[
                    {
                      validator: (_: any, value: string) =>
                        validatorIP(
                          value,
                          ipVersion,
                          intl.formatMessage({
                            id: "ipRange.field.dhcpServiceIp.validator.format",
                            defaultMessage: "Invalid IP address.",
                          }),
                        ),
                    },
                  ]}
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "ipRange.field.dhcpServiceIp.tooltip",
                        defaultMessage: `### DHCP IP

1. A DHCP IP is an IP address occupied by the DHCP service. The DHCP service assigns IP addresses to virtual machines in this L3 network by using the DHCP IP.
2. If you create an L3 network for the first time with the DHCP service enabled, or add the first network range to an L3 network with the DHCP service enabled, you can customize the DHCP IP.
3. If the L3 network has a DHCP IP, you could not customize the DHCP IP when you add a network range.
4. The DHCP IP can be in or outside the added IP range, but it must be an unoccupied IP address in the CIDR block of the added IP range.
5. If not specified, the system would randomly assign an IP address from within the added IP range.`,
                      })}
                    </ReactMarkdown>
                  }
                >
                  {_get(current, `dhcpIp.ipv${ipVersion}`, null) || (
                    <Input className={styles["width-320"]} />
                  )}
                </Form.Item>
              )
            );
          }}
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default Action;
