import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  SNSDingTalkAtPerson,
  AddSNSDingTalkAtPersonPayload,
  DingTalkEndPoint,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { AddPersonItem } from "../../components";
import type { AreaCodePhoneNumber } from "../../create/basic-config";

import style from "./style.module.less";

type FormValues = {
  addDingTalk: { atPersonList: (AreaCodePhoneNumber & { remark?: string })[] };
};

const initialValues = {
  addDingTalk: {
    atPersonList: [
      {
        remark: "",
        areaCode: "86",
        phoneNumber: "",
      },
    ],
  },
};

const addSNSDingTalkAtPerson = gql`
  mutation addSNSDingTalkAtPerson($input: AddSNSDingTalkAtPersonInput!) {
    addSNSDingTalkAtPerson(input: $input) {
      actionId
    }
  }
`;

const AddAtPersonAction: React.FC<
  IActionWrapperProps<SNSDingTalkAtPerson, DingTalkEndPoint>
> = ({ visible, setVisible, source }) => {
  const intl = useIntl();
  const doAction = useAction();

  const [form] = Form.useForm();

  const getPayloadList = React.useCallback(
    (values: FormValues) => {
      if (source?.uuid) {
        return values.addDingTalk!.atPersonList.map((item) => {
          return {
            remark: item.remark,
            phoneNumber: `+${item?.areaCode}-${item?.phoneNumber}`,
            endpointUuid: source.uuid,
          };
        });
      }

      return [];
    },
    [source],
  );

  const onOk = async (values: FormValues) => {
    const payloadList = getPayloadList(values);

    doAction<AddSNSDingTalkAtPersonPayload[]>({
      mutation: addSNSDingTalkAtPerson,
      payload: payloadList,
      name: intl.formatMessage({
        id: "zwtach.endpoint.add.atPersonPhoneNumber",
        defaultMessage: "Add designated member",
      }),
      total: payloadList.length,
      type: "SNSDingTalkAtPerson",
    });
  };
  return (
    <DialogForm
      widthClassName="w-200"
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "add.atPerson",
        defaultMessage: "Add Specific Members",
      })}
      form={form}
      onOk={onOk}
      className={style.snsAtPersonModal}
      resourceName={source?.name}
    >
      <Form form={form} initialValues={initialValues}>
        <AddPersonItem
          form={form}
          parentFieldName="addDingTalk"
          supportAtType="phoneNumber"
        />
      </Form>
    </DialogForm>
  );
};

export default AddAtPersonAction;
