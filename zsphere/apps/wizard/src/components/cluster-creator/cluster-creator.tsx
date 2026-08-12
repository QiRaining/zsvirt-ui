import { gql } from "@apollo/client";
import { Form, Select, Input } from "@zstack/zsphere-components";
import { SUPPORTED_CLUSTER_ARCHITECTURE_OPTIONS } from "@zstack/zsphere-constant";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { ClusterResourceConfig } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import type { FC } from "react";
import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { useIntl } from "react-intl";
import { useShallow } from "zustand/react/shallow";

import { useWizardStore } from "../../layouts/wizard-container/wizard-container";
import { useUnit } from "../../utils/use-init";
import type { IWizardFormProps } from "../interface";
import { useInitialValues } from "./hooks/use-initial-values";

import style from "./style.module.less";

export interface ITimerMap {
  second: number;
  minute: number;
  hour: number;
  day: number;
  [key: string]: number;
}

const timerMap: ITimerMap = {
  second: 1,
  minute: 60,
  hour: 60 * 60,
  day: 60 * 60 * 24,
};

interface IClusterCreator extends IWizardFormProps {}

const CREATE_CLUSTER = gql`
  mutation CREATE_CLUSTER($input: CreateClusterInput!) {
    createCluster(input: $input) {
      actionId
    }
  }
`;

export const ClusterCreator: FC<IClusterCreator> = forwardRef((props, ref) => {
  const { isBootstrap } = usePlatformStore();
  const { handleTaskFinished, onArchLicenseConflictChange } = props;
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const { commonNameRules } = useValidator(intl);
  const { zoneUuid, zoneName } = useWizardStore(
    useShallow((state) => ({
      zoneUuid: state.zoneUuid,
      zoneName: state.zoneName,
    })),
  );
  const initialValues = useInitialValues();

  const { getUnitValue } = useUnit();

  useEffect(() => {
    onArchLicenseConflictChange?.(false);
  }, [onArchLicenseConflictChange]);

  const submit = async () => {
    await form.validateFields();
    form.submit();
  };
  useImperativeHandle(ref, () => ({
    submit,
  }));

  const handleFinish = (values: any) => {
    const valuesWithZoneUuid = {
      ...initialValues,
      ...values,
      zoneUuid,
    };

    const params = buildParams(valuesWithZoneUuid) as any;

    doAction({
      mutation: CREATE_CLUSTER,
      payload: params,
      name: intl.formatMessage({
        id: "virtualization.cluster.create",
        defaultMessage: "New Cluster",
      }),
      total: 1,
      type: "Cluster",
      onFinish: handleTaskFinished,
    });
  };

  const buildParams = (data: any) => {
    if (data["drs_drs.schedulingInterval"]) {
      const schedulingIntervalUnit = getUnitValue(
        data["drs_drs.schedulingInterval"]?.unit ?? "second",
      );

      data["drs_drs.schedulingInterval"] =
        (data["drs_drs.schedulingInterval"]!.number as number) *
        timerMap[schedulingIntervalUnit!];
    }

    //
    data["ha-vm.ha.level"] = "NeverStop";

    // ZSV-2548 special process for the arm64,
    // don't know if it is a business requirement,
    // config is better, hardcode for now
    if (data.architecture === "aarch64") {
      data.cpuMode = "host-passthrough";
      data["vm-videoType"] = "virtio";
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
    const globalConfigList: any[] = [];

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

    const params = {
      ...data,
      hypervisorType: "KVM",
      checkCpuModel: String(data!.checkCpuModel),
      resourceConfigList,
      globalConfigList,
      drsConfig:
        data.automationLevel !== "closed"
          ? {
              name: `DRS-${genUuid()}`,
              thresholdDuration:
                (data?.thresholdDuration?.number ?? 0) *
                timerMap[
                  getUnitValue(data?.thresholdDuration?.unit ?? "second")!
                ],
              thresholds,
              defaultEnable: true,
              automationLevel: data.automationLevel,
            }
          : undefined,
    };

    const result = _.omit(params, [
      ...resourceConfigKeys,
      ...globalConfigKeys,
      "cpuUsedPercentThreshold",
      "memoryUsedPercentThreshold",
      "monitorItem",
      "thresholdDuration",
    ]) as any;

    /**
     * ，
     * 如果是bootstrap环境，那么有三个resourceConfig不在wizard的环节新增参数设置：
     * 1. reservedMemory
     * 2. vm.ha.level
     * 3. cpuMode：需要传入useGlobalConfig
     * -- 2025/4/23 17:00
     * */

    if (isBootstrap) {
      result.cpuMode = "useGlobalConfig"; //如果是bootstrap环境，那么会覆盖arrch64的cpuMode
      result.resourceConfigList = params.resourceConfigList.filter(
        (item: any) => !["reservedMemory", "vm.ha.level"].includes(item.name),
      );
    }

    // remove resource config from data
    return result;
  };

  return (
    <div>
      <Form form={form} onFinish={handleFinish} initialValues={initialValues}>
        <Form.Item
          name="name"
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          rules={commonNameRules}
        >
          <Input className={style["width-320"]} />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "position.cluster",
            defaultMessage: "Data Center",
          })}
          textFormItem
        >
          {zoneName}
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "cpuArchitecture",
            defaultMessage: "CPU Architecture",
          })}
          name="architecture"
        >
          <Select width="l">
            {SUPPORTED_CLUSTER_ARCHITECTURE_OPTIONS.map((it) => (
              <Select.Option key={it.value} value={it.value}>
                {it.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
});
