import { RadioGroup, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import L3NetworkList from "@zstack/virtualization-resource/src/pages/l3-network/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op, VmInstanceState } from "@zstack/zsphere-types";
import type { VmNic, L3Network } from "@zstack/zsphere-types/graphql";
import type { ColumnType } from "antd/es/table";
import { isEmpty } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import VmNicList, { VmNicStateTableSelectAlertFooter } from "../../list";

import style from "./style.module.less";

export interface ISgVmNicFormProps {
  defaultQuery?: IQuery;
  zoneUuid?: string;
}

export function SgVmNicForm(props: ISgVmNicFormProps) {
  const { defaultQuery = {}, zoneUuid } = props;

  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const form = Form.useFormInstance()!;

  const getNicDefaultQuery = React.useCallback((l3NetworkUuids) => {
    const baseConditions = [
      {
        key: "vmInstance.state",
        op: Op.in,
        values: [VmInstanceState.Stopped, VmInstanceState.Running],
      },
      {
        key: "vmInstance.type",
        op: Op.eq,
        value: "UserVm",
      },
      {
        key: "type",
        op: Op.ne,
        value: "VF",
      },
    ];

    if (!isEmpty(l3NetworkUuids)) {
      baseConditions.push({
        key: "usedIp.l3NetworkUuid",
        op: Op.in,
        values: l3NetworkUuids,
      });
    }

    return {
      conditions: baseConditions,
    };
  }, []);

  const l3NetworkDefaultQuery = useMemo(() => {
    return {
      conditions: [
        { key: "defaultFilter", value: "NOT_DEFAULT" },
        {
          key: "networkServices.networkServiceType",
          op: Op.eq,
          value: "SecurityGroup",
        },
        {
          key: "system",
          op: Op.eq,
          value: "false",
        },
        {
          key: "l2Network.cluster.type",
          op: Op.eq,
          value: "zstack",
        },
        ...(zoneUuid
          ? [
              {
                key: "zoneUuid",
                op: Op.eq,
                value: zoneUuid,
              },
            ]
          : []),
      ],
    };
  }, [zoneUuid]);

  const nicColumnConfig = useMemo<ColumnType<VmNic>[]>(() => {
    return [
      {
        title: intl.formatMessage({
          id: "vm.vmNic",
          defaultMessage: "VM NIC",
        }),
        key: "name",
        render: (_, current) => <Text>{current?.internalName}</Text>,
      },
      {
        title: intl.formatMessage({
          id: "ipv4.address",
          defaultMessage: "IPv4 Address",
        }),
        key: "ipv4",
        width: 160,
        render: (_, current) => {
          const ipv4 = current?.usedIps?.find(
            (item) => item.ipVersion === 4,
          )?.ip;
          if (!ipv4) {
            return (
              <span className={style.noneText}>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            );
          }
          return <CopyableText>{ipv4}</CopyableText>;
        },
      },
      {
        title: intl.formatMessage({
          id: "ipv6.address",
          defaultMessage: "IPv6 Address",
        }),
        key: "ipv6",
        width: 200,
        render: (_, current) => {
          const ipv6 = current?.usedIps?.find(
            (item) => item.ipVersion === 6,
          )?.ip;
          if (!ipv6) {
            return (
              <span className={style.noneText}>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            );
          }
          return <CopyableText>{ipv6}</CopyableText>;
        },
      },
      {
        title: intl.formatMessage({ id: "action", defaultMessage: "Actions" }),
        key: "__action__",
        width: 52,
        render: (_, current) => (
          <div
            className={style.trashIconWrapper}
            onClick={() => {
              const vmNics = form.getFieldValue("vmNics");
              form.setFieldsValue({
                vmNics: vmNics?.filter(
                  (item: VmNic) => item.uuid !== current.uuid,
                ),
              });
            }}
          >
            <Icon type="trash" />
          </div>
        ),
      },
    ];
  }, [intl, form]);

  return (
    <>
      <Form.Item
        name="l3NetworkType"
        label={intl.formatMessage({
          id: "portGroup.range",
          defaultMessage: "Distributed Port Group Range",
        })}
      >
        <RadioGroup
          onValueChange={(value) => {
            if (value !== "all") {
              form.setFieldsValue({
                l3Network: [],
                vmNics: [],
              });
            }
          }}
          options={[
            {
              value: "all",
              label: intl.formatMessage({
                id: "all.portGroup",
                defaultMessage: "All Port Group",
              }),
            },
            {
              value: "manual",
              label: intl.formatMessage({
                id: "specify.publicNetwork",
                defaultMessage: "Specify Port Group",
              }),
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.l3NetworkType !== curr.l3NetworkType}
      >
        {({ getFieldValue }) => {
          const l3NetworkType = getFieldValue("l3NetworkType");
          if (l3NetworkType === "all") {
            return null;
          }
          return (
            <Form.Item
              name="l3Network"
              label={intl.formatMessage({
                id: "portGroup",
                defaultMessage: "Distributed Port Group",
              })}
              rules={[isRequired(IIsRequiredType.select)]}
            >
              <ModalSelect
                listClassName="width-400 list-height-240"
                selectType="checkbox"
                title={intl.formatMessage({
                  id: "add.l3.network",
                  defaultMessage: "Add Distributed Port Group",
                })}
                label={intl.formatMessage({
                  id: "add.l3.network",
                  defaultMessage: "Add Distributed Port Group",
                })}
                onChange={(l3NetworkList) => {
                  const l3NetworkUuids = new Set(
                    l3NetworkList?.map((item) => item.uuid) ?? [],
                  );
                  const vmNics = form.getFieldValue("vmNics");
                  form.setFieldsValue({
                    vmNics: vmNics?.filter((item: VmNic) =>
                      l3NetworkUuids.has(item.l3NetworkUuid),
                    ),
                  });
                }}
              >
                <L3NetworkList
                  view="select.virtualization"
                  defaultQuery={l3NetworkDefaultQuery}
                />
              </ModalSelect>
            </Form.Item>
          );
        }}
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.l3Network !== curr.l3Network ||
          prev.l3NetworkType !== curr.l3NetworkType
        }
      >
        {({ getFieldValue }) => {
          const l3Network: L3Network[] = getFieldValue("l3Network") ?? [];
          const l3NetworkUuids = l3Network?.map((item) => item.uuid) ?? [];
          const l3NetworkType = getFieldValue("l3NetworkType");
          const vmNicDefaultQuery = getNicDefaultQuery(l3NetworkUuids);
          const disabledBtn = l3NetworkType !== "all" && !l3Network.length;

          return (
            <Form.Item
              name="vmNics"
              label={intl.formatMessage({
                id: "vm.vmNic",
                defaultMessage: "VM NIC",
              })}
              rules={[isRequired(IIsRequiredType.select)]}
            >
              <ModalSelect
                listClassName={style.vmNicTable}
                title={intl.formatMessage({
                  id: "add.vm.nic",
                  defaultMessage: "Add VM NIC",
                })}
                selectType="checkbox"
                visibleKey="internalName"
                renderFooter={(args) => (
                  <VmNicStateTableSelectAlertFooter {...args} />
                )}
                label={intl.formatMessage({
                  id: "add.vm.nic",
                  defaultMessage: "Add VM NIC",
                })}
                columnConfig={nicColumnConfig}
                alertType="error"
                alertMessage={intl.formatMessage({
                  id: "sg.bind.vmNic.modal.alertMessage",
                  defaultMessage: "",
                })}
                disabledBtn={disabledBtn}
                tooltip={
                  disabledBtn
                    ? intl.formatMessage({
                        id: "security.group.field.add.vm.nic.disabled.tooltip",
                        defaultMessage: "Select a distributed port group.",
                      })
                    : undefined
                }
              >
                <VmNicList
                  view="select.sg"
                  defaultQuery={{
                    ...vmNicDefaultQuery,
                    ...defaultQuery,
                    conditions: [
                      ...vmNicDefaultQuery.conditions,
                      ...(defaultQuery.conditions ?? []),
                      ...(l3NetworkType !== "all"
                        ? [
                            {
                              key: "l3NetworkUuid",
                              op: Op.in,
                              values: l3NetworkUuids,
                            },
                          ]
                        : []),
                    ],
                  }}
                />
              </ModalSelect>
            </Form.Item>
          );
        }}
      </Form.Item>
    </>
  );
}
