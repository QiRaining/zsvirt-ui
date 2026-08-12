import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, useDialogHookFormAdapter, FieldStack } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  UpdateSNSWeComAtPersonPayload,
  SNSWeComAtPerson,
  WeComEndPoint,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateWeComAtPersonSchema,
  type UpdateWeComAtPersonFormValues,
} from "./schema";

import style from "./style.module.less";

const updateSNSWeComAtPerson = gql`
  mutation updateSNSWeComAtPerson($input: UpdateSNSWeComAtPersonInput!) {
    updateSNSWeComAtPerson(input: $input) {
      actionId
    }
  }
`;

const UpdateAtPersonAction: React.FC<
  IActionWrapperProps<SNSWeComAtPerson, WeComEndPoint>
> = ({ visible, setVisible, selectedList, source }) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateWeComAtPersonFormValues>(() => {
    if (!selectedList || !selectedList[0]) {
      return {
        atPersonUserId: "",
        remark: "",
      };
    }

    const atPersonUserId = selectedList[0].userId;

    return {
      atPersonUserId: atPersonUserId ?? "",
      remark: selectedList[0].remark ?? "",
    };
  }, [selectedList]);
  const formSchema = useMemo(
    () => createUpdateWeComAtPersonSchema(intl),
    [intl],
  );
  const form = useForm<UpdateWeComAtPersonFormValues>({
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
    atPersonUserId,
  }: UpdateWeComAtPersonFormValues) => {
    const payload: UpdateSNSWeComAtPersonPayload = {
      endpointUuid: source?.uuid || "",
      remark,
      uuid: selectedList[0]?.uuid,
      userId: atPersonUserId,
    };

    doAction<UpdateSNSWeComAtPersonPayload>({
      mutation: updateSNSWeComAtPerson,
      payload,
      name: intl.formatMessage({
        id: "change.atPseron",
        defaultMessage: "Member Modification",
      }),
      total: 1,
      type: "SNSWeComAtPerson",
    });
  };
  return (
    <DialogForm
      className={style.snsAtPersonModal}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "update.atPerson",
        defaultMessage: "Modify a specified member.",
      })}
      form={dialogForm}
      onOk={onOk}
      resourceName={selectedList?.[0]?.userId}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="atPersonUserId"
            label={intl.formatMessage({
              id: "userID",
              defaultMessage: "User ID",
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
