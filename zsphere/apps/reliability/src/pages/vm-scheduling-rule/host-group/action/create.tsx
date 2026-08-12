import { gql } from "@apollo/client";
import { Input } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { ModalSelect, TextArea } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  HostQueryType,
  HostState,
  HostStatus,
  Op,
} from "@zstack/zsphere-types";
import type {
  CreateHostGroupPayload,
  Host,
  HostGroup,
} from "@zstack/zsphere-types/graphql";
import React, { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";
import HostList from "zsv_resource/host/list";

import style from "./style.module.less";

type IInitalValuesType = {
  name: string;
  description: string;
  hostList: Array<Host>;
};

const initialValues: IInitalValuesType = {
  name: "",
  description: "",
  hostList: [],
};

const createHostGroup = gql`
  mutation createHostGroup($input: CreateHostGroupInput!) {
    createHostGroup(input: $input) {
      actionId
    }
  }
`;

const CreateAction: React.FC<
  Omit<IActionWrapperProps<HostGroup>, "view" | "position">
> = ({ visible, setVisible, setSelectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const { commonNameRules, commonDescriptionRules } = useValidator(intl);
  const [form] = Form.useForm();

  const { zoneUuid = "" } = useContext(ZoneUuidContext);

  const defaultQueryHostList = useMemo(() => {
    return {
      conditions: [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        { key: "state", op: Op.eq, value: HostState.Enabled },
        { key: "status", op: Op.eq, value: HostStatus.Connected },
        { key: "hypervisorType", op: Op.ne, value: "ESX" },
      ],
      type: HostQueryType.GetHostCandidatesForAddToHostGroup,
    };
  }, [zoneUuid]);
  const onOk = async (values: any) => {
    const { name, description, hostList } = values;
    const payload: CreateHostGroupPayload = {
      name,
      description,
      hostUuids: hostList?.map((host: Host) => host?.uuid),
      zoneUuid,
    };
    doAction({
      mutation: createHostGroup,
      payload,
      name: intl.formatMessage({
        id: "create.hostGroup",
        defaultMessage: "New Host Scheduling Group",
      }),
      total: 1,
      type: "HostGroup",
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
        id: "hostGroup.modal.title.create.hostGroup",
        defaultMessage: "New Host Scheduling Group",
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
          name="hostList"
          label={intl.formatMessage({
            id: "host",
            defaultMessage: "Host",
          })}
          hideRequiredMessage
        >
          <ModalSelect
            title={intl.formatMessage({
              id: "select.host",
              defaultMessage: "Select Host",
            })}
            selectType="checkbox"
            visibleKey="name"
            label={intl.formatMessage({
              id: "select.host",
              defaultMessage: "Select Host",
            })}
            needRemoveSelected={false}
          >
            <HostList view="select" defaultQuery={defaultQueryHostList} />
          </ModalSelect>
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default CreateAction;
