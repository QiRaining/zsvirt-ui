import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  BaremetalChassis as IBaremetalChassis,
  UpdateBaremetalChassisInput as IUpdateBaremetalChassisInput,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { updateBaremetalChassis } from "../../../gql/baremetal-chassis.gql";
import {
  createBaremetalChassisUpdateSchema,
  type BaremetalChassisUpdateFormValues,
} from "./schema";

interface IFormPorps {
  updateData: Omit<IUpdateBaremetalChassisInput["payload"][number], "uuid">;
}

const UpdateAction: React.FC<
  IActionWrapperProps<IBaremetalChassis> & IFormPorps
> = ({ visible, updateData, setVisible, selectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<BaremetalChassisUpdateFormValues>(
    () => ({
      name: updateData.name ?? "",
      description: updateData.description ?? "",
    }),
    [updateData],
  );
  const formSchema = useMemo(
    () => createBaremetalChassisUpdateSchema(intl),
    [intl],
  );
  const form = useForm<BaremetalChassisUpdateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = (data: Record<string, unknown>) => {
    const values = data as BaremetalChassisUpdateFormValues;

    doAction({
      mutation: updateBaremetalChassis,
      payload: [
        {
          ...values,
          uuid: selectedList?.[0]?.uuid ?? "",
        },
      ],
      name: intl.formatMessage({
        id: "change.baremetalChassis",
        defaultMessage: "Edit Bare Metal Chassis",
      }),
      total: 1,
    });
  };

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const title = useMemo(
    () =>
      intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      }),
    [intl],
  );

  return (
    <DialogForm
      title={title}
      resourceName={formatResourceName(selectedList, intl)}
      visible={visible}
      setVisible={setVisible}
      form={dialogForm}
      onOk={onOk}
    >
      <Form {...form}>
        {"name" in updateData && (
          <FieldStack>
            <InputField
              form={form}
              name="name"
              label={intl.formatMessage({
                id: "name",
                defaultMessage: "Name",
              })}
              labelTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "baremetalChassis.field.name.tooltip",
                    defaultMessage: `### Baremetal Chassis

1. Management nodes must connect to IPMI networks so that baremetal chassis can be remotely controlled via IPMI.
2. Baremetal chassis must be configured with remote controller cards. Configure IPMI addresses, ports, usernames, and passwords for the remote controller cards, and connect these cards to IPMI networks.
3. PXE boot NICs of baremetal chassis must connect to deployment networks.
4. Other NICs of baremetal chassis must connect to the corresponding L2 network.`,
                  })}
                </ReactMarkdown>
              }
              required
              size="m"
            />
            <TextareaField
              form={form}
              name="description"
              label={intl.formatMessage({
                id: "description",
                defaultMessage: "Description",
              })}
              rows={3}
              size="m"
              maxLength={256}
            />
          </FieldStack>
        )}
      </Form>
    </DialogForm>
  );
};

export default UpdateAction;

export const UpdateNameDescriptionAction: React.FC<
  IActionWrapperProps<IBaremetalChassis>
> = ({ selectedList, ...props }) => {
  const updateData = useMemo(() => {
    const item = selectedList?.[0];

    if (!item) {
      return {};
    }

    return {
      name: item.name,
      description: item.description,
    };
  }, [selectedList]);

  return (
    <UpdateAction
      {...props}
      selectedList={selectedList}
      updateData={updateData}
    />
  );
};

export function useUpdateModal() {
  const [updateData, setUpdateData] = useState<IFormPorps["updateData"]>({});

  const [visible, setVisible] = useState<boolean>(false);

  const onEditHandle = (data: typeof updateData) => {
    setUpdateData(data);

    setVisible(true);
  };

  return {
    visible,
    setVisible,
    updateData,
    onEditHandle,
  };
}
