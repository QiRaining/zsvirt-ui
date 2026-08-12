import { gql } from "@apollo/client";
import { Form, ListCollect } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { DingTalkEndPoint as IDingTalkEndPoint } from "@zstack/zsphere-types/graphql";
import { cloneDeep } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import AreaCodePhoneNumberInput from "../components/area-code-phone-number";
import type { AreaCodePhoneNumber } from "../create/basic-config";

import style from "./style.module.less";

const ModifyAction: React.FC<IActionWrapperProps<IDingTalkEndPoint>> = ({
  visible,
  refetch,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const [form] = Form.useForm();
  const initialValues = useMemo(() => {
    const value = {
      addDingTalk: {
        atPersonPhoneNumbers: [] as AreaCodePhoneNumber[],
      },
    };
    if (selectedList?.[0]?.atPersonPhoneNumbers) {
      value.addDingTalk.atPersonPhoneNumbers = cloneDeep(
        selectedList?.[0]?.atPersonPhoneNumbers?.map((it) => {
          const phoneNumber = it?.split("-")?.[1];
          const areaCode = it?.split("-")?.[0]?.split("+")?.[1];
          return { areaCode, phoneNumber };
        }),
      );
    }
    return value;
  }, [selectedList]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues);
    }
  }, [visible]);

  const addSNSDingTalkAtPerson = gql`
    mutation addSNSDingTalkAtPerson($input: AddSNSDingTalkAtPersonInput!) {
      addSNSDingTalkAtPerson(input: $input) {
        actionId
      }
    }
  `;

  const removeSNSDingTalkAtPerson = gql`
    mutation removeSNSDingTalkAtPerson(
      $input: RemoveSNSDingTalkAtPersonInput!
    ) {
      removeSNSDingTalkAtPerson(input: $input) {
        actionId
      }
    }
  `;

  const modifyDingTalkAtPerson = gql`
    mutation modifyDingTalkAtPerson($input: ModifyDingTalkAtPersonInput!) {
      modifyDingTalkAtPerson(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async (values: any) => {
    let fn;
    let payload;
    if (initialValues?.addDingTalk?.atPersonPhoneNumbers?.length === 0) {
      fn = addSNSDingTalkAtPerson;
      payload = values?.addDingTalk?.atPersonPhoneNumbers?.map(
        (it: AreaCodePhoneNumber) => {
          return {
            phoneNumber: `+${it?.areaCode}-${it?.phoneNumber}`,
            endpointUuid: selectedList?.[0]?.uuid,
          };
        },
      );
    } else {
      fn = modifyDingTalkAtPerson;
      payload = {
        oldPhoneNumbers: initialValues?.addDingTalk?.atPersonPhoneNumbers?.map(
          (it: AreaCodePhoneNumber) => `+${it?.areaCode}-${it?.phoneNumber}`,
        ),
        phoneNumbers: values?.addDingTalk?.atPersonPhoneNumbers?.map(
          (it: AreaCodePhoneNumber) => `+${it?.areaCode}-${it?.phoneNumber}`,
        ),
        endpointUuid: selectedList?.[0]?.uuid,
      };
    }
    if (values?.addDingTalk?.atPersonPhoneNumbers?.length === 0) {
      fn = removeSNSDingTalkAtPerson;
      payload = initialValues?.addDingTalk?.atPersonPhoneNumbers?.map(
        (it: AreaCodePhoneNumber) => {
          return {
            phoneNumber: `+${it?.areaCode}-${it?.phoneNumber}`,
            endpointUuid: selectedList?.[0]?.uuid,
          };
        },
      );
    }

    doAction({
      mutation: fn,
      payload,
      name: intl.formatMessage({
        id: "change.specifyMemeber",
        defaultMessage: "Change Specified Contact",
      }),
      total: 1,
      type: "EndPoint",
      onProgress: (result: ITaskResult) => {
        console.log("onProgress:", result);
      },
      onFinish: (result: IActionResult) => {
        console.log("onFinish:", result);
        refetch?.();
      },
    });
  };
  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "change.specifyMemeber",
        defaultMessage: "Change Specified Contact",
      })}
      form={form}
      onOk={onOk}
      className={style.modifyDingTalkAtPersonModal}
    >
      <Form form={form} initialValues={initialValues}>
        <Form.Item
          label={intl.formatMessage({
            id: "phoneNumber",
            defaultMessage: "Phone Number",
          })}
          required
        >
          <Form.List name={["addDingTalk", "atPersonPhoneNumbers"]}>
            {(fields, { add, remove }) => {
              return (
                <ListCollect
                  label={intl.formatMessage({
                    id: "add.phoneNumber",
                    defaultMessage: "Add Phone Number",
                  })}
                  dataSource={fields}
                  add={() => add()}
                  remove={remove}
                  layout="block"
                >
                  {(field: any) => (
                    <Form.Item style={{ marginBottom: "5px" }} {...field}>
                      <AreaCodePhoneNumberInput
                        form={form}
                        fieldName={field.name}
                        parentName="atPersonPhoneNumbers"
                      />
                    </Form.Item>
                  )}
                </ListCollect>
              );
            }}
          </Form.List>
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default ModifyAction;
