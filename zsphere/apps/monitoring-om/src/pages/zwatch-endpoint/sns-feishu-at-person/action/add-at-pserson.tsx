import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  SNSFeiShuAtPerson,
  AddSNSFeiShuAtPersonPayload,
  FeiShuEndPoint,
  AtPersonInput,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { AddPersonItem } from "../../components";

import style from "./style.module.less";

type FormValues = {
  addFeiShu: { atPersonList: AtPersonInput[] };
};

const initialValues = {
  addFeiShu: {
    atPersonList: [
      {
        remark: "",
        userId: "",
      },
    ],
  },
};

const addSNSFeiShuAtPerson = gql`
  mutation addSNSFeiShuAtPerson($input: AddSNSFeiShuAtPersonInput!) {
    addSNSFeiShuAtPerson(input: $input) {
      actionId
    }
  }
`;

const AddAtPersonAction: React.FC<
  IActionWrapperProps<SNSFeiShuAtPerson, FeiShuEndPoint>
> = ({ visible, setVisible, source }) => {
  const intl = useIntl();
  const doAction = useAction();

  const [form] = Form.useForm();

  const getPayloadList = React.useCallback(
    (values: FormValues) => {
      if (source?.uuid) {
        return values.addFeiShu!.atPersonList.map((item) => {
          return { ...item, endpointUuid: source.uuid };
        });
      }

      return [];
    },
    [source],
  );

  const onOk = async (values: FormValues) => {
    const payloadList = getPayloadList(values);

    doAction<AddSNSFeiShuAtPersonPayload[]>({
      mutation: addSNSFeiShuAtPerson,
      payload: payloadList,
      name: intl.formatMessage({
        id: "add.atPerson",
        defaultMessage: "Add Specific Members",
      }),
      total: payloadList.length,
      type: "SNSFeiShuAtPerson",
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
          parentFieldName="addFeiShu"
          supportAtType="userId"
        />
      </Form>
    </DialogForm>
  );
};

export default AddAtPersonAction;
