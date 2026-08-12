import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@zstack/design";
import {
  FieldStack,
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import SelectTag from "@zstack/virtualization-resource/src/pages/tag/components/select-tag";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import {
  Identity,
  Op,
  type IActionWrapperProps,
  type IQuery,
} from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { includes, compact, uniq } from "lodash-es";
import { type FC, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useResourceConfigQuery } from "../../hooks/use-resource-config-query";
import {
  createCloneVmToTemplateSchema,
  type CloneVmToTemplateValues,
} from "./schema";

import styles from "./style.module.less";

const cloneVmToTemplate = gql`
  mutation cloneVmToTemplate($input: CloneVmToTemplateInput!) {
    cloneVmToTemplate(input: $input) {
      actionId
    }
  }
`;

const ADMINUUID = "36c27e8ff05c4780bf6d2fa65700f22e";

const Action: FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
}) => {
  const intl = useIntl();
  const vm = selectedList?.[0];
  const { currentUser } = usePlatformStore();

  const isAdmin = includes(
    [Identity.PlatformAdmin, Identity.Admin],
    currentUser?.currentIdentity,
  );

  const defaultValues = useMemo<CloneVmToTemplateValues>(
    () => ({
      name: "",
      description: "",
      tags: vm?.tag ?? [],
    }),
    [vm],
  );
  const formSchema = useMemo(() => createCloneVmToTemplateSchema(intl), [intl]);
  const form = useForm<CloneVmToTemplateValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const [resourceConfig] = useResourceConfigQuery(
    vm?.uuid,
    ["vm"],
    ["numa"],
    visible,
  );

  const systemTags = useMemo(() => {
    const tags: string[] = [];
    if (resourceConfig?.numa?.value) {
      tags.push(`resourceConfig::vm::numa::${resourceConfig.numa.value}`);
    }
    return tags;
  }, [resourceConfig]);

  //
  // useEffect(() => {
  //   if (visible) {
  //     form.setFieldsValue({
  //       name: `${selectedList?.[0]?.name}-${intl.locale === 'en-US' ? 'clone' : '克隆'}`
  //     })
  //   }
  // }, [selectedList, intl, visible, form])

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const doAction = useAction();

  const onAddOk = (value: CloneVmToTemplateValues) => {
    // const backupStorageUuid = value.backupStorage?.[0]?.uuid
    const tagUuids = value.tags?.map((tag) => tag.uuid);

    doAction({
      mutation: cloneVmToTemplate,
      payload: [
        {
          vmInstanceUuid: vm?.uuid,
          name: value.name,
          description: value.description,
          // backupStorageUuid,
          tagUuids,
          systemTags,
        },
      ],
      name: intl.formatMessage({
        id: "instance.clone.to.vm.template",
        defaultMessage: "Clone Virtual Machine to Template",
      }),
      type: "VmInstance",
      total: 1,
      onFinish: () => {},
    });
  };

  const tagDefaultQuery = useMemo<IQuery>(() => {
    const conditions: IQuery["conditions"] = [];

    // 单选
    if (selectedList.length === 1) {
      if (isAdmin) {
        conditions.push({
          key: "ownerUuids",
          op: Op.in,
          values: compact(uniq([ADMINUUID, selectedList?.[0]?.owner?.uuid])),
        });
      }
    }

    // 多选
    if (selectedList.length > 1) {
      if (isAdmin) {
        conditions.push({
          key: "ownerUuids",
          op: Op.in,
          values: [ADMINUUID],
        });
      }
    }

    return {
      conditions,
    };
  }, [selectedList, isAdmin]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      form={dialogForm}
      onOk={onAddOk}
      resourceName={vm?.name}
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "instance.clone.to.template.alert.content",
            defaultMessage: `If the VM has GPU, USB, or PCIe devices attached (except for PCIe devices automatically attached by SR-IOV NICs), the cloned template will not include these devices. To keep these devices, you can covert the VM to a template.`,
          })}
        </ReactMarkdown>
      }
      alertType="warning"
      title={intl.formatMessage({
        id: "instance.clone.to.template",
        defaultMessage: "Clone Virtual Machine to Template",
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
            rows={4}
            limit={2000}
            size="m"
          />
          <FormItem className="flex flex-row gap-2">
            <div className="box-border flex h-min w-40 min-w-40 items-center gap-1 text-sm text-neutral-600">
              {intl.formatMessage({
                id: "dataStorage",
                defaultMessage: "Data Storage",
              })}
            </div>
            <div className="w-80">
              {intl.formatMessage({
                id: "clone.to.vm.template.form.item.datastorage.content",
                defaultMessage: "Consistent with source data storage",
              })}
            </div>
          </FormItem>
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel>
                  {intl.formatMessage({ id: "tag", defaultMessage: "Tag" })}
                </FormLabel>
                <div className="flex flex-col">
                  <SelectTag
                    value={field.value}
                    onChange={field.onChange}
                    className={styles["width-320"]}
                    defaultQuery={tagDefaultQuery}
                  />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
