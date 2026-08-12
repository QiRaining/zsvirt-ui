import { gql } from "@apollo/client";
import NicList from "@zstack/virtualization-resource/src/pages/security-group/detail/vm-nic/list";
import { Form, ModalSelect } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  useAction,
  useValidator,
  IIsRequiredType,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  VmNic as IVmNic,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

const updateVmNetworkConfig = gql`
  mutation updateVmNetworkConfig($input: UpdateVmNetworkConfigInput!) {
    updateVmNetworkConfig(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const [form] = Form.useForm();

  const { isRequired } = useValidator(intl);

  const vm = selectedList?.[0];

  const defaultQuery: any = useMemo(() => {
    return {
      conditions: [{ key: "vmInstance.uuid", op: Op.eq, value: vm?.uuid }],
    };
  }, [vm]);

  const onOk = (values: any) => {
    const payload = values.nics.map((nic: IVmNic) => ({
      vmInstanceUuid: vm.uuid,
      vmNicUuid: nic.uuid,
    }));
    doAction({
      mutation: updateVmNetworkConfig,
      payload,
      name: intl.formatMessage({
        id: "vm.nic.sync.config",
        defaultMessage: "Deploy Network Configuration",
      }),
      total: 1,
      onProgress: () => {},
      onFinish: () => {
        refetch?.();
      },
    });
    setVisible(false);
  };

  const nicColumnConfig = useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        key: "name",
        render: (value, current: IVmNic) => current?.internalName,
      },
      {
        title: intl.formatMessage({
          id: "ipv4.address",
          defaultMessage: "IPv4 Address",
        }),
        key: "ipv4",
        render: (value, current: IVmNic) => current?.ip,
      },
    ];
  }, [intl]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "vm.nic.sync.config",
        defaultMessage: "Deploy Network Configuration",
      })}
      form={form}
      onOk={onOk}
      alertType="warning"
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "nic.modal.sync.config.alert.info",
            defaultMessage: "1. Updates NIC configurations based on the customized parameters, including IP address, netmask, gateway, DNS, and MTU.\n2. This action overwrites the original NIC configurations. Proceed with caution.",
          })}
        </ReactMarkdown>
      }
      className={style.vmNicSyncConfig}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form
        form={form}
        initialValues={{
          nics: [],
        }}
      >
        <Form.Item
          label={intl.formatMessage({
            id: "network.card",
            defaultMessage: "NIC",
          })}
          name="nics"
          required
          rules={[
            isRequired(
              IIsRequiredType.select,
              intl.formatMessage({ id: "netcard", defaultMessage: "NIC" }),
            ),
          ]}
        >
          <ModalSelect
            label={intl.formatMessage({
              id: "select.network.card",
              defaultMessage: "Select NIC",
            })}
            selectType="checkbox"
            title={intl.formatMessage({
              id: "select.network.card",
              defaultMessage: "Select NIC",
            })}
            columnConfig={nicColumnConfig}
          >
            <NicList
              view="select.virtualization.vm"
              defaultQuery={defaultQuery}
            />
          </ModalSelect>
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default Action;
