import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  ClusterResourceConfig,
} from "@zstack/zsphere-types/graphql";
import { getModifedValues, formatResourceName } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import VmSetting from "../../../create/advanced-config/vm-setting";

import style from "./style.module.less";

const modifyClusterConfig = gql`
  mutation modifyClusterConfig($input: ModifyClusterConfigInput!) {
    modifyClusterConfig(input: $input) {
      actionId
    }
  }
`;

export const useInitialValues = () => {
  const _intl = useIntl();

  return {};
};

export interface IProps {
  title?: string;
  width?: number;
}

const Action: React.FC<IActionWrapperProps<ICluster> & IProps> = ({
  title: _title,
  width,
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const current = React.useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const _initialValues = useInitialValues();

  const title =
    _title ||
    `${intl.formatMessage({
      id: "change",
    })}${intl.formatMessage({
      id: "virtualization.cluster.vm.setting",
      defaultMessage: "VM Settings",
    })}`;

  const resourceConfiginitialValues = React.useMemo(() => {
    const {
      haVmHaLevel,
      vmVmHaAcrossClusters,
      vmEmulateHyperV,
      vmVideoType,
      kvmAutoSetVmNicMultiqueue,
    } = current?.resourceConfigValue ?? {};

    return {
      "ha-vm.ha.level": haVmHaLevel === "NeverStop",
      "vm-vm.ha.across.clusters": vmVmHaAcrossClusters === "true",
      cpuMode: current?.clusterKVMCpuModel ?? "none",
      "vm-emulateHyperV": vmEmulateHyperV === "true",
      "vm-videoType": vmVideoType,
      "kvm-auto.set.vm.nic.multiqueue": kvmAutoSetVmNicMultiqueue === "true",
    };
  }, [current.resourceConfigValue, current.clusterKVMCpuModel]);

  const initialValues: any = React.useMemo(
    () => ({
      ..._initialValues,
      ...resourceConfiginitialValues,
      architecture: current.architecture,
      cpuMode: current.clusterKVMCpuModel,
    }),
    [_initialValues, resourceConfiginitialValues, current],
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

    const modifiedData = getModifedValues(initialValues, {
      ...data,
      "ha-vm.ha.level": data["ha-vm.ha.level"] === "NeverStop",
    });

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
          value: String(value),
        });
      }
    });

    // remove resource config from modifiedData
    const _data: any = _.omit(modifiedData, keys);

    return {
      ..._data,
      clusterUuid: current.uuid,
      checkCpuModel: !_.isUndefined(_data.checkCpuModel)
        ? String(_data.checkCpuModel)
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
      widthClassName="w-150"
      onCancel={() => setVisible(false)}
      onOk={submitHandle}
      className={style["create-modal"]}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form} className={style.form}>
        <VmSetting form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
