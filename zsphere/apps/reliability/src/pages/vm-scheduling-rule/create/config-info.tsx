import { RadioGroup } from "@zstack/design";
import { Form, Input, ZSVForm } from "@zstack/zsphere-components";
import { ModalSelect } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import {
  HostQueryType,
  HostState,
  HostStatus,
  Op,
  VmInstanceState,
  VmQueryType,
} from "@zstack/zsphere-types";
import React, { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";
import HostList from "zsv_resource/host/list";
import VmList from "zsv_resource/vm/list";

import { VmSchedulingRuleType } from "../../vm-scheduling-rule/create/types";
import HostGroupList from "../host-group/list";
import VmGroupList from "../vm-group/list";

import style from "./style.module.less";

const { Card } = ZSVForm;

const BasicPart: React.FC = () => {
  const intl = useIntl();
  const { commonNameRules } = useValidator(intl);
  const { zoneUuid = "" } = useContext(ZoneUuidContext);

  const defaultQueryVmGroupList = useMemo(() => {
    return {
      conditions: [{ key: "zoneUuid", op: Op.eq, value: zoneUuid }],
    };
  }, [zoneUuid]);

  const defaultQueryVmList = useMemo(() => {
    return {
      conditions: [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        {
          key: "state",
          op: Op.in,
          values: [VmInstanceState.Running, VmInstanceState.Stopped],
        },
        { key: "hypervisorType", op: Op.ne, value: "ESX" },
      ],
      type: VmQueryType.GetVmCandidatesForAddToVmGroup,
    };
  }, [zoneUuid]);

  const defaultQueryHostGroupList = useMemo(() => {
    return {
      conditions: [{ key: "zoneUuid", op: Op.eq, value: zoneUuid }],
    };
  }, [zoneUuid]);

  const defaultQueryHostList = useMemo(() => {
    return {
      conditions: [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        { key: "state", op: Op.eq, value: HostState.Enabled },
        { key: "status", op: Op.eq, value: HostStatus.Connected },
        { key: "hypervisorType", op: Op.ne, value: "ESX" },
      ],
      type: HostQueryType.GetHostCandidatesForAddToHostGroup,
    };
  }, [zoneUuid]);

  return (
    <Card
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
      className={style.card}
    >
      <Form.Item
        name="vmGroupType"
        label={intl.formatMessage({
          id: "attach.vmGroupType",
          defaultMessage: "Associate VM Scheduling Group",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vmSchedulingRule.field.vmGroupType.tooltip",
              defaultMessage: `### Associate VM Scheduling Group

You can associate a VM scheduling policy with a new or existing VM scheduling group. After the association, the policy takes effect on all virtual machines in the scheduling group. `,
            })}
          </ReactMarkdown>
        }
      >
        <RadioGroup
          options={[
            {
              value: "available",
              label: intl.formatMessage({
                id: "availableGroup",
                defaultMessage: "Existing",
              }),
            },
            {
              value: "new",
              label: intl.formatMessage({
                id: "newGroup",
                defaultMessage: "New",
              }),
            },
          ]}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.vmGroupType !== curr.vmGroupType}
      >
        {({ getFieldValue }) => {
          return getFieldValue("vmGroupType") === "available" ? (
            <Form.Item
              name="vmGroup"
              label={intl.formatMessage({
                id: "vmGroup",
                defaultMessage: "VM Scheduling Group",
              })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "vmSchedulingRule.field.vmGroup.validator.required",
                    defaultMessage: "Select a VM scheduling group.",
                  }),
                },
              ]}
              hideRequiredMessage
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "vmSchedulingRule.field.vmGroup.tooltip",
                    defaultMessage: `### VM Scheduling Group

1. A virtual machine can be added to only one VM scheduling group. After the addition, the virtual machine will be scheduled based on the scheduling policy associated with group.

2. The scheduling policies associated with a VM scheduling group can be classified into the following four types: VM Exclusive from Each Other, VM Affinitive to Each Other, VMs Affinitive to Hosts, and VMs Exclusive from Hosts.`,
                  })}
                </ReactMarkdown>
              }
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "select.vmGroup",
                  defaultMessage: "Select VM Scheduling Group",
                })}
                selectType="radio"
              >
                <VmGroupList
                  view="select"
                  defaultQuery={defaultQueryVmGroupList}
                />
              </ModalSelect>
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="vmGroupName"
                label={intl.formatMessage({
                  id: "vmGroupName",
                  defaultMessage: "VM Scheduling Group Name",
                })}
                validateTrigger="onBlur"
                required
                rules={commonNameRules}
              >
                <Input className="width-320" />
              </Form.Item>
              <Form.Item
                name="vmList"
                label={intl.formatMessage({
                  id: "vm",
                  defaultMessage: "Virtual Machine",
                })}
                //  去除虚拟机必填判断
                // rules={[
                //   {
                //     required: true,
                //     message: intl.formatMessage({
                //       id: 'vmSchedulingRule.field.vm.validator.required',
                //       defaultMessage: '请选择云主机'
                //     })
                //   }
                // ]}
                className={style.vmList}
              >
                <ModalSelect
                  title={intl.formatMessage({
                    id: "select.vm",
                    defaultMessage: "Select Virtual Machine",
                  })}
                  selectType="checkbox"
                  label={intl.formatMessage({
                    id: "select.vm",
                    defaultMessage: "Select Virtual Machine",
                  })}
                  className={style["width-320"]}
                  needRemoveSelected={false}
                >
                  <VmList view="select" defaultQuery={defaultQueryVmList} />
                </ModalSelect>
              </Form.Item>
            </>
          );
        }}
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev.type !== curr.type || prev.hostGroupType !== curr.hostGroupType
        }
      >
        {({ getFieldValue }) => {
          return (
            [
              VmSchedulingRuleType.VmAffinityHost,
              VmSchedulingRuleType.VmAntiAffinityHost,
            ].includes(getFieldValue("type")) && (
              <>
                <Form.Item
                  name="hostGroupType"
                  label={intl.formatMessage({
                    id: "attach.hostGroupType",
                    defaultMessage: "Associate Host Scheduling Group",
                  })}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vmSchedulingRule.field.hostGroupType.tooltip",
                        defaultMessage: `### Associate Host Scheduling Group

You can associate a host scheduling policy with a new or existing host scheduling groups. After the association, the policy takes effect on all hosts in the scheduling group. `,
                      })}
                    </ReactMarkdown>
                  }
                >
                  <RadioGroup
                    options={[
                      {
                        value: "available",
                        label: intl.formatMessage({
                          id: "availableGroup",
                          defaultMessage: "Existing",
                        }),
                      },
                      {
                        value: "new",
                        label: intl.formatMessage({
                          id: "newGroup",
                          defaultMessage: "New",
                        }),
                      },
                    ]}
                  />
                </Form.Item>
                {getFieldValue("hostGroupType") === "available" ? (
                  <Form.Item
                    name="hostGroup"
                    label={intl.formatMessage({
                      id: "hostGroup",
                      defaultMessage: "Host Scheduling Group",
                    })}
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: "vmSchedulingRule.field.hostGroup.validator.required",
                          defaultMessage: "Select a host scheduling group.",
                        }),
                      },
                    ]}
                    hideRequiredMessage
                  >
                    <ModalSelect
                      title={intl.formatMessage({
                        id: "select.hostGroup",
                        defaultMessage: "Select Host Scheduling Group",
                      })}
                      selectType="radio"
                    >
                      <HostGroupList
                        view="select"
                        defaultQuery={defaultQueryHostGroupList}
                      />
                    </ModalSelect>
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item
                      name="hostGroupName"
                      label={intl.formatMessage({
                        id: "hostGroupName",
                        defaultMessage: "Host Scheduling Group Name",
                      })}
                      validateTrigger="onBlur"
                      required
                      rules={commonNameRules}
                    >
                      <Input className="width-320" />
                    </Form.Item>
                    <Form.Item
                      name="hostList"
                      label={intl.formatMessage({
                        id: "host",
                        defaultMessage: "Host",
                      })}
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: intl.formatMessage({
                      //       id: 'vmSchedulingRule.field.host.validator.required',
                      //       defaultMessage: '请选择物理机'
                      //     })
                      //   }
                      // ]}
                      className={style.hostList}
                    >
                      <ModalSelect
                        title={intl.formatMessage({
                          id: "select.host",
                          defaultMessage: "Select Host",
                        })}
                        selectType="checkbox"
                        label={intl.formatMessage({
                          id: "select.host",
                          defaultMessage: "Select Host",
                        })}
                        needRemoveSelected={false}
                      >
                        <HostList
                          view="select"
                          defaultQuery={defaultQueryHostList}
                        />
                      </ModalSelect>
                    </Form.Item>
                  </>
                )}
              </>
            )
          );
        }}
      </Form.Item>
    </Card>
  );
};

export default React.memo(BasicPart);
