import { gql } from "@apollo/client";
import { Text } from "@zstack/design";
import List from "@zstack/virtualization-resource/src/pages/host/list";
import { Form, ModalSelect, Switch, ZSVForm } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import { HostQueryType, Op, VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  VmNic,
  Volume,
} from "@zstack/zsphere-types/graphql";
import { useDebounceFn, useMount } from "ahooks";
import type { FormInstance } from "antd/es/form";
import { flattenDeep, includes, filter } from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import TableInForm from "../components/table-in-form";
import { getMigrateAlertMessage } from "../utils";

const _migrateVm = gql`
  mutation migrateVm($input: MigrateVmInput!) {
    migrateVm(input: $input) {
      actionId
    }
  }
`;

const _localStorageMigrateVolume = gql`
  mutation localStorageMigrateVolume($input: LocalStorageMigrateVolumeInput!) {
    localStorageMigrateVolume(input: $input) {
      actionId
    }
  }
`;

const storageMigrateVmInstance = gql`
  mutation storageMigrateVmInstance($input: StorageMigrateVmInstanceInput!) {
    storageMigrateVmInstance(input: $input) {
      actionId
    }
  }
`;

interface IBatchActionWrapperProps<T, U extends Item = Item> extends Pick<
  IActionWrapperProps<T, U>,
  | "view"
  | "selectedList"
  | "originSelectedList"
  | "setSelectedList"
  | "refetch"
  | "source"
  | "position"
  | "setVisible"
  | "visible"
> {
  setOriginSelectedList?: (selectedList: any[]) => void;
  setOriginVisible?: (visible: boolean) => void;
}

const DEBOUNCE_DELAY = 800; // 声明 debounce 等待时间的常量
const STYLE_SELECT_320 = { width: 320 } as const;

interface FormItemObject {
  [key: string]: any;
}

const BatchChangeHost: React.FC<IBatchActionWrapperProps<IVM>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  setOriginSelectedList,
  source,
  setOriginVisible,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const doAction = useAction();
  const [form] = Form.useForm();
  const [batchConfigForm] = Form.useForm();
  const formRef = React.createRef<FormInstance>();
  const batchConfigFormRef = React.createRef<FormInstance>();
  const [dataInBatchTable, setDataInBatchTable] = useState<IVM[]>(selectedList);
  const [batchConfigModalVisible, setBatchConfigModalVisible] =
    useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(
    selectedList.map((t) => t.uuid),
  );

  const _allVolumes: Volume[][] = selectedList?.map(
    (t: IVM) => t.allVolumes as Volume[],
  );

  const allAreLocalStorageVolume: boolean = flattenDeep(_allVolumes)?.every(
    (volume) => volume?.primaryStorage?.type === "LocalStorage",
  );

  useEffect(() => {
    setDataInBatchTable(selectedList);
  }, [selectedList]);

  //关于批量过滤机制：

  // 批量Host的过滤机制
  const batchConfigHostQuery = useMemo(() => {
    const zoneUuid = dataInBatchTable?.[0]?.zoneUuid;
    const clusterUuid = source?.uuid;

    const conditions = [
      { key: "zoneUuid", value: zoneUuid },
      ...(source?.__typename === "Cluster"
        ? [{ key: "clusterUuid", value: clusterUuid }]
        : []),
      {
        key: "state",
        op: Op.notIn,
        values: ["Disabled", "Maintenance", "PreMaintenance"],
      },
      { key: "status", op: Op.in, values: ["Connected"] },
    ].filter((condition) => condition.value !== undefined);

    return {
      type: HostQueryType.Normal,
      conditions,
    };
  }, [dataInBatchTable, source]);

  const performAction = (vmHost: any) => {
    const {
      vmInstanceUuid,
      strategy,
      hostUuid,
      volumeUuid,
      vmState,
      primaryStorage,
    } = vmHost;

    let actionPayload;
    let actionName;
    let actionMutation;

    if (
      allAreLocalStorageVolume &&
      includes([VmInstanceState.Running, VmInstanceState.Stopped], vmState)
    ) {
      actionPayload = {
        vmInstanceUuid: vmInstanceUuid || "",
        dstPrimaryStorageUuid: primaryStorage?.uuid || "",
        dstHostUuid: hostUuid || "",
        strategy,
        withDataVolumes: true,
        withSnapshots: vmState === VmInstanceState.Stopped,
      };

      actionName = intl.formatMessage({
        id: "vm.migrate.action.title.change.host",
        defaultMessage: "Migrate VM: Change Host",
      });
      actionMutation = storageMigrateVmInstance;
    } else if (
      includes([VmInstanceState.Running, VmInstanceState.Paused], vmState)
    ) {
      actionPayload = {
        vmInstanceUuid: vmInstanceUuid || "",
        strategy,
        hostUuid,
      };
      actionName = intl.formatMessage({
        id: "vm.migrate.action.title.change.host",
        defaultMessage: "Migrate VM: Change Host",
      });
      actionMutation = _migrateVm;
    } else if (includes([VmInstanceState.Stopped], vmState)) {
      actionPayload = {
        volumeUuid: volumeUuid || "",
        destHostUuid: hostUuid,
      };
      actionName = intl.formatMessage({
        id: "vm.migrate.action.title.change.host",
        defaultMessage: "Migrate VM: Change Host",
      });
      actionMutation = _localStorageMigrateVolume;
    }

    if (!actionPayload || !actionMutation) {
      return;
    }

    doAction({
      mutation: actionMutation,
      payload: actionPayload,
      name: actionName,
      total: 1,
      middleState: {
        type: "VmInstance",
        field: "state",
        data: { state: VmInstanceState.Migrating },
        uuids: [vmInstanceUuid],
      },
      type: "VmInstance",
      onProgress: () => {},
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const onOk = (value: any) => {
    if (selectedRowKeys.length === 0) {
      setVisible(false);
      return;
    }
    const policy = value.autoconvergencePolicy;
    delete value.autoconvergencePolicy;

    const vmHostList = Object.keys(value).map((key) => {
      return {
        vmInstanceUuid: key.split("-")?.[1],
        destHostUuid: value[key]?.[0]?.uuid,
        hostUuid: value[key]?.[0]?.uuid,
        strategy: policy ? "auto-converge" : undefined,
        volumeUuid: selectedList.find((t) => t.uuid === key.split("-")?.[1])
          ?.rootVolumeUuid,
        vmState:
          selectedList.find((t) => t.uuid === key.split("-")?.[1])?.state ?? "",
        primaryStorage: selectedList.find((t) => t.uuid === key.split("-")?.[1])
          ?.primaryStorage,
      };
    });

    //过滤掉未选中的虚拟机
    const selectedVmList = filter(vmHostList, (vm) =>
      includes(selectedRowKeys, vm?.vmInstanceUuid),
    );

    try {
      selectedVmList.forEach(performAction);
    } catch {
      // 处理错误 todo
    }

    setOriginVisible?.(false);
    setOriginSelectedList?.([]);
  };

  const HostModalSelect = (
    vmStateFlag: boolean,
    zoneUuid: string,
    row: any,
  ) => {
    const hostQueryType = vmStateFlag
      ? HostQueryType.GetVmMigrationCandidateHosts
      : HostQueryType.LocalStorageGetVolumeMigratableHosts;

    const extraConditions = vmStateFlag
      ? [{ key: "vmInstanceUuid", op: Op.eq, value: row.uuid }]
      : [{ key: "volumeUuid", op: Op.eq, value: row?.rootVolumeUuid }];

    return (
      <Form.Item
        name={`tohost-${row.uuid}`}
        rules={[isRequired(IIsRequiredType.input)]}
      >
        <ModalSelect
          title={intl.formatMessage({ id: "host", defaultMessage: "Host" })}
          widthClassName="w-200"
        >
          <List
            view="select.vm.migration"
            defaultQuery={{
              type: hostQueryType,
              extraConditions,
              conditions: [
                { key: "zoneUuid", value: zoneUuid },
                {
                  key: "state",
                  op: Op.notIn,
                  values: ["Disabled", "Maintenance", "PreMaintenance"],
                },
                { key: "status", op: Op.in, values: ["Connected"] },
              ],
            }}
          />
        </ModalSelect>
      </Form.Item>
    );
  };

  const instanceColumns = [
    {
      title: intl.formatMessage({
        id: "migrate.modal.form.item.table.colume.instance.name",
        defaultMessage: "VM Name",
      }),
      key: "name",
      width: 120,
      render: (row: any) => <Text>{row.name}</Text>,
    },
    {
      title: intl.formatMessage({
        id: "migrate.modal.form.item.table.colume.pre.host",
        defaultMessage: "Host",
      }),
      key: "preHost",
      width: 120,
      render: (row: any) => (
        <Text>{row?.host?.name || row?.lastHost?.name}</Text>
      ),
    },
    {
      title: intl.formatMessage({
        id: "migrate.modal.form.item.table.colume.to.host",
        defaultMessage: "Destination Host",
      }),
      key: "toHost",
      width: 180,
      render: (row: any) => {
        const vmStateFlag = includes(
          [VmInstanceState.Running, VmInstanceState.Paused],
          row.state,
        );
        const zoneUuid = dataInBatchTable?.[0]?.zoneUuid || "";
        return HostModalSelect(vmStateFlag, zoneUuid, row);
      },
    },
  ];

  const { run: searchVM } = useDebounceFn(
    (inputVal) => {
      if (inputVal) {
        // 根据输入值筛选选中列表
        const result =
          selectedList.filter((t) => t.name.includes(inputVal)) || [];
        setDataInBatchTable(result as any);
      } else {
        setDataInBatchTable(selectedList); // 恢复原始数据列表
      }
    },
    {
      wait: DEBOUNCE_DELAY,
    },
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as any);
    },
  };

  useMount(() => {
    //挂载后只执行一次
    setSelectedRowKeys(dataInBatchTable.map((t) => t.uuid) as any);
  });

  return (
    <>
      <DialogForm
        title={intl.formatMessage({
          id: "vm.migrate.modal.title.change.host",
          defaultMessage: "Change Host",
        })}
        visible={visible}
        resourceName={`${String(dataInBatchTable?.length)}个对象`}
        alertMessage={getMigrateAlertMessage(intl, "batchMigrateHost", {
          hasSchedulingRule:
            selectedList.filter(
              (t: IVM) => (t?.vmGroup?.vmSchedulingRuleCount as number) > 0,
            )?.length > 0,
          hasAttachVF: selectedList
            .reduce(
              (acc, item) =>
                item?.vmNics ? [...acc, ...(item?.vmNics ?? [])] : acc,
              [] as VmNic[],
            )
            ?.some((it: VmNic) => it?.type === "VF"),
        })}
        alertType="warning"
        form={form}
        setVisible={setVisible}
        widthClassName="w-200"
        closable={true}
        onCancel={() => {
          setVisible(false);
          setOriginVisible?.(false);
          setOriginSelectedList?.(selectedList);
        }}
        onOk={onOk}
      >
        <Form form={form} name="image" ref={formRef}>
          <ZSVForm.Card
            title={intl.formatMessage({
              id: "virtualization.vm.change.host.form.config.card.title",
              defaultMessage: "Migration Configuration",
            })}
          >
            <TableInForm
              dataSource={dataInBatchTable}
              columns={instanceColumns}
              batchConfigDisable={selectedRowKeys.length === 0}
              setBatchConfigModalVisible={() =>
                setBatchConfigModalVisible(true)
              }
              inputSearch={searchVM}
              selectedRowKeys={selectedRowKeys}
              rowSelection={rowSelection}
            />
          </ZSVForm.Card>
          {selectedList.some((t: any) =>
            [VmInstanceState.Running, VmInstanceState.Paused].includes(t.state),
          ) && (
            <ZSVForm.Card
              title={intl.formatMessage({
                id: "virtualization.vm.change.host.form.advance.config.card.title",
                defaultMessage: "Advanced Settings",
              })}
            >
              <Form.Item
                name="autoconvergencePolicy"
                label={intl.formatMessage({
                  id: "autoconvergencePolicy",
                  defaultMessage: "Auto-Converge",
                })}
                icon="info"
                iconTooltip={{
                  title: (
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "autoConverge.tooltip",
                        defaultMessage: `### Auto-Converge

1. Allows you to enable or disable auto-converge when you hot migrate a KVM VM.

2. If the migration is blocked because the VM has been high-loaded for a long time, you can enable auto-converge to improve the success rate of the migration.

3. If your applications are performance-sensitive, we recommend that you disable auto-converge.`,
                      })}
                    </ReactMarkdown>
                  ),
                }}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </ZSVForm.Card>
          )}
        </Form>
      </DialogForm>

      <DialogForm
        title={intl.formatMessage({
          id: "vm.migrate.modal.title.change.host.batch.select.host.title",
          defaultMessage: "Batch Configuration",
        })}
        visible={batchConfigModalVisible}
        form={batchConfigForm}
        setVisible={setBatchConfigModalVisible}
        widthClassName="w-150"
        closable={true}
        onCancel={() => setBatchConfigModalVisible(false)}
        onOk={() => {
          const batchHost = batchConfigForm.getFieldValue("batchToHost");
          if (batchHost) {
            const obj: FormItemObject = {};
            selectedRowKeys.forEach((t: string) => {
              const formItemName = `tohost-${t}`;
              obj[formItemName] = batchHost as any;
            });
            //主体的setFields
            form.setFieldsValue(obj);
          }
        }}
      >
        <Form form={batchConfigForm} name="image" ref={batchConfigFormRef}>
          <Form.Item
            name="batchToHost"
            label={intl.formatMessage({
              id: "aim.host",
              defaultMessage: "Destination Host",
            })}
            rules={[isRequired(IIsRequiredType.input)]}
          >
            <ModalSelect
              title={intl.formatMessage({ id: "host", defaultMessage: "Host" })}
              style={STYLE_SELECT_320}
            >
              <List
                view="select.vm.migration"
                defaultQuery={batchConfigHostQuery}
              />
            </ModalSelect>
          </Form.Item>
        </Form>
      </DialogForm>
    </>
  );
};

export default BatchChangeHost;
