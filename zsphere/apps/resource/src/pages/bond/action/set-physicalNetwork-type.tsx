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
import SelectPhysicalNetwork from "@zstack/virtualization-resource/src/pages/physical-nic/components/select-physical-network";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Bond as IBond } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createBondPhysicalNetworkTypeSchema,
  type BondPhysicalNetworkTypeFormValues,
} from "./schema";

const setPhysicalNetworkBondPhysicalNetworkType = gql`
  mutation setPhysicalNetworkBondPhysicalNetworkType(
    $input: SetPhysicalNetworkBondPhysicalNetworkTypeInput!
  ) {
    setPhysicalNetworkBondPhysicalNetworkType(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IBond>> = ({
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
      selectedList?.[0]?.hostNetworkBondingServiceRef?.filter(
        (it) => it.vlanId === 0,
      )?.[0]?.serviceTypes ?? [],
    [selectedList],
  );

  const defaultValues = React.useMemo<BondPhysicalNetworkTypeFormValues>(
    () => ({
      serviceTypes: currentServiceTypes,
    }),
    [currentServiceTypes],
  );
  const formSchema = React.useMemo(
    () => createBondPhysicalNetworkTypeSchema(),
    [],
  );
  const form = useForm<BondPhysicalNetworkTypeFormValues>({
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

  const onOk = usePersistFn(
    async (input: BondPhysicalNetworkTypeFormValues) => {
      const payload = [
        {
          bondingUuids: [selectedList?.[0]?.uuid],
          serviceTypes: input.serviceTypes,
        },
      ];

      doAction({
        mutation: setPhysicalNetworkBondPhysicalNetworkType,
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
    },
  );

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
