import { gql } from "@apollo/client";
import SelectTag from "@zstack/virtualization-resource/src/pages/tag/components/select-tag/index";
import {
  verifyAttachVmToVmGroup,
  verifyDetachVmFromVmGroup,
} from "@zstack/virtualization-resource/src/pages/vm/action/validators";
import { ModalSelect } from "@zstack/zsphere-components";
import { Form, Input, useAuth } from "@zstack/zsphere-components";
import { DialogForm, DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Tag as ITag,
  VmInstance as IVM,
  NetworkServices,
  VmInstance,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { difference, compact, values as _values } from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { VmGroupPlainList } from "zsv_reliability_shared/vm-scheduling-rule/vm-group/mf-index";

import { vmGroupAuth } from "../../detail/overview/relative-object";

const editVmNormalConfig = gql`
  mutation editVmNormalConfig($input: EditNormalConfigInput!) {
    editVmNormalConfig(input: $input) {
      actionId
    }
  }
`;

const EditConfig: React.FC<{ vm: VmInstance }> = ({ vm }) => {
  const zoneUuid = vm?.zoneUuid;
  const vmIsRunning = vm?.state === "Running";
  const vmInstalledQga = vm?.guestToolsState?.qgaState === "Running";
  const disabledVmGroups = !(
    verifyAttachVmToVmGroup(vm) || verifyDetachVmFromVmGroup(vm)
  );

  // 默认l3(网卡)是否开启dhcp
  const isDefaultVmNicL3OpenDHCP = useMemo(() => {
    // 主机名等信息通过默认网络下发配置
    const defaultVmNic = vm?.vmNics?.find(
      (item) => item.l3NetworkUuid === vm.defaultL3NetworkUuid,
    );
    return defaultVmNic?.l3Network?.networkServices?.some(
      (networkService: NetworkServices) =>
        networkService?.networkServiceType === "DHCP",
    );
  }, [vm]);

  const intl = useIntl();
  const { hasAuth } = useAuth();

  // jira :
  // const disabledChangeHostname =
  //   (vmIsRunning && !vmInstalledQga) ||
  //   (!vmIsRunning && !isDefaultVmNicL3OpenDHCP && vm.platform === 'Windows')

  // const disabeldHostNametooltip = useMemo(() => {
  //   if (vmIsRunning && !vmInstalledQga) {
  //     return intl.formatMessage({
  //       id: 'vm.modal.change.hostname.disabled.with.no.qga.tooltip',
  //       defaultMessage: '当前虚拟机未安装 VMtools，不支持修改主机名。'
  //     })
  //   }

  //   if (!vmIsRunning && !isDefaultVmNicL3OpenDHCP && vm.platform === 'Windows') {
  //     return intl.formatMessage({
  //       id: 'vm.modal.change.hostname.disabled.with.no.open.dhcp.tooltip',
  //       defaultMessage: '网卡 1 端口组未开启 DHCP，无法修改主机名。'
  //     })
  //   }

  //   return ''
  // }, [vmIsRunning, vmInstalledQga, isDefaultVmNicL3OpenDHCP, intl])

  const hostNameDisabledAndTooltip = useMemo(() => {
    if (vmIsRunning && !vmInstalledQga) {
      return {
        disabled: true,
        tooltip: intl.formatMessage({
          id: "vm.modal.change.hostname.disabled.with.no.qga.tooltip",
          defaultMessage: "This virtual machine has not installed VMTools and cannot modify the host name.",
        }),
      };
    }

    // 默认l3未开启dhcp
    if (!vmIsRunning && !isDefaultVmNicL3OpenDHCP) {
      return {
        disabled: true,
        tooltip: intl.formatMessage({
          id: "vm.modal.change.hostname.disabled.with.no.open.dhcp.tooltip",
          defaultMessage: "Cannot modify hostname because the DHCP is not enabled in the port group of NIC 1 on this virtual machine.",
        }),
      };
    }

    // 默认l3开启了dhcp，windows 系统要禁用，linux不禁用
    if (!vmIsRunning && isDefaultVmNicL3OpenDHCP && vm.platform === "Windows") {
      return {
        disabled: true,
        tooltip: intl.formatMessage({
          id: "vm.modal.change.hostname.disabled.with.no.open.dhcp.windows.tooltip",
          defaultMessage: "The Windows virtual machine cannot modify hostname.",
        }),
      };
    }

    return {
      disabled: false,
      tooltip: undefined,
    };
  }, [
    intl,
    isDefaultVmNicL3OpenDHCP,
    vm.platform,
    vmInstalledQga,
    vmIsRunning,
  ]);

  const defaultQueryVmGroupList = useMemo(() => {
    return {
      conditions: [{ key: "zoneUuid", op: Op.eq, value: zoneUuid }],
    };
  }, [zoneUuid]);

  return (
    <>
      <Form.Item
        label={intl.formatMessage({ id: "tag", defaultMessage: "Tag" })}
        name="tags"
      >
        <SelectTag className="width-320" />
      </Form.Item>
      {hasAuth(vmGroupAuth) && (
        <Form.Item
          label={intl.formatMessage({
            id: "virtualization.vmGroup",
            defaultMessage: "VM Scheduling Group",
          })}
          name="vmGroups"
        >
          <ModalSelect
            className="width-320"
            disabledItem={disabledVmGroups}
            title={intl.formatMessage({
              id: "selelct.virtualization.vmGroup",
              defaultMessage: "Select VM Scheduling Group",
            })}
          >
            <VmGroupPlainList
              view="select"
              defaultQuery={defaultQueryVmGroupList}
            />
          </ModalSelect>
        </Form.Item>
      )}
      <Form.Item
        label={intl.formatMessage({ id: "Hostname", defaultMessage: "Hostname" })}
        name="hostname"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.setting.normal.config.hostname.icon.tooltip",
              defaultMessage: "### Hostname\n\n1. The rules for setting Linux hostname and Windows hostname are different.\n\n- Linux hostname: The hostname must be 2-60 characters in length, and can be uppercase, lowercase, digits, and hyphens (-). Note that a hostname cannot contain consecutive hyphens (-) and cannot start or end with hyphens (-).\n- Windows hostname: The hostname must be 2-15 characters in length, and can be uppercase, lowercase, digits, and hyphens (-). Note that a hostname cannot contain consecutive hyphens (-), cannot start or end with hyphens (-), and cannot contain only digits.\n\n2. The modification takes effect through the VMTools or DHCP service. However, the hostname of a Windows VM can be deployed and take effect only through the VMTools.\n\n- VMTools: If the VM is running and installed the latest VMTools, the hostname is deployed by the VMTools and takes effect directly.\n- DHCP service: If the VM is not running or does not have the latest VMTools installed, the hostname is deployed by the DHCP service and takes effect after you reboot the VM.\n",
            })}
          </ReactMarkdown>
        }
      >
        <Form.Tooltip
          wrapper="span"
          tooltip={hostNameDisabledAndTooltip.tooltip}
        >
          <Input
            disabled={hostNameDisabledAndTooltip.disabled}
            className="width-320"
          />
        </Form.Tooltip>
      </Form.Item>
    </>
  );
};

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const [form] = Form.useForm();

  const vm = selectedList?.[0];

  useEffect(() => {
    if (visible && vm) {
      form.setFieldsValue({
        tags: vm?.tag,
        hostname: vm?.systemTag?.hostname,
        vmGroups: vm?.vmGroup ? [vm?.vmGroup] : [],
      });
    }
  }, [visible, vm]);

  const [
    detachVmFromVmGroupConfirmModalVisible,
    setDetachVmFromVmGroupConfirmModalVisible,
  ] = useState(false);
  const [currentFormValues, setCurrentFormValues] = useState(null);
  const onOk = async (values: any) => {
    // 如果包含解绑虚拟机调度组，需要展示确认弹框，确认弹框点击确定后再调用 submitData(currentFormValues)
    if (values.vmGroups?.[0]?.uuid !== vm?.vmGroup?.uuid && vm?.vmGroup?.uuid) {
      setCurrentFormValues(values);
      setDetachVmFromVmGroupConfirmModalVisible(true);
      return;
    }
    // 不包含解绑虚拟机调度组，正常提交流程
    await submitData(values);
  };

  const submitData = async (values: any) => {
    const tags = values.tags.map((it: ITag) => it.uuid);
    const originTags = vm?.tag?.map((it) => it.uuid) ?? [];
    const removeTagUuids = difference(originTags, tags);
    const addTagUuids = difference(tags, originTags);

    const payload: any = {};
    if (removeTagUuids?.length || addTagUuids.length) {
      payload.managementTagPayload = {
        removeTagUuids,
        addTagUuids,
        resourceUuids: [vm?.uuid],
      };
    }

    if (values.vmGroups?.[0]?.uuid !== vm?.vmGroup?.uuid) {
      if (values.vmGroups?.[0]?.uuid) {
        payload.attachVmToVmGroupPayload = {
          vmGroupUuid: values.vmGroups?.[0]?.uuid,
          vmUuid: vm?.uuid,
        };
      }
      if (vm?.vmGroup?.uuid) {
        payload.detachVmFromVmGroupPayload = {
          vmGroupUuid: vm?.vmGroup?.uuid,
          vmUuid: vm?.uuid,
        };
      }
    }

    if (values.hostname !== vm?.systemTag?.hostname) {
      payload.setVmHostnamePayload = {
        uuid: vm?.uuid,
        hostname: values.hostname,
      };
    }

    if (compact(_values(payload))?.length === 0) {
      setVisible(false);
      return;
    }

    doAction({
      mutation: editVmNormalConfig,
      payload,
      name: intl.formatMessage({
        id: "edit.normal.config",
        defaultMessage: "Modify General Options",
      }),
      total: 1,
      onProgress: () => {},
      onFinish: () => {
        refetch?.();
      },
    });
    setVisible(false);
  };
  return (
    <>
      <DialogWeak
        title={String(
          intl.formatMessage({
            id: "vm.modal.title.confirm.detachVmGroup",
            defaultMessage: "Confirm to disassociate virtual machine scheduling group?",
          }),
        )}
        type="warning"
        onConfirm={() => {
          submitData(currentFormValues);
          setDetachVmFromVmGroupConfirmModalVisible(false);
          setVisible(false);
        }}
        visible={detachVmFromVmGroupConfirmModalVisible}
        setVisible={setDetachVmFromVmGroupConfirmModalVisible}
        onCancel={() => {
          setDetachVmFromVmGroupConfirmModalVisible(false);
          setVisible(true);
        }}
        description={intl.formatMessage({
          id: "vm.modal.content.confirm.detachVmGroup",
          defaultMessage:
            "After dissociating from a virtual machine scheduling group, this virtual machine will no longer be scheduled according to the scheduling strategy associated with that group. Please exercise caution when operating...",
        })}
      />
      <DialogForm
        visible={visible}
        setVisible={setVisible}
        title={intl.formatMessage({
          id: "edit.normal.config",
          defaultMessage: "Modify General Options",
        })}
        form={form}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        resourceName={formatResourceName(selectedList, intl)}
      >
        <Form form={form} initialValues={{}}>
          <EditConfig vm={vm} />
        </Form>
      </DialogForm>
    </>
  );
};

export default Action;
