import { gql } from "@apollo/client";
import {
  cpuUsedPercentStr,
  timerMap,
} from "@zstack/virtualization-resource/src/pages/cluster/detail/drs/drs-panel-config-info/constant";
import ModalZSV from "@zstack/virtualization-resource/src/pages/vm/create/components/modal-form";
import { Form } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ClusterGlobalConfig,
  ClusterResourceConfig,
  Zone as IZone,
} from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { useUnit } from "../detail/drs/utils";
import AdvancedConfig from "./advanced-config";
import BasicConfig from "./basic-config";
import DrsConfig from "./drs-config";

import style from "./style.module.less";

const createCluster = gql`
  mutation createCluster($input: CreateClusterInput!) {
    createCluster(input: $input) {
      actionId
    }
  }
`;

export const useInitialValues = () => {
  const intl = useIntl();

  return {
    architecture: "x86_64",
    enabledStatus: false,
    automationLevel: "closed",
    monitorItem: cpuUsedPercentStr,
    thresholdDuration: {
      number: 1,
      unit: intl.formatMessage({ id: "second", defaultMessage: " seconds" }),
    },
    "drs-drs.migrateVm.concurrent": 1,
    "drs-drs.schedulingInterval": {
      number: 10,
      unit: intl.formatMessage({ id: "minute", defaultMessage: "minutes" }),
    },
    "host-cpu.overProvisioning.ratio": "4",
    "mevoco-overProvisioning.memory": "1",
    // host-settiing
    checkCpuModel: false,
    "kvm-ignoreMsrs": false,
    "premiumCluster-enable.zeroCopy": false,
    "kvm-reservedMemory": {
      number: 1,
      unit: "G",
    },
    "premiumCluster-hugepage.enable": false,
    "kvm-vm.cpu.hypervisor.feature": true,
    // ZSV-1752, set some value to default true, vm-setting
    "ha-vm.ha.level": true,
    "vm-vm.ha.across.clusters": true,
    "vm-emulateHyperV": false,
    "kvm-auto.set.vm.nic.multiqueue": true,
  };
};

export interface IProps {
  title?: string;
}

const CreateCluster: React.FC<
  IActionWrapperProps<IZone & { __typename: string }> & IProps
> = ({ title: _title, visible, setVisible, selectedList, source, refetch }) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const { getUnitValue } = useUnit();

  const _initialValues = useInitialValues();

  const title =
    _title ||
    intl.formatMessage({
      id: "virtualization.cluster.create",
      defaultMessage: "New Cluster",
    });

  const zone = React.useMemo(() => {
    const current = selectedList?.[0] ?? source ?? {};

    if (current.__typename === "Zone") {
      return { uuid: current.uuid, name: current.name };
    }
  }, [selectedList, source]);

  const initialValues = React.useMemo<any>(
    () => ({
      ..._initialValues,
    }),
    [_initialValues],
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
  }, [form, initialValues, visible]);

  const buildParams = React.useCallback(
    (data: any) => {
      if (data["drs-drs.schedulingInterval"]) {
        const schedulingIntervalUnit = getUnitValue(
          data["drs-drs.schedulingInterval"]?.unit ?? "second",
        );

        data["drs-drs.schedulingInterval"] =
          (data["drs-drs.schedulingInterval"]!.number as number) *
          timerMap[schedulingIntervalUnit!];
      }

      if (data["ha-vm.ha.level"]) {
        data["ha-vm.ha.level"] = "NeverStop";
      } else {
        data["ha-vm.ha.level"] = "None";
      }

      // collect resource config
      const resourceConfigKeys = Object.keys(data).filter((key) =>
        key.includes("-"),
      );

      const resourceConfigList: ClusterResourceConfig[] = [];

      resourceConfigKeys.forEach((key) => {
        const [category, name] = key.split("-");

        const value = data[key]?.number ?? data[key];

        if (!_.isNil(value)) {
          resourceConfigList.push({
            category,
            name,
            value: String(value),
          });
        }
      });

      // collect global config
      const globalConfigKeys = Object.keys(data).filter((key) =>
        key.includes("_"),
      );
      const globalConfigList: ClusterGlobalConfig[] = [];

      globalConfigKeys.forEach((key) => {
        const [category, name] = key.split("_");

        const value = data[key]?.number ?? data[key];

        if (!_.isNil(value)) {
          globalConfigList.push({
            category,
            name,
            value: String(value),
          });
        }
      });

      const thresholds: any[] = [];

      if (!_.isNil(data.cpuUsedPercentThreshold)) {
        thresholds.push({
          operator: ">=",
          thresholdName: "cpuUsedPercentThreshold",
          thresholdValue: String(data.cpuUsedPercentThreshold),
        });
      }

      if (!_.isNil(data.memoryUsedPercentThreshold)) {
        thresholds.push({
          operator: ">=",
          thresholdName: "memoryUsedPercentThreshold",
          thresholdValue: String(data.memoryUsedPercentThreshold),
        });
      }

      const automationLevel = data.enabledStatus
        ? data.automationLevel
        : "closed";

      const drsConfig = data.enabledStatus
        ? {
            name: `DRS-${genUuid()}`,
            thresholdDuration:
              (data?.thresholdDuration?.number ?? 0) *
              timerMap[
                getUnitValue(data?.thresholdDuration?.unit ?? "second")!
              ],
            thresholds,
            defaultEnable: true,
            automationLevel,
          }
        : undefined;

      delete data.enabledStatus;

      const params = {
        ...data,
        hypervisorType: "KVM",
        checkCpuModel: String(data!.checkCpuModel),
        automationLevel,
        resourceConfigList,
        globalConfigList,
        drsConfig,
      };

      // remove resource config from data
      return _.omit(params, [
        ...resourceConfigKeys,
        ...globalConfigKeys,
        "cpuUsedPercentThreshold",
        "memoryUsedPercentThreshold",
        "monitorItem",
        "thresholdDuration",
      ]);
    },
    [getUnitValue],
  );

  const submitHandle = React.useCallback(
    (data: any) => {
      const params = buildParams(data);
      doAction({
        mutation: createCluster,
        payload: params,
        name: title,
        total: 1,
        type: "Cluster",
        onFinish: () => {
          refetch?.();
        },
      });
    },
    [buildParams, doAction, refetch, title],
  );

  return (
    <ModalZSV
      form={form}
      visible={visible}
      setVisible={setVisible}
      title={title}
      width={800}
      destroyOnClose
      onCancel={() => setVisible(false)}
      getContainer={document.body}
      onOk={submitHandle}
      className={style["create-modal"]}
      context={{
        selectedList,
      }}
    >
      <Form form={form} className={style.form}>
        <BasicConfig form={form} zone={zone} />

        <DrsConfig form={form} isCreate />

        <AdvancedConfig form={form} isCreate />
      </Form>
    </ModalZSV>
  );
};

export default CreateCluster;
