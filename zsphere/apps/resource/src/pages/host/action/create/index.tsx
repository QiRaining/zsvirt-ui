import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  AddKVMHostPayload,
  Cluster as ICluster,
  Host as IHost,
  Zone as IZone,
} from "@zstack/zsphere-types/graphql";
import { intToIp, ipToInt } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import { keys, map } from "lodash-es";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import BasicConfig from "./basic-config";
import FormContext from "./context";
import HostConfig from "./host-config";
import OtherConfig from "./other-config";

const addKvmHost = gql`
  mutation addKvmHost($input: AddKVMHostInput!) {
    addKvmHost(input: $input) {
      actionId
    }
  }
`;

type ISource =
  | (ICluster & { __typename: string })
  | (IZone & { __typename: string });

const Action: FC<IActionWrapperProps<IHost, ISource>> = ({
  visible,
  setVisible,
  source,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [eptVisible, setEptVisible] = useState(false);
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "add.host",
    defaultMessage: "Add Host",
  });

  const zone = source?.__typename === "Zone" ? (source as IZone) : undefined;
  const cluster =
    source?.__typename === "Cluster" ? (source as ICluster) : undefined;

  useEffect(() => {
    if (cluster) {
      const supportEpt = cluster.architecture === "x86_64";
      setEptVisible(supportEpt);
    }
  }, [cluster]);

  useEffect(() => {
    if (visible) {
      let initialValues: Record<string, any> = {
        addMode: "single",
        username: "root",
        sshPort: 22,
        iommu: false,
      };
      if (cluster) {
        initialValues = {
          ...initialValues,
          ept: true,
          clusterUuid: cluster.uuid,
        };
      }

      form.setFields(
        keys(initialValues).map((key) => ({
          name: key,
          value: initialValues[key],
        })),
      );
    }
  }, [form, cluster, visible]);

  const onOk = usePersistFn(async (currentValues: any) => {
    const {
      name,
      description,
      clusterUuid,
      tags = [],
      addMode,
      startIp,
      endIp,
      managementIp,
      sshPort,
      username,
      password,
      iommu,
      ept,
    } = currentValues;
    const tagUuids = map(tags, "uuid");
    const systemTags = [];
    if (iommu) {
      systemTags.push("iommuState::Enabled");
    }
    if (!ept) {
      systemTags.push("pageTableExtensionDisabled");
    }

    const commonParams: AddKVMHostPayload = {
      name,
      description,
      clusterUuid,
      tagUuids,
      sshPort,
      username,
      password,
      systemTags,
    };
    const payload: AddKVMHostPayload[] = [];
    if (addMode === "single") {
      payload.push({
        ...commonParams,
        managementIp,
      });
    } else if (startIp && endIp) {
      const _start = ipToInt(startIp);
      const _end = ipToInt(endIp);
      let [start, end] = [_start, _end];
      if (start > end) {
        [start, end] = [_end, _start];
      }
      for (let i = start; i <= end; i += 1) {
        const ip = intToIp(i);
        payload.push({
          ...commonParams,
          name: `${name}-${ip}`,
          managementIp: ip,
        });
      }
    }

    doAction({
      mutation: addKvmHost,
      payload,
      name: title,
      total: payload.length,
      type: "HostVO",
    });
  });

  return (
    <DialogForm
      form={form}
      title={title}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-200"
      onOk={onOk}
      onCancel={() => setVisible(false)}
    >
      <FormContext.Provider value={{ eptVisible, setEptVisible }}>
        <Form form={form}>
          <BasicConfig isCreate cluster={cluster} zone={zone} />
          <HostConfig />
          <OtherConfig />
        </Form>
      </FormContext.Provider>
    </DialogForm>
  );
};

export default Action;
