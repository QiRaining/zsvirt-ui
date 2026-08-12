import { useLazyQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RadioGroup,
} from "@zstack/design";
import { FieldStack, InputField, useDialogHookFormAdapter } from "@zstack/form";
import {
  vmDirectoryGroupList,
  addGroup,
} from "@zstack/virtualization-resource/src/gql/vm-directory.gql";
import type { VMGroupDirectoryTree } from "@zstack/virtualization-resource/src/pages/directory/utils";
import VmGroupDirectorTreeSelect from "@zstack/virtualization-resource/src/pages/vm/create/basic-config/group/tree-select";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { VMGroupDirectory } from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createDirectoryListCreateSchema,
  type DirectoryListCreateFormValues,
} from "./schema";

import style from "./style.module.less";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  selectedList: any[];
  source?: any;
}

export default ({ visible, setVisible, selectedList, source }: IProps) => {
  const intl = useIntl();
  const doAction = useAction();
  const current = useMemo(() => {
    if (
      selectedList[0] &&
      selectedList[0].__typename === "VMGroupDirectory" &&
      (!selectedList[0].level || selectedList[0].level < 3)
    ) {
      return {
        ...selectedList[0],
        childNodes: selectedList[0].children,
      };
    }
    return null;
  }, [selectedList]);

  let zoneUuid: string | null = null;
  if (selectedList[0]?.__typename === "Zone") {
    zoneUuid = selectedList[0].uuid;
  } else if (
    selectedList[0]?.__typename === "VMGroupDirectory" &&
    selectedList[0].zoneUuid
  ) {
    zoneUuid = selectedList[0].zoneUuid;
  } else if (source?.__typename === "Zone") {
    zoneUuid = source.uuid;
  }

  const [query, { data, loading }] = useLazyQuery(vmDirectoryGroupList);

  const treeData = useMemo(() => {
    const list = data?.vmDirectoryGroupList?.list ?? [];
    // 过滤掉特殊节点 key 为 -1、-2 的虚拟根节点
    const filteredList = list.filter((t: any) => !["-1", "-2"].includes(t.key));

    // 构建树结构，顶层分组的 parentUuid 是 "-1"
    const buildTree = (
      items: any[],
      parentKey: string,
    ): VMGroupDirectoryTree[] => {
      return items
        .filter((item) => item.parentUuid === parentKey)
        .map((item) => {
          const node: any = { ...item };
          const children = buildTree(items, item.key);
          node.childNodes = children;
          // level 2 的节点不显示子节点（限制层级为3层）
          if (item.level === 2) {
            node.children = [];
          } else if (children.length > 0) {
            node.children = children;
          }
          return node;
        });
    };

    // 顶层分组的 parentUuid 是 "-1"
    return buildTree(filteredList, "-1");
  }, [data]);

  const defaultValues = useMemo<DirectoryListCreateFormValues>(
    () => ({
      name: "",
      groupType: current ? "sub" : "new",
      parent: current,
      treeData,
    }),
    [current, treeData],
  );
  const formSchema = useMemo(
    () => createDirectoryListCreateSchema(intl),
    [intl],
  );
  const form = useForm<DirectoryListCreateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const groupType = form.watch("groupType");

  useEffect(() => {
    if (visible && zoneUuid) {
      query({
        variables: {
          conditions: [
            {
              key: "zoneUuid",
              value: zoneUuid,
              op: Op.eq,
            },
          ],
        },
      });
    }
  }, [query, visible, zoneUuid]);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, form, defaultValues]);

  useEffect(() => {
    form.setValue("treeData", treeData, {
      shouldValidate: !!form.getValues("name"),
    });
  }, [form, treeData]);

  useEffect(() => {
    if (visible && form.getValues("name")) {
      form.trigger("name");
    }
  }, [visible, groupType, form]);

  const handleParentChange = (value: VMGroupDirectoryTree) => {
    form.setValue("parent", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    if (form.getValues("name")) {
      form.trigger("name");
    }
  };

  const onOk = (formData: DirectoryListCreateFormValues) => {
    doAction({
      mutation: addGroup,
      payload: {
        parentUuid: formData.groupType === "sub" ? formData.parent?.uuid : "",
        name: formData.name,
        type: "default",
        zoneUuid,
      },
      type: "DirectoryGroup",
      name: intl.formatMessage({
        id: "create.vm.group",
        defaultMessage: "Create Sub Group",
      }),
      total: 1,
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "dirList.create.vm.group.title",
        defaultMessage: "New VM Group",
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
            name="name"
            label={intl.formatMessage({
              id: "name",
              defaultMessage: "Name",
            })}
            size="m"
            required
          />
          <FormField
            control={form.control}
            name="groupType"
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel className="mt-[5px] flex">
                  {intl.formatMessage({
                    id: "vm.group.create.type",
                    defaultMessage: "Group Type",
                  })}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (form.getValues("name")) {
                        form.trigger("name");
                      }
                    }}
                    options={[
                      {
                        value: "new",
                        label: intl.formatMessage({
                          id: "vm.group.create.type.new",
                          defaultMessage: "New Group",
                        }),
                      },
                      {
                        value: "sub",
                        label: intl.formatMessage({
                          id: "vm.group.create.type.sub",
                          defaultMessage: "Subgroup",
                        }),
                      },
                    ]}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {groupType === "sub" && (
            <FormField
              control={form.control}
              name="parent"
              render={({ field }) => (
                <FormItem className="flex flex-row gap-2">
                  <FormLabel required className="mt-[5px] flex">
                    {intl.formatMessage({
                      id: "vm.group.parent",
                      defaultMessage: "Upper-level grouping",
                    })}
                  </FormLabel>
                  <div className="flex flex-col">
                    <FormControl>
                      <DirectoryTreeSelect
                        value={field.value as VMGroupDirectoryTree}
                        treeData={treeData}
                        loading={loading}
                        onChange={handleParentChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          )}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

interface IDirectoryTreeProps {
  value?: VMGroupDirectoryTree;
  onChange?: (value: VMGroupDirectoryTree) => void;
  loading?: boolean;
  treeData: VMGroupDirectoryTree[];
}

function DirectoryTreeSelect({
  value,
  onChange,
  loading,
  treeData,
}: IDirectoryTreeProps) {
  const [open, setOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(() => {
    const result: string[] = [];
    let current = value?.parent;
    while (current) {
      result.push(current.key);
      current = current.parent;
    }
    return result;
  });
  const handleTreeNodeSelect = (
    keys: string[],
    info: { node: VMGroupDirectory },
  ) => {
    setOpen(false);
    onChange?.(info.node);
  };
  return (
    <VmGroupDirectorTreeSelect
      showSearch={false}
      viewType="empty"
      widthClassName="w-80"
      maxContentWidth={275}
      treeHeight={192}
      dropdownStyles={{ width: 320, height: 200 }}
      loading={!!loading}
      treeData={treeData}
      open={open}
      onTreeNodeSelect={handleTreeNodeSelect}
      onDropdownVisibleChange={(visible: boolean) => setOpen(visible)}
      expandedKeys={expandedKeys}
      onTreeNodeExpand={setExpandedKeys}
      groupTreeOptions={value ? [{ label: value.title, value: value.key }] : []}
      selectedKeys={value ? [value.key] : []}
      treeClassName={style.tree}
      nodeTitleClassName={style.nodeTitle}
      treeShowLine={false}
      treeNodeShowCount={false}
      oneKeyExpand={null}
      serachGroupTree={null}
      setSearchValue={null}
    />
  );
}
