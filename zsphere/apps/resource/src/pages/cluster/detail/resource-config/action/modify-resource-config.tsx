import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { ResourceCapacity } from "@zstack/zsphere-components";
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
import type { FC } from "react";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import ResourceConfig from "../../../create/advanced-config/resource-config";

import style from "./style.module.less";

const modifyClusterConfig = gql`
  mutation modifyClusterConfig($input: ModifyClusterConfigInput!) {
    modifyClusterConfig(input: $input) {
      actionId
    }
  }
`;

export interface IProps {
  title?: string;
  width?: number;
}

const Action: FC<IActionWrapperProps<ICluster> & IProps> = ({
  title: _title,
  width,
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const current = useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const title =
    _title ||
    `${intl.formatMessage({
      id: "change",
    })}${intl.formatMessage({
      id: "cluster.exceedingAllocation",
      defaultMessage: "Cluster Overcommit",
    })}`;

  const initialValues = useMemo(() => {
    const resourceConfigValue = current?.resourceConfigValue;
    if (resourceConfigValue) {
      const { hostCpuOverProvisioningRatio, mevocoOverProvisioningMemory } =
        resourceConfigValue;
      return {
        "host-cpu.overProvisioning.ratio": hostCpuOverProvisioningRatio,
        "mevoco-overProvisioning.memory": mevocoOverProvisioningMemory,
      };
    }
    return {} as any;
  }, [current]);

  useEffect(() => {
    if (visible) {
      form.setFields(
        _.keys(initialValues).map((key) => ({
          name: key,
          value: initialValues[key],
        })),
      );
    }
  }, [form, initialValues, visible]);

  const buildParams = usePersistFn((data: any) => {
    const modifiedData = getModifedValues(initialValues, data);

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
      resourceConfigList: resourceConfigs,
    };
  });

  const submitHandle = usePersistFn(async (data: any) => {
    const params = buildParams(data);

    doAction({
      mutation: modifyClusterConfig,
      payload: params,
      name: title,
      total: 1,
      type: "Cluster",
    });
  });

  const alertMessage = useMemo(() => {
    return (
      <>
        <span>
          {intl.formatMessage({
            id: "cluster.exceedingAllocation.modal.info",
            defaultMessage:
              "Set the CPU and memory overcommit ratios in this cluster to improve compute resource utilization. For more information, see ",
          })}
        </span>
        <ResourceCapacity.Rule showCPU showMemory />
      </>
    );
  }, [intl]);

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
      alertType="info"
      alertMessage={alertMessage}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form} className={style.form}>
        <ResourceConfig />
      </Form>
    </DialogForm>
  );
};

export default Action;
