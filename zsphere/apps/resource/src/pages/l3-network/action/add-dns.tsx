import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, RadioGroupField, FieldStack } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  L3Network as IL3Network,
  Dns as IDns,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm, type Path } from "react-hook-form";
import { useIntl } from "react-intl";

import { createAddDnsSchema, type AddDnsFormValues } from "./schema";

const addDnsToL3Network = gql`
  mutation addDnsToL3Network($input: AddDnsToL3NetworkInput!) {
    addDnsToL3Network(input: $input) {
      actionId
    }
  }
`;

interface SelectedList<T> {
  setSelectedList?: (selectedList: T[]) => void;
}

type IProps = Omit<IActionWrapperProps<IL3Network>, "setSelectedList"> & {
  ipVersion?: 4 | 6;
};

const Action: React.FC<
  (IProps & SelectedList<IDns>) | (IProps & SelectedList<IL3Network>)
> = ({ visible, setVisible, selectedList, setSelectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<AddDnsFormValues>(
    () => ({
      ipVersion: 4,
      dns: {
        "4": "",
        "6": "",
      },
    }),
    [],
  );
  const formSchema = useMemo(() => createAddDnsSchema(intl), [intl]);
  const form = useForm<AddDnsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const ipVersion = form.watch("ipVersion");
  const dnsFieldName = `dns.${ipVersion}` as Path<AddDnsFormValues>;

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, visible, form]);

  const onOk = async (input: AddDnsFormValues) => {
    const { uuid = "" } = selectedList?.[0] || {};

    doAction({
      mutation: addDnsToL3Network,
      payload: {
        dns: input.dns[String(input.ipVersion) as "4" | "6"],
        l3NetworkUuid: uuid,
      },
      name: intl.formatMessage({
        id: "add.dns",
        defaultMessage: "Add DNS",
      }),
      type: "Dns",
      total: selectedList.length,
      onFinish: () => setSelectedList?.([]),
    });

    setVisible(false);
  };

  const ipVersionOptions = useMemo(
    () => [
      {
        label: "IPv4",
        value: 4,
      },
      {
        label: "IPv6",
        value: 6,
      },
    ],
    [],
  );

  const tooltipProps = useMemo(() => {
    return {
      title:
        ipVersion === 4
          ? intl.formatMessage({
              id: "l3Network.field.ipv4Dns.hover",
              defaultMessage: `Example: 223.5.5.5`,
            })
          : intl.formatMessage({
              id: "l3Network.field.ipv6Dns.hover",
              defaultMessage: `Example: 240c::6644`,
            }),
    };
  }, [ipVersion, intl]);

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const dnsError = form.getFieldState(dnsFieldName).error;
          throw {
            errorFields: [
              {
                name: ["dns", String(ipVersion)],
                errors: dnsError?.message ? [dnsError.message] : [],
              },
            ],
          };
        }

        return form.getValues();
      },
      resetFields: () => {
        form.reset(defaultValues);
      },
    }),
    [defaultValues, dnsFieldName, form, ipVersion],
  );

  return (
    <DialogForm
      onOk={onOk}
      form={dialogForm}
      setVisible={setVisible}
      visible={visible}
      onCancel={() => setVisible(false)}
      title={intl.formatMessage({ id: "add.dns", defaultMessage: "Add DNS" })}
      resourceName={selectedList?.[0]?.name}
    >
      <Form {...form}>
        <FieldStack>
          <RadioGroupField
            form={form}
            name="ipVersion"
            label={intl.formatMessage({
              id: "ip.version",
              defaultMessage: "IP Address Type",
            })}
            options={ipVersionOptions}
          />
          <InputField
            form={form}
            name={dnsFieldName}
            label="DNS"
            required
            size="m"
            inputTooltip={tooltipProps.title}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
