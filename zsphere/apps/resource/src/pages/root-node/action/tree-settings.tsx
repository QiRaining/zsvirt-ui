import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  SelectField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useShallow } from "zustand/react/shallow";

import {
  createResourceTreeSettingsSchema,
  resourceTreeArrangeKeys,
  resourceTreeOrderDirections,
  type ResourceTreeSettingsFormValues,
} from "./schema";

const TreeSettings: React.FC<IActionWrapperProps<Item>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const { resourceTreeSettings, setResourceTreeSettings } =
    useVirtualizationResourceStore(
      useShallow((state) => ({
        resourceTreeSettings: state.resourceTreeSettings,
        setResourceTreeSettings: state.setResourceTreeSettings,
      })),
    );
  const formSchema = useMemo(() => createResourceTreeSettingsSchema(), []);
  const defaultValues = useMemo(
    () => resourceTreeSettings,
    [resourceTreeSettings],
  );
  const form = useForm<ResourceTreeSettingsFormValues>({
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

  const arrangeKeyOptions = useMemo(
    () =>
      resourceTreeArrangeKeys.map((value) => ({
        label:
          value === "createDate"
            ? intl.formatMessage({
                id: "resource.tree.settings.arrangeKey.createDate",
                defaultMessage: "Create Date",
              })
            : intl.formatMessage({
                id: "resource.tree.settings.arrangeKey.name",
                defaultMessage: "Name",
              }),
        value,
      })),
    [intl],
  );

  const orderDirectionOptions = useMemo(
    () =>
      resourceTreeOrderDirections.map((value) => ({
        label:
          value === "asc"
            ? intl.formatMessage({
                id: "resource.tree.settings.orderDirection.asc",
                defaultMessage: "Ascending",
              })
            : intl.formatMessage({
                id: "resource.tree.settings.orderDirection.desc",
                defaultMessage: "Descending",
              }),
        value,
      })),
    [intl],
  );

  const onOk = (values: ResourceTreeSettingsFormValues) => {
    setResourceTreeSettings(values);
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "resource.tree.settings",
        defaultMessage: "Tree Settings",
      })}
    >
      <Form {...form}>
        <FieldStack>
          <SelectField
            form={form}
            name="arrangeKey"
            label={intl.formatMessage({
              id: "resource.tree.settings.arrangeKey",
              defaultMessage: "Arrange",
            })}
            options={arrangeKeyOptions}
            className="width-320"
            getSelectPortalContainer={(node) =>
              node.closest('[role="dialog"]') as HTMLElement | null
            }
          />
          <SelectField
            form={form}
            name="orderDirection"
            label={intl.formatMessage({
              id: "resource.tree.settings.orderDirection",
              defaultMessage: "Sort",
            })}
            options={orderDirectionOptions}
            className="width-320"
            getSelectPortalContainer={(node) =>
              node.closest('[role="dialog"]') as HTMLElement | null
            }
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default TreeSettings;
