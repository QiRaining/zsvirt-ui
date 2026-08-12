import { gql } from "@apollo/client";
import { Button, DialogFooter } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { KernelTrafficTypes } from "@zstack/zsphere-types";
import type {
  BatchCreateHostKernelInterfacePayload,
  CreateHostKernelInterfacePayload,
  Host,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import { isEmpty } from "lodash-es";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import Config from "./config";
import type { ISelectedResource, ISource } from "./hooks";
import { useResource } from "./hooks";

import style from "./style.module.less";

const createHostKernelInterface = gql`
  mutation createHostKernelInterface($input: CreateHostKernelInterfaceInput!) {
    createHostKernelInterface(input: $input) {
      actionId
    }
  }
`;

const batchCreateHostKernelInterface = gql`
  mutation batchCreateHostKernelInterface(
    $input: BatchCreateHostKernelInterfaceInput!
  ) {
    batchCreateHostKernelInterface(input: $input) {
      actionId
    }
  }
`;

export interface IProps {
  title?: string;
}

const CreateHostKernelInterface: React.FC<
  IActionWrapperProps<ISelectedResource, ISource> & IProps
> = ({ title: _title, visible, setVisible, selectedList, source, refetch }) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const { host, l3Network, resourceType } = useResource(selectedList, source);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const title =
    _title ||
    intl.formatMessage({
      id: "virtualization.hostKernelInterface.create.modal.title",
      defaultMessage: "New Kernel Adapter",
    });

  const buildParamsMap = usePersistFn(() => ({
    l3network: (data: any) => {
      const { hosts = [] } = data ?? {};
      return {
        l3NetworkUuid: l3Network.uuid,
        trafficTypes: [KernelTrafficTypes.Storage],
        structs: hosts.map((_host: Host) => {
          return {
            name: data.name,
            description: data.description,
            hostUuid: _host.uuid,
            ip: data.ipv4Address[_host.uuid] || "",
            netmask: data.netmask[_host.uuid] || "",
          };
        }),
      } as BatchCreateHostKernelInterfacePayload;
    },
    host: (data: any) => {
      const { l3Network: _l3Network, ...rest } = data ?? {};
      return {
        ...rest,
        hostUuid: host.uuid,
        l3NetworkUuid: _l3Network[0].uuid,
        trafficTypes: [KernelTrafficTypes.Storage],
      } as CreateHostKernelInterfacePayload;
    },
  }));

  const buildParams = usePersistFn((data: any) => {
    const builder =
      buildParamsMap()[resourceType as keyof ReturnType<typeof buildParamsMap>];
    return builder ? builder(data) : {};
  });

  const mutationMap = usePersistFn(() => ({
    l3network: batchCreateHostKernelInterface,
    host: createHostKernelInterface,
  }));

  const submitHandle = React.useCallback(
    async (data: any) => {
      const payload = buildParams(data);
      const mutation =
        mutationMap()[resourceType as keyof ReturnType<typeof mutationMap>];

      doAction({
        mutation,
        payload,
        name: title,
        total: 1,
        type: "HostKernelInterface",
        onFinish: () => {
          form.resetFields();
          refetch?.();
        },
      });
      setVisible(false);
    },
    [buildParams, doAction, form, resourceType, title],
  );

  const handleHostsChange = React.useCallback((hosts: any[]) => {
    setIsSubmitDisabled(isEmpty(hosts));
  }, []);

  return (
    <DialogForm
      resourceName={formatResourceName(
        [resourceType === "host" ? host : l3Network],
        intl,
      )}
      form={form}
      visible={visible}
      setVisible={setVisible}
      title={title}
      onCancel={() => setVisible(false)}
      context={{
        selectedList,
        source,
      }}
      footer={
        <DialogFooter className="gap-2">
          <div className="flex gap-2">
            <Button
              variant="subtle"
              onClick={() => {
                form.resetFields();
                setVisible(false);
              }}
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              variant="primary"
              onClick={() => form.validateFields().then(submitHandle)}
              disabled={resourceType === "l3network" && isSubmitDisabled}
            >
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          </div>
        </DialogFooter>
      }
    >
      <Form form={form} className={style.form}>
        <Config form={form} onHostsChange={handleHostsChange} />
      </Form>
    </DialogForm>
  );
};

export default CreateHostKernelInterface;
