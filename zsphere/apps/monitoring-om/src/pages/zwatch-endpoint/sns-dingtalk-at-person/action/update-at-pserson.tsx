import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { FieldStack, InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  UpdateSNSDingTalkAtPersonPayload,
  SNSDingTalkAtPerson,
  DingTalkEndPoint,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateDingTalkAtPersonSchema,
  type UpdateDingTalkAtPersonFormValues,
} from "../../action/schema";

const updateSNSDingTalkAtPerson = gql`
  mutation updateSNSDingTalkAtPerson($input: UpdateSNSDingTalkAtPersonInput!) {
    updateSNSDingTalkAtPerson(input: $input) {
      actionId
    }
  }
`;

const UpdateAtPersonAction: React.FC<
  IActionWrapperProps<SNSDingTalkAtPerson, DingTalkEndPoint>
> = ({ visible, refetch, setVisible, selectedList, source }) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateDingTalkAtPersonFormValues>(() => {
    if (!selectedList || !selectedList[0]) {
      return {
        atPersonPhoneNumber: {
          areaCode: "86",
          phoneNumber: "",
        },
        remark: "",
      };
    }

    const [areaCode, phoneNumber] = selectedList[0].phoneNumber.split("-");

    return {
      atPersonPhoneNumber: { areaCode: areaCode.split("+")?.[1], phoneNumber },
      remark: selectedList[0].remark ?? "",
    };
  }, [selectedList]);
  const formSchema = useMemo(
    () => createUpdateDingTalkAtPersonSchema(intl),
    [intl],
  );
  const form = useForm<UpdateDingTalkAtPersonFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async ({
    remark,
    atPersonPhoneNumber,
  }: UpdateDingTalkAtPersonFormValues) => {
    const payload: UpdateSNSDingTalkAtPersonPayload = {
      endpointUuid: source?.uuid || "",
      remark,
      uuid: selectedList[0]?.uuid,
    };

    if (atPersonPhoneNumber?.phoneNumber) {
      payload.phoneNumber = `+${atPersonPhoneNumber?.areaCode}-${atPersonPhoneNumber?.phoneNumber}`;
    }

    doAction<UpdateSNSDingTalkAtPersonPayload>({
      mutation: updateSNSDingTalkAtPerson,
      payload,
      name: intl.formatMessage({
        id: "zwtach.endpoint.change.atPersonPhoneNumber",
        defaultMessage: "Update member phone number.",
      }),
      total: 1,
      type: "SNSDingTalkAtPerson",
    });
  };
  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "update.atPerson",
        defaultMessage: "Modify a specified member.",
      })}
      form={dialogForm}
      onOk={onOk}
      resourceName={selectedList?.[0]?.phoneNumber}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="atPersonPhoneNumber.areaCode"
            label={intl.formatMessage({
              id: "areaCode",
              defaultMessage: "International Area Code",
            })}
            prefix="+"
            required
            className="!w-20"
          />
          <InputField
            form={form}
            name="atPersonPhoneNumber.phoneNumber"
            label={intl.formatMessage({
              id: "phoneNumber",
              defaultMessage: "Phone Number",
            })}
            required
            size="m"
          />
          <InputField
            form={form}
            name="remark"
            label={intl.formatMessage({
              id: "remarks",
              defaultMessage: "Remark",
            })}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default UpdateAtPersonAction;
