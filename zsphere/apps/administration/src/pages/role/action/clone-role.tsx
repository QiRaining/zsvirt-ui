import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { getMenuTree } from "@zstack/zsphere-config";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import { forEach } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { cloneRole } from "../../../gql/role.gql";
import { collectFilteredMenuTreeKeys } from "../create/collect-default-checked-keys";
import { useRoleFilterConfig } from "../hooks/use-ui-privilege/use-role-filter-config";
import { createKeyToMenuKeyMap, transformRoleName } from "../utils";
import { createCloneRoleSchema, type CloneRoleFormValues } from "./schema";

const Action: React.FC<IActionWrapperProps<IZsvRole>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const keyToMenuKeyMap = createKeyToMenuKeyMap();
  const menu = useMemo(() => getMenuTree("root", intl), [intl]);
  const { filteredMenuKeys } = useRoleFilterConfig(selectedList?.[0]);
  const filteredCheckedKeys = useMemo(
    () => collectFilteredMenuTreeKeys(menu, filteredMenuKeys),
    [menu, filteredMenuKeys],
  );
  const filteredCheckedKeySet = useMemo(
    () => new Set(filteredCheckedKeys),
    [filteredCheckedKeys],
  );

  const doAction = useAction();

  const defaultValues = useMemo<CloneRoleFormValues>(() => {
    const values: CloneRoleFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      const { name = "", description = "", uuid } = selectedList[0];
      values.name = `${transformRoleName(intl, {
        uuid,
        name,
      })}-${intl.formatMessage({
        id: "clone",
        defaultMessage: "Clone",
      })}`;
      values.description = description;
    }
    return values;
  }, [intl, selectedList]);
  const formSchema = useMemo(() => createCloneRoleSchema(intl), [intl]);
  const form = useForm<CloneRoleFormValues>({
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

  const transformUiPrivilege = (
    uiPrivilege: Record<
      string,
      {
        viewKey?: string;
        views?: unknown;
        actions?: unknown;
      }
    >,
  ) => {
    const results: Array<{
      resourceType: string;
      actionKey: string;
      viewKey: string;
      effect: "allow";
      views?: unknown;
      actions?: unknown;
    }> = [];
    forEach(uiPrivilege, (value, key) => {
      if (filteredCheckedKeySet.has(key)) {
        return;
      }

      results.push({
        resourceType: key,
        actionKey: key,
        viewKey: value.viewKey ?? keyToMenuKeyMap.get(key) ?? "",
        effect: "allow",
        views: value.views,
        actions: value.actions,
      });
    });
    return results;
  };

  const onOk = (values: CloneRoleFormValues) => {
    setVisible(false);

    const payload = selectedList.map((item) => ({
      name: values.name,
      description: values.description,
      uiPrivilege: transformUiPrivilege(
        JSON.parse(item?.uiPrivilege || "{}") as Record<
          string,
          {
            viewKey?: string;
            views?: unknown;
            actions?: unknown;
          }
        >,
      ),
      policies: (item?.policies || []).map((api: any) => ({
        effect: "Allow",
        actions: api,
      })),
    }));

    doAction({
      mutation: cloneRole,
      payload,
      name: intl.formatMessage({
        id: "virtualization.clone.role",
        defaultMessage: "Clone Role",
      }),
      total: 1,
      type: "Role",
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "clone.role",
        defaultMessage: "Clone Role",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={transformRoleName(intl, {
        uuid: selectedList?.[0]?.uuid,
        name: selectedList?.[0]?.name,
      })}
    >
      <Form {...form}>
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
              id: "introduction",
              defaultMessage: "Description",
            })}
            size="m"
            maxLength={256}
            showCount
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
