import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  ClusterResourceConfig,
} from "@zstack/zsphere-types/graphql";
import {
  getModifedValues,
  formatResourceName,
  transformKvmReservedMemory,
} from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import AdvancedConfig from "../../create/advanced-config";
import BasicConfig from "./basic-config";

import style from "./style.module.less";

const modifyClusterConfig = gql`
  mutation modifyClusterConfig($input: ModifyClusterConfigInput!) {
    modifyClusterConfig(input: $input) {
      actionId
    }
  }
`;

export const useInitialValues = () => {
  return {};
};

export interface IProps {
  title?: string;
  width?: number;
}

const Action: React.FC<IActionWrapperProps<ICluster> & IProps> = ({
  title: _title,
  _source,
  width,
  visible,
  setVisible,
  selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const current = React.useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const _initialValues = useInitialValues();

  const title =
    _title ||
    intl.formatMessage({
      id: "virtualization.cluster.modifyConfig",
      defaultMessage: "Modify Configuration",
    });

  const resourceConfiginitialValues = React.useMemo(() => {
    const {
      hostCpuOverProvisioningRatio,
      mevocoOverProvisioningMemory,
      kvmIgnoreMsrs,
      premiumClusterEnableZeroCopy,
      kvmReservedMemory,
      premiumClusterHugepageEnable,
      haVmHaLevel,
      vmVmHaAcrossClusters,
      vmEmulateHyperV,
      vmVideoType,
      kvmAutoSetVmNicMultiqueue,
    } = current?.resourceConfigValue ?? {};

    return {
      "host-cpu.overProvisioning.ratio": hostCpuOverProvisioningRatio,
      "mevoco-overProvisioning.memory": mevocoOverProvisioningMemory,
      checkCpuModel: current?.checkCpuModel === "true",
      "kvm-ignoreMsrs": kvmIgnoreMsrs === "true",
      "premiumCluster-enable.zeroCopy": premiumClusterEnableZeroCopy === "true",
      "kvm-reservedMemory": transformKvmReservedMemory(kvmReservedMemory),
      "premiumCluster-hugepage.enable": premiumClusterHugepageEnable === "true",
      "ha-vm.ha.level": haVmHaLevel === "NeverStop",
      "vm-vm.ha.across.clusters": vmVmHaAcrossClusters === "true",
      cpuMode: current?.clusterKVMCpuModel ?? "none",
      "vm-emulateHyperV": vmEmulateHyperV === "true",
      "vm-videoType": vmVideoType,
      "kvm-auto.set.vm.nic.multiqueue": kvmAutoSetVmNicMultiqueue === "true",
    };
  }, [
    current?.resourceConfigValue,
    current?.checkCpuModel,
    current?.clusterKVMCpuModel,
  ]);

  const initialValues: any = React.useMemo(
    () => ({
      ..._initialValues,
      ...resourceConfiginitialValues,
      name: current.name,
      description: current.description,
      architecture: current.architecture,
      clusterKVMCpuModel: current.clusterKVMCpuModel,
      displayNetworkCidr: current?.displayNetworkCidr,
      migrateNetworkCidr: current?.migrateNetworkCidr,
    }),
    [_initialValues, current, resourceConfiginitialValues],
  );

  React.useEffect(() => {
    if (visible) {
      form.setFields(
        _.keys(initialValues).map((key) => ({
          name: key,
          value: initialValues[key],
        })),
      );
    }
  }, [initialValues, visible]);

  const buildParams = usePersistFn((data: any) => {
    if (data["ha-vm.ha.level"]) {
      data["ha-vm.ha.level"] = "NeverStop";
    } else {
      data["ha-vm.ha.level"] = "None";
    }

    const modifiedData = getModifedValues(
      {
        ...initialValues,
        "kvm-reservedMemory": `${initialValues["kvm-reservedMemory"].number}${initialValues["kvm-reservedMemory"].unit}`,
      },
      {
        ...data,
        "ha-vm.ha.level": data["ha-vm.ha.level"] === "NeverStop",
      },
    );

    // collect resource config
    const keys = Object.keys(modifiedData).filter((key) => key.includes("-"));

    const resourceConfigs: ClusterResourceConfig[] = [];

    keys.forEach((key) => {
      const [category, name] = key.split("-");

      const value = data[key]?.number ?? data[key];

      if (!_.isNil(value)) {
        resourceConfigs.push({
          category,
          name,
          value: typeof value === "string" ? value : String(value),
        });
      }
    });

    // remove resource config from modifiedData
    const _data: any = _.omit(modifiedData, keys);

    return {
      ..._data,
      clusterUuid: current.uuid,
      checkCpuModel: !_.isUndefined(_data?.checkCpuModel)
        ? String(_data!.checkCpuModel)
        : undefined,
      resourceConfigList: resourceConfigs,
    };
  });

  const submitHandle = React.useCallback(
    async (data: any) => {
      const params = buildParams(data);

      try {
        doAction({
          mutation: modifyClusterConfig,
          payload: params,
          name: title,
          total: 1,
          type: "Cluster",
          // onProgress: () => {
          //   refetch?.()
          // }
        });
      } catch {}
    },
    [doAction],
  );

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      title={title}
      widthClassName="w-200"
      onCancel={() => setVisible(false)}
      onOk={submitHandle}
      className={style["create-modal"]}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form} className={style.form}>
        <BasicConfig form={form} selectedList={selectedList} />

        <AdvancedConfig form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
