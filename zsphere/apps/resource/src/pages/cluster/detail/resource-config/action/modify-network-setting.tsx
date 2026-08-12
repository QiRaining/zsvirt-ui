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

import NetworkSetting from "../../../create/advanced-config/network-setting";

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
      id: "cluster.network",
      defaultMessage: "Cluster Network",
    })}`;

  const initialValues: any = React.useMemo(
    () => ({
      ..._initialValues,
      displayNetworkCidr: current?.displayNetworkCidr,
      migrateNetworkCidr: current?.migrateNetworkCidr,
    }),
    [_initialValues, current],
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
        <NetworkSetting form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
