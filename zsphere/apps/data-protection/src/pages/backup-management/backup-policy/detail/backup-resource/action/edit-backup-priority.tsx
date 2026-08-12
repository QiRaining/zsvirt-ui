import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormItem,
  FormLabel,
  Select,
  Text,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { Icon } from "@zstack/icon";
import { Input } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import { Table } from "antd";
import type { ColumnType } from "antd/es/table";
import { fromPairs, intersectionWith } from "lodash-es";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { priorityValueMap } from "zsv_data_protection_shared/backup-management/backup-policy/mf-index";

import {
  createEditBackupPrioritySchema,
  type EditBackupPriorityFormValues,
} from "./schema";

import style from "./style.module.less";

const updateSchedulerJobGroup = gql`
  mutation updateSchedulerJobGroup($input: UpdateSchedulerJobGroupInput!) {
    updateSchedulerJobGroup(input: $input) {
      actionId
    }
  }
`;

export default function EditBackupPriority({
  visible,
  setVisible,
  selectedList,
  source,
}: IActionWrapperProps<VmInstance>) {
  const intl = useIntl();
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "backup.policy.edit.priority.title",
    defaultMessage: "Modify Priority",
  });

  const priorities = useMemo(() => {
    const result: EditBackupPriorityFormValues["priorities"] = {};
    selectedList.forEach((vm) => {
      if (vm.rootVolumeUuid) {
        const value =
          vm.backupJob?.schedulerJobGroupJobRefs?.find(
            (ref) =>
              !!source?.uuid && ref.schedulerJobGroupUuid === source.uuid,
          )?.priority ?? 0;
        result[vm.rootVolumeUuid] = value < 0 ? "high" : "normal";
      }
    });
    return result;
  }, [selectedList, source?.uuid]);

  const formSchema = useMemo(() => createEditBackupPrioritySchema(), []);
  const form = useForm<EditBackupPriorityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { priorities },
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, { priorities });

  const handleModalVisible = usePersistFn(() => {
    form.reset({ priorities });
  });

  useEffect(() => {
    if (visible) {
      handleModalVisible();
    }
  }, [visible, handleModalVisible]);

  const handleSubmit = useCallback(
    (data: EditBackupPriorityFormValues) => {
      const payload = {
        uuid: source?.uuid ?? "",
        priorities: Object.entries(data.priorities).map(
          ([rootVolumeUuid, value]) => ({
            rootVolumeUuid,
            priority: priorityValueMap[value],
          }),
        ),
      };

      doAction({
        mutation: updateSchedulerJobGroup,
        payload: [payload],
        name: title,
        total: 1,
        type: "SchedulerJobGroup",
      });
    },
    [doAction, source?.uuid, title],
  );

  const resourceName =
    selectedList.length > 1
      ? intl.formatMessage(
          { id: "object.count", defaultMessage: "{num} objects" },
          { num: selectedList.length },
        )
      : selectedList[0]?.name;

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={handleSubmit}
      title={title}
      resourceName={resourceName}
    >
      <Form {...form}>
        {selectedList.length > 1 ? (
          <BatchEdit form={form} selectedList={selectedList} />
        ) : (
          <Controller
            control={form.control}
            name={`priorities.${selectedList[0]?.rootVolumeUuid ?? ""}`}
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel className="mt-[5px] flex">
                  {intl.formatMessage({
                    id: "priority",
                    defaultMessage: "Priority",
                  })}
                </FormLabel>
                <FormControl>
                  <Select
                    className="width-320"
                    options={getPriorityOptions(intl)}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </Form>
    </DialogForm>
  );
}

interface IBatchEditProps {
  form: UseFormReturn<EditBackupPriorityFormValues>;
  selectedList: VmInstance[];
}

function BatchEdit({ form, selectedList }: IBatchEditProps) {
  const intl = useIntl();
  const [keys, setKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);

  const dataSource = useMemo(() => {
    const searchLowerCase = search.toLowerCase();
    return selectedList.filter((vm) =>
      vm.name.toLowerCase().includes(searchLowerCase),
    );
  }, [selectedList, search]);

  const intersectionKeys = useMemo(() => {
    return intersectionWith(
      keys,
      dataSource,
      (key, vm) => vm.rootVolumeUuid === key,
    );
  }, [dataSource, keys]);

  const columns = useMemo<ColumnType<VmInstance>[]>(
    () => [
      {
        key: "name",
        title: intl.formatMessage({
          id: "vm.name",
          defaultMessage: "VM Name",
        }),
        render: (current) => <Text>{current.name}</Text>,
      },
      {
        key: "priority",
        title: intl.formatMessage({
          id: "priority",
          defaultMessage: "Priority",
        }),
        render: (current) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Controller
              control={form.control}
              name={`priorities.${current.rootVolumeUuid}`}
              render={({ field }) => (
                <Select
                  style={{ width: "100%" }}
                  options={getPriorityOptions(intl)}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        ),
      },
    ],
    [form.control, intl],
  );

  return (
    <>
      <div className={style.toolbar}>
        <Button
          onClick={() => setVisible((prev) => !prev)}
          className={style.expand}
          icon={
            visible ? (
              <Icon className={style.icon} type="menu-up" />
            ) : (
              <Icon className={style.icon} type="menu-down" />
            )
          }
          variant="link"
        >
          {visible
            ? intl.formatMessage({
                id: "view.all.options",
                defaultMessage: "Collapse All",
              })
            : intl.formatMessage({
                id: "view.all.options",
                defaultMessage: "Collapse All",
              })}
        </Button>
        {visible && (
          <Input
            className={style.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            placeholder={intl.formatMessage({
              id: "search.vm.name",
              defaultMessage: "Search by VM name",
            })}
          />
        )}
      </div>

      {visible && (
        <div className={style.tableWrapper}>
          <Table
            rowKey={(record) => record.rootVolumeUuid}
            columns={columns}
            dataSource={dataSource}
            rowSelection={{
              preserveSelectedRowKeys: true,
              selectedRowKeys: intersectionKeys,
              onChange: (selectedRowKeys) => setKeys(selectedRowKeys),
            }}
            pagination={false}
          />
        </div>
      )}

      {visible ? (
        <Controller
          control={form.control}
          name="priorities.batch"
          render={({ field }) => (
            <Select
              className="width-320"
              placeholder={intl.formatMessage({
                id: "priority.batch.edit",
                defaultMessage: "Set Priority in Bulk",
              })}
              options={getPriorityOptions(intl)}
              value={field.value}
              onValueChange={(value) => {
                const dataMap = fromPairs(
                  intersectionKeys.map((item) => [item, value]),
                );
                field.onChange(value);
                form.setValue(
                  "priorities",
                  {
                    ...form.getValues("priorities"),
                    ...dataMap,
                    batch: value,
                  },
                  { shouldDirty: true, shouldValidate: true },
                );
              }}
            />
          )}
        />
      ) : null}
    </>
  );
}

function getPriorityOptions(intl: ReturnType<typeof useIntl>) {
  return [
    {
      label: intl.formatMessage({
        id: "normal",
        defaultMessage: "Normal",
      }),
      value: "normal",
    },
    {
      label: intl.formatMessage({ id: "high", defaultMessage: "High" }),
      value: "high",
    },
  ];
}
