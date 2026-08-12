import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PhysicalNic as IPhysicalNic } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import SelectPhysicalNetwork from "../components/select-physical-network";
import {
  createPhysicalNicNetworkTypeSchema,
  type PhysicalNicNetworkTypeFormValues,
} from "./schema";

const setPhysicalNetworkInterfacePhysicalNetworkType = gql`
  mutation setPhysicalNetworkInterfacePhysicalNetworkType(
    $input: SetPhysicalNetworkInterfacePhysicalNetworkTypeInput!
  ) {
    setPhysicalNetworkInterfacePhysicalNetworkType(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPhysicalNic>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const currentServiceTypes = React.useMemo(
    () =>
      selectedList?.[0]?.hostNetworkInterfaceServiceRef?.filter(
        (it) => it.vlanId === 0,
      )?.[0]?.serviceTypes ?? [],
    [selectedList],
  );

  const defaultValues = React.useMemo<PhysicalNicNetworkTypeFormValues>(
    () => ({
      serviceTypes: currentServiceTypes,
    }),
    [currentServiceTypes],
  );
  const formSchema = React.useMemo(
    () => createPhysicalNicNetworkTypeSchema(),
    [],
  );
  const form = useForm<PhysicalNicNetworkTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, form, defaultValues]);

  const onOk = usePersistFn(async (input: PhysicalNicNetworkTypeFormValues) => {
    const payload = [
      {
        interfaceUuids: [selectedList?.[0]?.uuid],
        serviceTypes: input.serviceTypes,
      },
    ];

    doAction({
      mutation: setPhysicalNetworkInterfacePhysicalNetworkType,
      payload,
      name: intl.formatMessage({
        id: "set.physicalNetwok.type",
        defaultMessage: "Modify Network Type",
      }),
      total: payload.length,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  });

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "set.physicalNetwok.type",
        defaultMessage: "Modify Network Type",
      })}
    >
      <Form {...form}>
        <FormField
          control={form.control}
          name="serviceTypes"
          render={({ field }) => (
            <FormItem className="flex flex-row gap-2">
              <FormLabel
                info={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "interface.field.serviceTypes.iconTooltip",
                      defaultMessage: "iconTooltip",
                    })}
                  </ReactMarkdown>
                }
                className="mt-[5px] flex"
              >
                {intl.formatMessage({
                  id: "physicalNetwok.type",
                  defaultMessage: "Physical Network Type",
                })}
              </FormLabel>
              <div className="flex flex-col">
                <FormControl>
                  <SelectPhysicalNetwork
                    width={320}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
