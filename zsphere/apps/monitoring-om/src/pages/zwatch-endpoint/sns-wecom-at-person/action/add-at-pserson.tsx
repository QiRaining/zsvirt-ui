import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  SNSWeComAtPerson,
  AddSNSWeComAtPersonPayload,
  WeComEndPoint,
  AtPersonInput,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { AddPersonItem } from "../../components";

import style from "./style.module.less";

type FormValues = {
  addWeCom: { atPersonList: AtPersonInput[] };
};

const initialValues = {
  addWeCom: {
    atPersonList: [
      {
        remark: "",
        userId: "",
      },
    ],
  },
};

const addSNSWeComAtPerson = gql`
  mutation addSNSWeComAtPerson($input: AddSNSWeComAtPersonInput!) {
    addSNSWeComAtPerson(input: $input) {
      actionId
    }
  }
`;

const AddAtPersonAction: React.FC<
  IActionWrapperProps<SNSWeComAtPerson, WeComEndPoint>
> = ({ visible, refetch, setVisible, source }) => {
  const intl = useIntl();
  const doAction = useAction();

  const [form] = Form.useForm();

  const getPayloadList = React.useCallback(
    (values: FormValues) => {
      if (source?.uuid) {
        return values.addWeCom!.atPersonList.map((item) => {
          return { ...item, endpointUuid: source.uuid };
        });
      }

      return [];
    },
    [source],
  );

  const onOk = async (values: FormValues) => {
    const payloadList = getPayloadList(values);

    doAction<AddSNSWeComAtPersonPayload[]>({
      mutation: addSNSWeComAtPerson,
      payload: payloadList,
      name: intl.formatMessage({
        id: "add.atPerson",
        defaultMessage: "Add Specific Members",
      }),
      total: payloadList.length,
      type: "SNSWeComAtPerson",
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
          parentFieldName="addWeCom"
          supportAtType="userId"
        />
      </Form>
    </DialogForm>
  );
};

export default AddAtPersonAction;
