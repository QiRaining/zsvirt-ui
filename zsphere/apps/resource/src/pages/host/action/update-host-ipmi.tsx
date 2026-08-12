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
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import { formatResourceName, Encrypt } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateHostIPMI } from "../../../gql/host.gql";
import {
  createUpdateHostIpmiSchema,
  type UpdateHostIpmiFormValues,
} from "./schema";

import style from "./style.module.less";

const Action: React.FC<IActionWrapperProps<IHost>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const host = selectedList?.[0];
  const doAction = useAction();
  const defaultValues = useMemo<UpdateHostIpmiFormValues>(
    () => ({
      ipmiAddress: host?.ipmiAddress ?? "",
      ipmiPort: String(host?.ipmiPort ?? ""),
      ipmiUsername: "",
      ipmiPassword: "",
    }),
    [host],
  );
  const formSchema = useMemo(() => createUpdateHostIpmiSchema(intl), [intl]);
  const form = useForm<UpdateHostIpmiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = async (values: UpdateHostIpmiFormValues) => {
    doAction({
      mutation: updateHostIPMI,
      payload: {
        ...values,
        ipmiPassword: Encrypt(values.ipmiPassword),
        ipmiPort: Number.parseInt(values?.ipmiPort, 10),
        uuid: host?.uuid,
      },
      name: intl.formatMessage({
        id: "update.ipmi.info",
        defaultMessage: "Modify IPMI Info",
      }),
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
      },
      type: "HostVO",
    });
    setVisible(false);
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "update.ipmi.info",
        defaultMessage: "Modify IPMI Info",
      })}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="ipmiAddress"
            required
            label={intl.formatMessage({
              id: "host.ipmi.address",
              defaultMessage: "IPMI Address",
            })}
            className={style["width-240"]}
          />
          <InputField
            form={form}
            name="ipmiPort"
            required
            label={intl.formatMessage({
              id: "host.ipmi.port",
              defaultMessage: "IPMI Port",
            })}
            className={style["width-80"]}
          />
          <InputField
            form={form}
            name="ipmiUsername"
            required
            label={intl.formatMessage({
              id: "host.ipmi.username",
              defaultMessage: "IPMI Username",
            })}
            className={style["width-240"]}
          />
          <InputPasswordField
            form={form}
            name="ipmiPassword"
            required
            label={intl.formatMessage({
              id: "host.ipmi.password",
              defaultMessage: "IPMI Password",
            })}
            className={style["width-240"]}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
