import { gql } from "@apollo/client";
import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form, Select, Input } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import type { FormInstance } from "antd";
import { Table } from "antd";
import type { ColumnType } from "antd/es/table";
import { fromPairs, intersectionWith } from "lodash-es";
import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const priorityValueMap: Record<string, number> = {
  normal: 0,
  high: -1,
};

const updateSchedulerJobGroup = gql`
  mutation updateSchedulerJobGroup($input: UpdateSchedulerJobGroupInput!) {
    updateSchedulerJobGroup(input: $input) {
      actionId
    }
  }
`;

const STYLE_SELECT_100PCT = { width: "100%" } as const;

export default function EditBackupPriority({
  visible,
  setVisible,
  selectedList,
  source,
}: IActionWrapperProps<VmInstance>) {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "backup.policy.edit.priority.title",
    defaultMessage: "Modify Priority",
  });

  const priorities = useMemo(() => {
    const result: Record<string, string> = {};
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

  const handleModalVisible = usePersistFn(() => {
    form.resetFields();
    form.setFieldsValue({ priorities });
  });

  useEffect(() => {
    if (visible) {
      handleModalVisible();
    }
  }, [visible, handleModalVisible]);

  const handleSubmit = useCallback(() => {
    // @ts-expect-error 获取全部字段
    const data = form.getFieldValue();
    const payload = {
      uuid: source?.uuid ?? "",
      priorities: Object.entries(data.priorities).map(
        ([rootVolumeUuid, value]) => ({
          rootVolumeUuid,
          priority: priorityValueMap[value as string],
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
  }, [doAction, form, source?.uuid, title]);

  const resourceName =
    selectedList.length > 1
      ? intl.formatMessage(
          { id: "object.count", defaultMessage: "{num} objects" },
          { num: selectedList.length },
        )
      : selectedList[0]?.name;

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={handleSubmit}
      title={title}
      resourceName={resourceName}
    >
      <Form form={form}>
        {selectedList.length > 1 ? (
          <BatchEdit form={form} selectedList={selectedList} />
        ) : (
          <Form.Item
            name={["priorities", selectedList[0]?.rootVolumeUuid ?? ""]}
            label={intl.formatMessage({
              id: "priority",
              defaultMessage: "Priority",
            })}
          >
            <Select
              className="width-320"
              options={[
                {
                  label: intl.formatMessage({
                    id: "normal",
                    defaultMessage: "Normal",
                  }),
                  value: "normal",
                },
                {
                  label: intl.formatMessage({
                    id: "high",
                    defaultMessage: "High",
                  }),
                  value: "high",
                },
              ]}
            />
          </Form.Item>
        )}
      </Form>
    </DialogForm>
  );
}

interface IBatchEditProps {
  form: FormInstance;
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
            <Form.Item noStyle name={["priorities", current.rootVolumeUuid]}>
              <Select
                style={STYLE_SELECT_100PCT}
                options={[
                  {
                    label: intl.formatMessage({
                      id: "normal",
                      defaultMessage: "Normal",
                    }),
                    value: "normal",
                  },
                  {
                    label: intl.formatMessage({
                      id: "high",
                      defaultMessage: "High",
                    }),
                    value: "high",
                  },
                ]}
              />
            </Form.Item>
          </div>
        ),
      },
    ],
    [intl],
  );

  return (
    <>
      <div className={style.toolbar}>
        <Button
          icon={<Icon type="edit" />}
          disabled={intersectionKeys.length < 2}
          onClick={() => setVisible(true)}
        >
          {intl.formatMessage({
            id: "batch.config",
            defaultMessage: "Batch Configuration",
          })}
        </Button>
        <Input
          className="width-320"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={intl.formatMessage({
            id: "search.vm.name",
            defaultMessage: "Search by VM name",
          })}
          suffix={<Icon type="search" />}
          allowClear
        />
      </div>
      <Table
        className="zsv-table zsv-table-height-320"
        tableLayout="fixed"
        rowKey="rootVolumeUuid"
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        rowSelection={{
          selectedRowKeys: keys,
          onChange: setKeys,
          columnWidth: 40,
        }}
        onRow={(vm) => ({
          onClick: () => {
            const keyIndex = keys.indexOf(vm.rootVolumeUuid!);
            if (keyIndex !== -1) {
              setKeys(keys.filter((_, index) => index !== keyIndex));
            } else {
              setKeys([...keys, vm.rootVolumeUuid!]);
            }
          },
        })}
      />
      <BatchModal
        visible={visible}
        setVisible={setVisible}
        count={intersectionKeys.length}
        onOk={(value) =>
          form.setFieldsValue({
            priorities: fromPairs(intersectionKeys.map((key) => [key, value])),
          })
        }
      />
    </>
  );
}

interface IBatchModalProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  onOk: (value: string) => void;
  count: number;
}

function BatchModal({ visible, setVisible, onOk, count }: IBatchModalProps) {
  const intl = useIntl();
  const [form] = Form.useForm();

  const title = intl.formatMessage({
    id: "batch.config",
    defaultMessage: "Batch Configuration",
  });
  const resourceName = intl.formatMessage(
    { id: "object.count", defaultMessage: "{num} objects" },
    { num: count },
  );

  const handleSubmit = (data: any) => onOk(data.priority);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ priority: "normal" });
    }
  }, [visible, form]);

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={handleSubmit}
      title={title}
      resourceName={resourceName}
    >
      <Form form={form}>
        <Form.Item
          name="priority"
          label={intl.formatMessage({
            id: "priority",
            defaultMessage: "Priority",
          })}
        >
          <Select
            className="width-320"
            options={[
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
            ]}
          />
        </Form.Item>
      </Form>
    </DialogForm>
  );
}
