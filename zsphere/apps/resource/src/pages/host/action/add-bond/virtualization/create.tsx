import { gql, useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { Text } from "@zstack/design";
import { physicalInterfaceListByClusterList } from "@zstack/virtualization-resource/src/gql/l2-network.gql";
import {
  BondNameItem,
  useDefaultQueryNicForBond,
} from "@zstack/virtualization-resource/src/pages/bond/action/create";
import type { ITabsConfigProps } from "@zstack/virtualization-resource/src/pages/cluster/components";
import { TabsConfig } from "@zstack/virtualization-resource/src/pages/cluster/components";
import { IpAddressItems } from "@zstack/virtualization-resource/src/pages/physical-nic/action/edit-ipv4-address";
import type { IComponentRef } from "@zstack/zsphere-components";
import { Form, Modal, Icon, Select } from "@zstack/zsphere-components";
import { ZSVForm } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  useAction,
  useValidator,
  IIsRequiredType,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { HostVO as IHostVO } from "@zstack/zsphere-types/graphql";
import type { Host } from "@zstack/zsphere-types/graphql";
import { intToIp, ipToInt } from "@zstack/zsphere-utils";
import { useUpdateEffect, usePersistFn } from "ahooks";
import type { FormInstance } from "antd/es/form";
import _ from "lodash-es";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

const WIDTH_490_STYLE = { width: 490 } as const;
const WIDTH_320_STYLE = { width: 320 } as const;

export type InnerFormConfig = {
  [key: string]: {
    form: FormInstance;
    alert: boolean;
    validatorForm: (value?: any) => Promise<boolean>;
  };
};

export type InnerFormProps = {
  host: Host;
  initialValues: any;
  className: any;
  onSetAlert: () => any;
  autoValidFields?: boolean;
  required?: boolean;
};

export function isNetworkAddress(ipAddress: string, subnetMask: string) {
  // 将 IP 地址和子网掩码转换成十进制数值
  const ipDecimal = ipAddress.split(".").map((num) => parseInt(num, 10));
  const subnetMaskDecimal = subnetMask
    .split(".")
    .map((num) => parseInt(num, 10));

  const networkAddressDecimal = ipDecimal
    .map((num, i) => num & subnetMaskDecimal[i])
    .join(".");
  return ipAddress === networkAddressDecimal;
}

export function isBroadcastAddress(ipAddress: string, subnetMask: string) {
  // 将 IP 地址和子网掩码转换成十进制数值
  const ipDecimal = ipAddress.split(".").map((num) => parseInt(num, 10));
  const subnetMaskDecimal = subnetMask
    .split(".")
    .map((num) => parseInt(num, 10));

  // 计算广播地址的十进制数值
  const broadcastAddressDecimal = ipDecimal
    .map((num, i) => num | (~subnetMaskDecimal[i] & 0b11111111))
    .join(".");

  // 判断 IP 地址是否等于广播地址
  return ipAddress === broadcastAddressDecimal;
}

const initialValues = {
  enabled: true,
};

export interface IBondFormItemProps {
  form: FormInstance;
  clusterUuids?: string[];
  required?: boolean;
  hiddenDescription?: boolean;
  isCreatByL2?: boolean;
  hideName?: boolean;
  inAttachCluster?: boolean;
  originPhysicalNicList?: string[];
}

export const BondFormItem: React.FC<IBondFormItemProps> = ({
  required,
  clusterUuids,
  hideName,
  inAttachCluster = false,
  _isCreatByL2,
  _hiddenDescription,
  originPhysicalNicList = [],
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const [getNicList, { data: bondListData }] = useLazyQuery(
    physicalInterfaceListByClusterList,
  );

  const bondInput = React.useMemo(() => {
    const list: string[] = _.sortBy(
      _.uniq(
        (bondListData?.physicalInterfaceListByClusterList ?? []).concat(
          originPhysicalNicList,
        ),
      ),
    );
    return (
      <Select mode="multiple">
        {list?.map((name: string) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>
    );
  }, [bondListData]);

  useEffect(() => {
    getNicList({
      variables: {
        clusterUuids,
      },
    });
  }, [clusterUuids, getNicList]);

  return (
    <>
      {!hideName && (
        <Form.Item
          label={intl.formatMessage({
            id: "up.bond.name",
            defaultMessage: "Uplink Name",
          })}
          required
        >
          <BondNameItem required={required} width={320} />
        </Form.Item>
      )}
      {/* <Form.Item
         label={intl.formatMessage({ id: 'description', defaultMessage: '简介' })}
         name={isCreatByL2 ? 'bondDecription' : 'description'}
         style={WIDTH_490_STYLE}
         hidden={hiddenDescription}
       >
         <TextArea rows={3} maxLength={256} isShowLimit style={WIDTH_320_STYLE} />
      </Form.Item> */}

      <Form.Item
        label={intl.formatMessage({
          id: "bond.mode.in.host",
          defaultMessage: "Bond Mode",
        })}
        name="mode"
        initialValue="802.3ad"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "bond.field.bond.mode.tooltip",
              defaultMessage: `### Bond Mode
Supports 2 Bond modes: Active-backup (mode1) and LACP (mode4).
1. Active-backup: This mode allows you to bind 1-2 physical NIC ports and we recommend that you bind 2 ports, one acting as the primary port and the other as the secondary port. The primary port handle all network flows by default. When the primary port fails, the secondary port automatically replaces the primary port to handle flows and avoid business interruptions.
2. LACP:
   - Link aggregation control protocol (LACP) mode. This mode allows you to bind 1-8 physical NIC ports and we recommend that you bind at least 2 ports. Bound ports share the same speed and duplex setting. Network flows are evenly sent to the bound ports, thus realizing a load balance.
   - A bond of this mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.
     - layer2+3: Picks out a port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
     - layer3+4: Picks out a port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
     - layer2: Picks out a port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
            })}
          </ReactMarkdown>
        }
      >
        <RadioGroup
          disabled={inAttachCluster}
          options={[
            {
              label: intl.formatMessage({
                id: "link.aggregation.mode",
                defaultMessage: "LACP (mode 4)",
              }),
              value: "802.3ad",
            },
            {
              label: intl.formatMessage({
                id: "master.backup.mode",
                defaultMessage: "Active-Backup (mode1)",
              }),
              value: "active-backup",
            },
          ]}
        />
      </Form.Item>

      <Form.Item noStyle shouldUpdate={(pre, cur) => pre.mode !== cur.mode}>
        {({ getFieldValue }: any) => {
          const mode = getFieldValue("mode");
          const isMode1 = mode === "active-backup";

          return (
            <>
              {!isMode1 && (
                <Form.Item
                  name="xmitHashPolicy"
                  label={intl.formatMessage({
                    id: "HashPolicy",
                    defaultMessage: "Hash Policy",
                  })}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "bond.field.HashPolicy.tooltip",
                        defaultMessage: `### Hash Policy
A bond of LACP mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.

1. layer2+3: Picks out a NIC port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
2. layer3+4: Picks out a NIC port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
3. layer2: Picks out a NIC port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
                      })}
                    </ReactMarkdown>
                  }
                  initialValue="layer2+3"
                >
                  <RadioGroup
                    disabled={inAttachCluster}
                    options={["layer2+3", "layer3+4", "layer2"].map(
                      (value) => ({
                        value,
                        label: value,
                      }),
                    )}
                  />
                </Form.Item>
              )}
              <Form.Item
                name="physicalNicList"
                label={intl.formatMessage({
                  id: "physical.network.port",
                  defaultMessage: "Physical Port",
                })}
                icon="info"
                required={required}
                rules={
                  required
                    ? [
                        isRequired(IIsRequiredType.select),
                        () => ({
                          validator: (rule, value) => {
                            if (isMode1 && _.compact(value).length > 2) {
                              return Promise.reject(
                                new Error(
                                  intl.formatMessage({
                                    id: "bond.field.physical.network.port.mode1.validator",
                                    defaultMessage:
                                      "The Active-Backup mode supports bonding 1 to 2 physical ports. Adjust your selection.",
                                  }),
                                ),
                              );
                            }
                            if (!isMode1 && _.compact(value).length > 8) {
                              return Promise.reject(
                                new Error(
                                  intl.formatMessage({
                                    id: "bond.field.physical.network.port.mode4.validator",
                                    defaultMessage:
                                      "The LACP mode supports bonding 1 to 8 physical ports. Adjust your selection.",
                                  }),
                                ),
                              );
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]
                    : undefined
                }
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "bond.field.physical.network.port.tooltip",
                      defaultMessage: `### Physical NIC Port
1. Add physical NIC ports to the bond. A bond of Active-Backup mode supports 1-2 ports. A bond of LACP mode supports 1-8 ports.
2. We recommend that you add only physical NIC ports of the same type to a bond.
3. Make sure that all NIC ports in a bond have the same speed rate.
4. If you are configuring bonds for more than one host in bulk, a NIC port you select must exist on each of the hosts. For example, to add NIC port eth0 to bonds, make sure that each of the hosts has a NIC port named eth0.`,
                    })}
                  </ReactMarkdown>
                }
                style={WIDTH_490_STYLE}
              >
                {bondInput}
              </Form.Item>
            </>
          );
        }}
      </Form.Item>
    </>
  );
};

const InnerFormBase: React.ForwardRefRenderFunction<
  InnerFormConfig["hostUuid"],
  InnerFormProps
> = (
  { host, className, onSetAlert, autoValidFields = true, required },
  ref,
) => {
  const [form] = Form.useForm();
  const [alert, setAlert] = React.useState(false);

  // 用于记录已经触发校验的fieldKey，避免新的校验通过之后，旧的校验失效。
  const validateKeyRef = React.useRef<string[]>([]);
  React.useEffect(
    () => () => {
      validateKeyRef.current = [];
    },
    [],
  );

  // alert 变化需要让外层的react node重新渲染
  useUpdateEffect(onSetAlert, [alert]);

  const validatorForm = React.useCallback(
    (value?: any) => {
      if (value) {
        Object.keys(value).forEach((fieldKey) => {
          if (!validateKeyRef.current.includes(fieldKey)) {
            validateKeyRef.current.push(fieldKey);
          }
        });
      }

      return form
        ?.validateFields(value && validateKeyRef.current)
        .then(() => {
          setAlert(false);
          return false;
        })
        .catch((_error) => {
          // if (error.errorFields) {
          //   const namePath = error.errorFields[0].name
          //   innerForm.scrollToField(namePath)
          // }
          setAlert(true);
          return true;
        });
    },
    [form],
  );

  React.useImperativeHandle<IComponentRef, IComponentRef>(
    ref,
    () => ({
      form,
      alert,
      validatorForm,
    }),
    [form, alert, validatorForm],
  );

  const setCurrentHostData = React.useCallback(() => {
    // 在onValueChange的时候校验需要加上setTimeout，不然会存在每次触发校验都不通过的bug
    // https://github.com/ant-design/ant-design/issues/26747#issuecomment-692553855
    setTimeout(validatorForm);
  }, [validatorForm]);

  const _hostDefaultQuery = useDefaultQueryNicForBond(host);

  return (
    <Form
      noValidate
      form={form}
      initialValues={initialValues}
      onValuesChange={autoValidFields ? setCurrentHostData : undefined}
      className={className}
    >
      <BondFormItem
        form={form}
        required={required}
        // defaultQuery={{
        //   ...hostDefaultQuery,
        //   type: PhysicalNicQueryType.getCandidatesPhysicalNicForSingleCreateOrModifyBond
        // }}
      />
      <IpAddressItems />
    </Form>
  );
};
export const InnerForm = React.forwardRef(InnerFormBase);

const CreateBond: React.ForwardRefRenderFunction<
  IComponentRef,
  { selectedList: IHostVO[]; ipv4InfoTooltip: React.ReactNode }
> = (props, ref) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const [updateIndex, update] = React.useState<number>(0);
  const { selectedList, ipv4InfoTooltip } = props;

  const formRef = React.useRef<InnerFormConfig>({});
  const getFormConfig = React.useCallback(
    (hostUuid) => formRef.current[hostUuid],
    [],
  );

  React.useImperativeHandle<IComponentRef, IComponentRef>(
    ref,
    () => ({
      form,
      async transform() {
        const formList = Object.entries(formRef.current).map(
          ([uuid, config]) => ({
            uuid,
            ...config,
          }),
        );
        const validatorList = await Promise.all(
          formList.map((config) => config?.validatorForm?.()),
        );
        if (validatorList.some((result) => result)) {
          return null;
        }
        return formList.map((config) => ({
          hostUuid: config.uuid,
          ...config.form.getFieldsValue(),
        }));
      },
    }),
    [],
  );

  const setRef = React.useCallback((innerRef, hostUuid) => {
    formRef.current[hostUuid] = innerRef ?? ({} as InnerFormConfig["HostUuid"]);
  }, []);

  const defaultConditions = React.useMemo(() => {
    return [
      {
        key: "interfaceName",
        op: Op.in,
        value: `getapi(api='GetCandidateNetworkInterfaces', output='slaveNames', hostUuids=list(${selectedList
          .map((item) => `'${item.uuid}'`)
          .join(",")}))`,
      },
      {
        key: "hostUuids",
        op: Op.in,
        values: _.compact(selectedList?.map((it) => it.uuid)),
      },
    ];
  }, [selectedList]);

  // 需要取交集。getApi
  const _defaultQuery = useDefaultQueryNicForBond(
    selectedList?.[0],
    defaultConditions,
  );

  const getIncrementIP = React.useCallback((ipAddress, netmask) => {
    // 计算被网络地址和广播地址跳过的ip地址个数
    let n = 0;

    const incrementIP: (index: number) => string = (index) => {
      const startIpInt = ipToInt(ipAddress);
      const nextIp = intToIp(startIpInt + index + n);
      if (
        isBroadcastAddress(nextIp, netmask) ||
        isNetworkAddress(nextIp, netmask)
      ) {
        n += 1;
        return incrementIP(index);
      }
      return nextIp;
    };
    return incrementIP;
  }, []);

  const setAllHost = React.useCallback(
    (changeValue, values) => {
      setTimeout(() => {
        form.validateFields(Object.keys(changeValue)).then(() => {
          // 如果改变的是ip地址 or 子网掩码，需要两个字段都有值才可以下发设置
          const isIpConfig =
            Reflect.has(changeValue, "ipv4Address") ||
            Reflect.has(changeValue, "netmask");
          if (isIpConfig) {
            if (!values.ipv4Address || !values.netmask) {
              return;
            }
          }
          // 计算被网络地址和广播地址跳过的ip地址个数
          const incrementIP = getIncrementIP(
            values.ipv4Address,
            values.netmask,
          );
          selectedList.forEach((host, index) => {
            const innerFormConfig = getFormConfig(host.uuid);
            const innerValue = _.cloneDeep(changeValue);
            // 子网掩码和ip要相互设置
            if (isIpConfig) {
              innerValue.ipv4Address = incrementIP(index);
              innerValue.netmask = values.netmask;
            }
            innerFormConfig.form?.setFieldsValue(innerValue);
            innerFormConfig?.validatorForm(innerValue);
          });
        });
      });
    },
    [form, getFormConfig, getIncrementIP, selectedList],
  );

  const items = React.useMemo<ITabsConfigProps["items"]>(
    () =>
      selectedList.map((host) => ({
        key: host.uuid,
        closable: false,
        label: (
          <div className={style.tabLabel}>
            <div>
              <Text>{host.name}</Text>
            </div>
            {getFormConfig(host.uuid)?.alert && (
              <Icon type="alert-triangle-fill" color="alert" />
            )}
          </div>
        ),
        children: (
          <InnerForm
            initialValues={initialValues}
            ref={(innerRef) => setRef(innerRef, host.uuid)}
            host={host}
            onSetAlert={() => {
              update(updateIndex + 1);
            }}
            className=""
            required
          />
        ),
      })),
    [getFormConfig, selectedList, setRef, updateIndex],
  );

  const [activeKey, setActiveKey] = React.useState(items[0].key);

  return (
    <>
      <Form
        form={form}
        initialValues={initialValues}
        onValuesChange={setAllHost}
      >
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "virtualization.host.field.multiple.add.bond.card.title",
            defaultMessage: "Batch Configure Aggregate Ports",
          })}
        >
          <BondFormItem
            form={form}
            hiddenDescription
            // defaultQuery={{
            //   ...defaultQuery,
            //   type: PhysicalNicQueryType.getCandidatesPhysicalNicForMultipleCreateBond
            // }}
          />
          <IpAddressItems
            info={intl.formatMessage({
              id: "host.setting.mutiple.ipv4.address.info",
              defaultMessage:
                "Assigns IPv4 to bonds successively based on the start IPv4 and netmask. Make sure that the gateway address is not assigned to any bond. Otherwise, a network interruption may occur.",
            })}
            ipv4Text={intl.formatMessage({
              id: "assign.start.ipv4",
              defaultMessage: "Specify Start IPv4",
            })}
            ipv4InfoTooltip={ipv4InfoTooltip}
          />
        </ZSVForm.Card>
      </Form>

      <ZSVForm.Card
        title={intl.formatMessage({
          id: "virtualization.host.field.single.add.bond.card.title",
          defaultMessage: "Single Configuration",
        })}
        indented={false}
      >
        <TabsConfig
          activeKey={activeKey}
          onChange={setActiveKey}
          titleConfig={{
            leftWidht: 200,
            leftTitle: intl.formatMessage({
              id: "host",
              defaultMessage: "Host",
            }),
            rightTitle: intl.formatMessage({
              id: "bond.config.info",
              defaultMessage: "Bond Configuration",
            }),
          }}
          items={items}
        />
      </ZSVForm.Card>
    </>
  );
};

const CreateBase = React.forwardRef<
  IComponentRef,
  { selectedList: IHostVO[]; ipv4InfoTooltip: React.ReactNode }
>(CreateBond);

const createBond = gql`
  mutation createBond($input: CreateBondInput!) {
    createBond(input: $input) {
      actionId
    }
  }
`;

export enum AddMethodEnum {
  Multiple = "Multiple",
  Single = "Single",
}

export interface IProps {
  onBack: Function;
}

const VirCreate: React.FC<IActionWrapperProps<IHostVO> & IProps> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  onBack,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const formRef = React.useRef<IComponentRef>({});

  const title = intl.formatMessage({
    id: "vir.host.add.bond",
    defaultMessage: "Add Bond",
  });

  const submitHandle = usePersistFn(async () => {
    if (formRef.current?.transform) {
      const finalList = await formRef.current.transform({});

      if (finalList) {
        const result = finalList.map((item: any) => {
          return {
            hostUuids: [item?.hostUuid],
            slaveNames: item.physicalNicList?.map(
              (nic: any) => nic.interfaceName,
            ),
            ipAddress: item.ipv4Address,
            ..._.pick(item, [
              "xmitHashPolicy",
              "description",
              "gateway",
              "mode",
              "netmask",
              "bondingName",
            ]),
          };
        });
        doAction({
          mutation: createBond,
          payload: result,
          name: intl.formatMessage({
            id: "add.AggPort",
            defaultMessage: "Add Bond",
          }),
          total: selectedList.length,
          type: "Bond",
          onProgress: () => {
            setVisible(false);
            setSelectedList?.([]);
          },
        });
        onBack();
      }
    }
  });
  const ipv4InfoTooltip = React.useMemo(
    () => (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "host.action.multiple.createBond.field.ipv4Info.tooltip",
          defaultMessage: "### IPv4 Address\n\n1. If you are configuring bonds in bulk, the system assigns IPv4 addresses successively in the address range based on the start IPv4 and netmask. The broadcast and network addresses are skipped automatically. For example, if you are configuring 3 bonds with the start IPv4 as 192.168.20.254 and netmask as 255.255.255.0, the system assigns 192.168.20.254, 192.168.21.1, and 192.168.21.2 to these 3 bonds respectively.\n\n2. Note that:\n \n- Gateway addresses are not skipped automatically. Configure your start IPv4 and netmask carefully to avoid assigning the gateway address to a bond. Otherwise, a network interruption may occur.\n- If an IPv4 in the range has been occupied, the corresponding bond skips it and uses the next IPv4 automatically.\n- If available IPv4 addresses in the range are insufficient for the bonds, you need to manually specify IPv4 addresses for the bonds that have not been assigned IPv4 by the system.",
        })}
      </ReactMarkdown>
    ),
    [intl],
  );

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      title={title}
      widthClassName="w-200"
      onCancel={() => onBack()}
      onOk={submitHandle}
      className={style["create-modal"]}
    >
      <Form form={form} className={style.form}>
        {/* <Form.Item
          label={intl.formatMessage({
            id: 'virtualization.add.bond.method',
            defaultMessage: '添加方式'
          })}
          name="method"
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: 'virtualization.add.bond.method.iconTooltip',
                defaultMessage: ''
              })}
            </ReactMarkdown>
          }
        >
          <RadioGroup
            options={[
              {
                value: AddMethodEnum.Multiple,
                label: intl.formatMessage({
                  id: 'virtualization.add.bond.method.multiple',
                  defaultMessage: '批量'
                })
              },
              {
                value: AddMethodEnum.Single,
                label: intl.formatMessage({
                  id: 'irtualization.add.method.single',
                  defaultMessage: '单个'
                })
              },
            ]}
          />
        </Form.Item> */}

        <CreateBase
          selectedList={selectedList}
          ipv4InfoTooltip={ipv4InfoTooltip}
          ref={formRef}
        />
      </Form>
    </DialogForm>
  );
};

export default VirCreate;
