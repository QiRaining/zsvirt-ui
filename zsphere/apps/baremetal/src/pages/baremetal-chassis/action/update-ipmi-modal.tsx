import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  InputPasswordField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalChassis } from "@zstack/zsphere-types/graphql";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateBaremetalChassis } from "../../../gql/baremetal-chassis.gql";
import {
  createBaremetalChassisUpdateIpmiSchema,
  type BaremetalChassisUpdateIpmiFormValues,
} from "./schema";

const Action: React.FC<IActionWrapperProps<BaremetalChassis>> = ({
  visible,
  setVisible,
  selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues =
    React.useMemo<BaremetalChassisUpdateIpmiFormValues>(() => {
      const { ipmiUsername } = selectedList[0] ?? {};
      return {
        ipmiUsername: ipmiUsername ?? "",
        ipmiPassword: "",
      };
    }, [selectedList]);
  const formSchema = React.useMemo(
    () => createBaremetalChassisUpdateIpmiSchema(intl),
    [intl],
  );
  const form = useForm<BaremetalChassisUpdateIpmiFormValues>({
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

  const onOk = async (values: BaremetalChassisUpdateIpmiFormValues) => {
    doAction({
      mutation: updateBaremetalChassis,
      payload: {
        ...values,
        uuid: selectedList?.[0]?.uuid,
      },
      type: "BaremetalChassis",
      name: intl.formatMessage({
        id: "update.baremetalChassis.ipmiInfo",
        defaultMessage: "Update IPMI Info",
      }),
      total: 1,
      onFinish: () => {
        setVisible(false);
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "baremetalChassis.modal.title.update.baremetalChassis.ipmiInfo",
        defaultMessage: "Update IPMI Info",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="ipmiUsername"
            label={intl.formatMessage({
              id: "ipmi.username",
              defaultMessage: "IPMI Username",
            })}
            required
            size="m"
          />
          <InputPasswordField
            form={form}
            label={intl.formatMessage({
              id: "ipmi.password",
              defaultMessage: "IPMI Password",
            })}
            name="ipmiPassword"
            required
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
