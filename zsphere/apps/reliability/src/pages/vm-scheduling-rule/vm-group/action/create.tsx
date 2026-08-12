import { gql } from "@apollo/client";
import { Input } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { ModalSelect, TextArea } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, VmInstanceState, VmQueryType } from "@zstack/zsphere-types";
import type {
  CreateVmGroupPayload,
  VmInstance,
  VmGroup,
} from "@zstack/zsphere-types/graphql";
import React, { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";
import VmList from "zsv_resource/vm/list";

import style from "./style.module.less";

type IInitalValuesType = {
  name: string;
  description: string;
  vmUuids: Array<VmInstance>;
};

const initialValues: IInitalValuesType = {
  name: "",
  description: "",
  vmUuids: [],
};

const createVmGroup = gql`
  mutation createVmGroup($input: CreateVmGroupInput!) {
    createVmGroup(input: $input) {
      actionId
    }
  }
`;

const CreateAction: React.FC<
  Omit<IActionWrapperProps<VmGroup>, "view" | "position">
> = ({ visible, setVisible, setSelectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const { commonNameRules, commonDescriptionRules } = useValidator(intl);
  const [form] = Form.useForm();

  const { zoneUuid = "" } = useContext(ZoneUuidContext);

  const defaultQueryVmList = useMemo(() => {
    return {
      conditions: [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        {
          key: "state",
          op: Op.in,
          values: [VmInstanceState.Running, VmInstanceState.Stopped],
        },
        { key: "hypervisorType", op: Op.ne, value: "ESX" },
      ],
      type: VmQueryType.GetVmCandidatesForAddToVmGroup,
    };
  }, [zoneUuid]);

  const onOk = async (values: any) => {
    const { name, description, vmList } = values;
    const payload: CreateVmGroupPayload = {
      name,
      description,
      vmUuids: vmList?.map((vm: VmInstance) => vm?.uuid),
      zoneUuid,
    };
    doAction({
      mutation: createVmGroup,
      payload,
      name: intl.formatMessage({
        id: "create.vmGroup",
        defaultMessage: "New VM Scheduling Group",
      }),
      total: 1,
      type: "VmGroup",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "vmGroup.modal.title.create.vmGroup",
        defaultMessage: "New VM Scheduling Group",
      })}
      form={form}
      onOk={onOk}
    >
      <Form form={form} initialValues={initialValues}>
        <Form.Item
          name="name"
          label={intl.formatMessage({
            id: "name",
            defaultMessage: "Name",
          })}
          validateTrigger="onBlur"
          required
          //
          rules={commonNameRules}
          //
          // tooltip={intl.formatMessage({
          //   id: 'global.field.name.hover',
          //   defaultMessage:
          //     '字数128字以内，仅支持中文汉字、英文字母、数字，以及下列英文符号：（-）、（_）、（.）、（:）'
          // })}
        >
          <Input className={style["width-320"]} />
        </Form.Item>
        <Form.Item
          name="description"
          label={intl.formatMessage({
            id: "description",
            defaultMessage: "Description",
          })}
          validateTrigger="onBlur"
          rules={commonDescriptionRules}
        >
          <TextArea
            rows={3}
            className={style["width-320"]}
            isShowLimit
            limit={256}
          />
        </Form.Item>
        <Form.Item
          name="vmList"
          label={intl.formatMessage({
            id: "vm",
            defaultMessage: "Virtual Machine",
          })}
          hideRequiredMessage
        >
          <ModalSelect
            title={intl.formatMessage({
              id: "select.vm",
              defaultMessage: "Select Virtual Machine",
            })}
            needRemoveSelected={false}
            selectType="checkbox"
            visibleKey="name"
            label={intl.formatMessage({
              id: "select.vm",
              defaultMessage: "Select Virtual Machine",
            })}
          >
            <VmList view="select" defaultQuery={defaultQueryVmList} />
          </ModalSelect>
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default CreateAction;
