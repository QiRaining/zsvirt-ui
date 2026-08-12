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
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo, useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateZone } from "../../../gql/zone.gql";
import { createZoneUpdateSchema, type ZoneUpdateFormValues } from "./schema";

export const ZoneFormItems: React.FC<{
  form: UseFormReturn<ZoneUpdateFormValues>;
  isWizard?: boolean;
}> = ({ form }) => {
  const intl = useIntl();

  return (
    <FieldStack>
      <InputField
        form={form}
        name="name"
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
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
        limit={2000}
        size="m"
      />
    </FieldStack>
  );
};

const UpdateModal: React.FC<IActionWrapperProps<IZone>> = ({
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { currentZone, setCurrentZone } = usePlatformStore();

  const defaultValues = useMemo<ZoneUpdateFormValues>(() => {
    return {
      name: selectedList?.[0]?.name ?? "",
      description: selectedList?.[0]?.description || "",
    };
  }, [selectedList]);
  const formSchema = useMemo(() => createZoneUpdateSchema(intl), [intl]);
  const form = useForm<ZoneUpdateFormValues>({
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

  const onOk = async (values: ZoneUpdateFormValues) => {
    doAction({
      mutation: updateZone,
      payload: {
        ...values,
        uuid: selectedList?.[0].uuid,
      },
      name: intl.formatMessage({
        id: "zone.action.edit",
        defaultMessage: "Edit Name and Description",
      }),
      total: selectedList.length,
      type: "Zone",
      onFinish: () => {
        if (currentZone?.uuid === selectedList?.[0]?.uuid) {
          setCurrentZone({ ...selectedList?.[0], ...values });
        }
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "zone.action.edit",
        defaultMessage: "Edit Name and Description",
      })}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <ZoneFormItems form={form} />
      </Form>
    </DialogForm>
  );
};

export default UpdateModal;
