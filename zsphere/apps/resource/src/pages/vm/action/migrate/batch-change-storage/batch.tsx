import { gql, useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { Checkbox } from "@zstack/design";
import CephPoolList from "@zstack/virtualization-resource/src/pages/ceph-primary-storage-pool/list";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import { Form, Input, ModalSelect, ZSVForm } from "@zstack/zsphere-components";
import { DialogWeakP1, DialogForm } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import {
  Op,
  PrimaryStorageQueryType,
  VmInstanceState,
} from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  StorageMigratePayload,
  VmNic,
} from "@zstack/zsphere-types/graphql";
import { formatConditions, isIn, parseNumber } from "@zstack/zsphere-utils";
import { useDebounceFn, useMount } from "ahooks";
import type { FormInstance } from "antd/es/form";
import { some, get, uniq, without, filter, includes, map } from "lodash-es";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import ClearOriginDataField from "../components/ClearOriginDataField";
import TableInForm from "../components/table-in-form";
import { getMigrateAlertMessage } from "../utils";

import style from "./style.module.less";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

/**
 * 多个vm，默认能到这一步的都是可以迁移storage的vm
 * vm回显处理
 * 批量修改服务
 */

const GET_VM_SNAPSHOT_COUNT = gql`
  query getVMSnapshoCount($conditions: [Condition!]) {
    volumeSnapshotList(conditions: $conditions) {
      total
    }
  }
`;

const { apolloClient } = window.g_main;

const MIGRATE_DISK_DESCRIPTION_STYLE = { marginTop: -5 } as const;
const INPUT_BANDWIDTH_STYLE = { width: 160, marginRight: 4 } as const;
const WIDTH_320_STYLE = { width: 320 } as const;

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

const storageMigrateVmInstance = gql`
  mutation storageMigrateVmInstance($input: StorageMigrateVmInstanceInput!) {
    storageMigrateVmInstance(input: $input) {
      actionId
    }
  }
`;

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
  setOriginVisible,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const doAction = useAction();
  const [form] = Form.useForm();
  const [batchConfigForm] = Form.useForm();
  const formRef = React.createRef<FormInstance>();
  const batchConfigFormRef = React.createRef<FormInstance>();
  const [haveSnaphsotVisible, setHaveSnaphsotVisible] =
    useState<boolean>(false);
  // ZSV-11709: 缓存 DialogForm 校验后的表单值，避免 DialogForm onOk 完成后调用
  // form.resetFields() 清空表单，导致快照确认弹框点确定时 toStorage 等字段全部为 undefined，
  // 进而 dstPrimaryStorageUuid 为 undefined，最终 API 未真正调用。
  const [pendingSubmitValues, setPendingSubmitValues] = useState<any>(null);
  const [invalidStorages, setInvalidStorages] = useState<string[]>([]);
  const [dataInBatchTable, setDataInBatchTable] = useState(selectedList);
  const [batchConfigModalVisible, setBatchConfigModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    setDataInBatchTable(selectedList);
  }, [selectedList]);

  const [getSnapshoCount, { data: currentVmSnapshotList = {} }] = useLazyQuery(
    GET_VM_SNAPSHOT_COUNT,
  );

  const currentVmSnapShotCount = useMemo(() => {
    return currentVmSnapshotList?.volumeSnapshotList?.total;
  }, [currentVmSnapshotList?.volumeSnapshotList?.total]);

  useEffect(() => {
    if (visible && selectedList.length > 0) {
      getSnapshoCount({
        variables: {
          conditions: [
            {
              key: "volumeUuid",
              op: Op.in,
              values: selectedList.map((t) => t.rootVolumeUuid),
            },
          ],
        },
      });
    }
  }, [visible, selectedList]);

  const validBand = () => {
    return {
      validateTrigger: "onChange",
      validator(rules: any, value: string) {
        const range = {
          maxValue: 1024 * 1024 * 1024 * 100,
          minValue: 1024 * 1024,
        };

        const _v = parseNumber(Number(value), "MB/s");

        if (value && !isIn(_v, range.minValue, range.maxValue)) {
          return Promise.reject(
            intl.formatMessage({
              id: "volume.field.readingAndWritingSpeed.validator.format",
              defaultMessage: "The speed must be an integer between 1 MB/s and 100 GB/s.",
            }),
          );
        }

        return Promise.resolve();
      },
    };
  };

  const validPrimaryStorageTrash = async (
    row: IVM,
    psUuid: string,
    psName: string,
  ) => {
    const { data: trash } = await apolloClient.query({
      query: gql`
        query getTrashOnPrimaryStorage($uuid: String!) {
          getTrashOnPrimaryStorage(uuid: $uuid) {
            list {
              resourceUuid
              resourceType
              trashType
            }
          }
        }
      `,
      variables: {
        uuid: psUuid,
      },
      fetchPolicy: "no-cache",
    });

    const list = trash?.getTrashOnPrimaryStorage?.list || [];

    if (
      some(list, (it) => it.resourceUuid === get(row, "rootVolumeUuid", ""))
    ) {
      setInvalidStorages((prev) => uniq([...prev, psName]));
      return;
    }
    setInvalidStorages((prev) => without(prev, psName));
  };

  useEffect(() => {
    if (invalidStorages.length > 0) {
      const storageNames = invalidStorages.join("、");
      form.setFieldsValue({
        primaryStorageTrashWarning: intl.formatMessage(
          {
            id: "vm.migrate.batch.change.storage.validator.clearOriginData.alert.message",
            defaultMessage:
              'The destination data storage {primaryStorages} contain raw data retained due to cross-storage migration. You can clean up these data on the Data Cleanup tab of the data storage details page.',
          },
          {
            primaryStorages: storageNames,
          },
        ),
      });
    } else {
      form.setFieldsValue({
        primaryStorageTrashWarning: "",
      });
    }
  }, [invalidStorages, form, intl]);

  const instanceColumns = [
    {
      title: intl.formatMessage({
        id: "migrate.modal.form.item.table.colume.instance.name",
        defaultMessage: "VM Name",
      }),
      key: "name",
      width: 180,
      render: (row: any) => {
        return <Text>{row?.name}</Text>;
      },
    },
    {
      title: intl.formatMessage({
        id: "migrate.modal.form.item.table.colume.pre.data.storage",
        defaultMessage: "Source Data Storage",
      }),
      key: "preDataStorage",
      width: 180,

      render: (row: any) => {
        return <Text>{row?.primaryStorage?.name}</Text>;
      },
    },
    {
      title: intl.formatMessage({
        id: "migrate.modal.form.item.table.colume.to.storage",
        defaultMessage: "Destination Data Storage",
      }),
      key: "toStorage",
      width: 236,
      render: (row: any) => {
        return (
          <Form.Item
            name={`toStorage-${row.uuid}`}
            rules={[
              isRequired(IIsRequiredType.input),
              {
                validator(__, value) {
                  if (!value?.[0]?.uuid) {
                    return Promise.reject();
                  }
                  return validPrimaryStorageTrash(
                    row,
                    value[0].uuid,
                    value[0].name,
                  );
                },
              },
            ]}
          >
            <ModalSelect
              title={intl.formatMessage({
                id: "data.storage",
                defaultMessage: "Data Storage",
              })}
              widthClassName="w-200"
            >
              <PrimaryStorageList
                view="select"
                defaultQuery={{
                  // ，支持迁移：sblk -> sblk，sblk -> ceph, ceph -> sblk， 不支持迁移：ceph-> ceph
                  conditions: [
                    {
                      key: "type",
                      op: Op.in,
                      values:
                        row?.primaryStorage?.type === "SharedBlock"
                          ? ["SharedBlock", "Ceph"]
                          : ["SharedBlock"],
                    },
                    {
                      key: "status",
                      op: Op.eq,
                      value: "Connected",
                    },
                  ],
                  type: PrimaryStorageQueryType.StorageMigrateVm,
                  extraConditions: [
                    {
                      key: "vmInstanceUuid",
                      op: Op.eq,
                      value: row?.uuid,
                    },
                    {
                      key: "migrateStorageOnly",
                      op: Op.eq,
                      value: "true",
                    },
                  ],
                }}
              />
            </ModalSelect>
          </Form.Item>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: "migrate.modal.form.item.table.colume.disk.storage.pool",
        defaultMessage: "Disk 1 Storage Pool",
      }),
      key: "toStoragePool",
      width: 236,
      render: (row: any) => {
        return (
          <Form.Item
            noStyle
            shouldUpdate={(pre, cur) =>
              pre[`toStorage-${row.uuid}`] !== cur[`toStorage-${row.uuid}`] ||
              pre[`toStoragePool-${row.uuid}`] !==
                cur[`toStoragePool-${row.uuid}`]
            }
          >
            {() => {
              const toStorageFlag = form.getFieldValue(`toStorage-${row.uuid}`);
              return toStorageFlag?.[0]?.type === "Ceph" ? (
                <Form.Item
                  name={`toStoragePool-${row.uuid}`}
                  //     rules={[isRequired(IIsRequiredType.input)]}
                >
                  <ModalSelect
                    transformKey="poolName"
                    title={intl.formatMessage({
                      id: "virtualization.select.target.primary.storage",
                      defaultMessage: "Select Destination Data Storage",
                    })}
                    widthClassName="w-200"
                    autoDispatch={true}
                  >
                    <CephPoolList
                      view="select"
                      defaultQuery={{
                        conditions: formatConditions({
                          primaryStorageUuid: toStorageFlag?.[0]?.uuid,
                          type: "Root",
                        }),
                      }}
                    />
                  </ModalSelect>
                </Form.Item>
              ) : (
                "-"
              );
            }}
          </Form.Item>
        );
      },
    },
  ];

  //操作部分
  const onOk = (value: any) => {
    if (selectedRowKeys.length === 0) {
      setVisible(false);
      return;
    }

    const isWithDataVolumes = value.migrateDisk;
    const bandwidth = value.bandWidth;
    delete value.migrateDisk;
    delete value.bandWidth;

    const selectedVmList = filter(selectedList, (vm: IVM) =>
      includes(selectedRowKeys, vm?.uuid),
    );

    const payloadList: StorageMigratePayload[] = selectedVmList.map((vm) => {
      const systemTags: string[] = [];
      const storage = value[`toStorage-${vm?.uuid}`] ?? [];
      const storagePool = value[`toStoragePool-${vm?.uuid}`] ?? [];

      if (storage?.length > 0 && storage?.[0]?.type === "Ceph") {
        if (storagePool?.length > 0) {
          systemTags.push(`ceph::rootPoolName::${storagePool?.[0]?.poolName}`);
        }

        // 数据盘和根盘 pool强绑定
        if (isWithDataVolumes && storagePool?.length > 0) {
          systemTags.push(`ceph::pool::${storagePool?.[0]?.poolName}`);
        }
      }

      return {
        vmInstanceUuid: vm?.uuid,
        //
        dstHostUuid: vm?.hostUuid,
        dstPrimaryStorageUuid: storage?.[0]?.uuid,
        //systemTag 与Pool有关
        //固定参数
        withDataVolumes: isWithDataVolumes,
        withSnapshots: vm?.state !== VmInstanceState.Running,
        bandwidth: Number(bandwidth),
        systemTags,
      };
    });

    try {
      const _doAction = (payload: StorageMigratePayload) => {
        doAction({
          mutation: storageMigrateVmInstance,
          payload,
          name: intl.formatMessage({
            id: "vm.migrate.action.title.change.storage",
            defaultMessage: "Migration: Change Data Storage",
          }),
          total: 1,
          middleState: {
            type: "VmInstance",
            field: "state",
            data: { state: VmInstanceState.Migrating },
            uuids: [payload.vmInstanceUuid],
          },
          type: "VmInstance",
          onProgress: () => {},
          onFinish: () => {
            refetch?.();
            setSelectedList?.([]);
          },
        });
      };

      map(payloadList, (payload) => _doAction(payload as any));
    } catch {
      //todo
    }

    setOriginVisible?.(false);
    setOriginSelectedList?.([]);
  };

  // const onDeleteItem = (e: any) => {
  //   const result = dataInBatchTable.filter(t => t.uuid !== e.uuid) ?? []
  //   //还需要把form中的对应项干掉

  //   form.setFieldsValue({
  //     [`toStorage-${e.uuid}`]: null,
  //     [`toStoragePool-${e.uuid}`]: null
  //   })

  //   setSelectedList?.(result)
  // }

  const { run: serachVM } = useDebounceFn(
    (inputVal) => {
      if (inputVal) {
        const result =
          selectedList.filter((t) => t.name.indexOf(inputVal) !== -1) ?? [];
        setDataInBatchTable(result as any);
      } else {
        setDataInBatchTable(selectedList);
      }
    },
    {
      wait: 800,
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

  const migrateDataVolumeFlag =
    selectedList.filter((t: IVM) => t?.allVolumes && t?.allVolumes?.length > 1)
      ?.length > 0;

  return (
    <>
      <DialogForm
        title={intl.formatMessage({
          id: "vm.migrate.modal.title.change.data.storage",
          defaultMessage: "Data storage modification",
        })}
        visible={visible}
        alertType="warning"
        alertMessage={getMigrateAlertMessage(intl, "batchMigrateDataStorage", {
          hasAttachVF: selectedList
            .reduce(
              (acc, item) =>
                item?.vmNics ? [...acc, ...(item?.vmNics ?? [])] : acc,
              [] as VmNic[],
            )
            ?.some((it: VmNic) => it?.type === "VF"),
          snapshotCount: currentVmSnapShotCount,
        })}
        resourceName={`${String(dataInBatchTable?.length)}个对象`}
        form={form}
        setVisible={setVisible}
        widthClassName="w-250"
        closable={true}
        onCancel={() => {
          setVisible(false);
          setOriginVisible?.(false);
          setOriginSelectedList?.(selectedList);
          setInvalidStorages([]);
        }}
        onOk={
          currentVmSnapShotCount > 0
            ? (formValues: any) => {
                // ZSV-11709: 当虚拟机存在快照时，需要先弹出快照确认框。
                // 必须保存 DialogForm 校验后的 values，否则后续 DialogForm 内部
                // resetFields() 会清空表单，导致快照确认后 onOk 收到空对象。
                setPendingSubmitValues(formValues);
                setHaveSnaphsotVisible(true);
              }
            : onOk
        }
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
              inputSearch={serachVM}
              selectedRowKeys={selectedRowKeys}
              rowSelection={rowSelection}
            />
            <Form.Item noStyle name="primaryStorageTrashWarning">
              <ClearOriginDataField />
            </Form.Item>
          </ZSVForm.Card>
          <ZSVForm.Card
            title={intl.formatMessage({
              id: "virtualization.vm.change.host.form.advance.config.card.title",
              defaultMessage: "Advanced Settings",
            })}
          >
            {migrateDataVolumeFlag && (
              <Form.Item
                name="migrateDisk"
                label={intl.formatMessage({
                  id: "migrate.disk",
                  defaultMessage: "Migrate Data Disk",
                })}
                valuePropName="checked"
                description={
                  <div style={MIGRATE_DISK_DESCRIPTION_STYLE}>
                    {intl.formatMessage({
                      id: "migrate.data.disk.checkbox.description",
                      defaultMessage:
                        "when the destination data storage is ZCE distributed storage, all data disks will be migrated to the storage pool where disk 1 resides.",
                    })}
                  </div>
                }
              >
                <FormCheckbox
                  label={intl.formatMessage({
                    id: "migrate.data.disk.checkbox.content",
                    defaultMessage: "Migrate all attached disks on the VM",
                  })}
                />
              </Form.Item>
            )}

            {includes(
              selectedList.map((t) => t.state),
              VmInstanceState.Running,
            ) && (
              <Form.Item noStyle>
                <div className={style.flex}>
                  <Form.Item
                    name="bandWidth"
                    label={intl.formatMessage({
                      id: "migrate.bandWidth",
                      defaultMessage: "Migration Bandwidth",
                    })}
                    icon="info"
                    iconTooltip={{
                      title: (
                        <ReactMarkdown>
                          {intl.formatMessage({
                            id: "migrate.storage.host.bandWidth.tooltip",
                            defaultMessage: `### Migration Bandwidth

Specify the data transmission rate in a VM storage migration. Default: Unlimited.

1. The platform limits the maximum I/O read rate of the  entire virtual machine in the source data storage.
2. Set a reasonale migration bandwidth according to the actual business requirements and network storage conditions to aviod affecting normal business operations.`,
                          })}
                        </ReactMarkdown>
                      ),
                    }}
                    rules={[
                      {
                        validator(rules, value) {
                          if (!value || value.trim() === "") {
                            return Promise.resolve();
                          }
                          const reg = new RegExp(/^[0-9]*$/);
                          if (reg.test(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              intl.formatMessage({
                                id: "secretServer.create.field.keyNumSM2.validate.format",
                                defaultMessage: "Digits only.",
                              }),
                            ),
                          );
                        },
                      },
                      validBand,
                    ]}
                  >
                    <Input
                      style={INPUT_BANDWIDTH_STYLE}
                      placeholder={intl.formatMessage({
                        id: "unlimited",
                        defaultMessage: "Unlimited",
                      })}
                    />
                  </Form.Item>
                  <span>MB/s</span>
                </div>
              </Form.Item>
            )}
          </ZSVForm.Card>
        </Form>
      </DialogForm>
      {/* 批量配置modal */}
      <DialogForm
        title={intl.formatMessage({
          id: "vm.migrate.modal.title.change.storage.batch.select.storage.title",
          defaultMessage: "Batch Configuration",
        })}
        visible={batchConfigModalVisible}
        form={batchConfigForm}
        setVisible={setBatchConfigModalVisible}
        widthClassName="w-150"
        closable={true}
        onCancel={() => setBatchConfigModalVisible(false)}
        onOk={() => {
          const batchStorage = batchConfigForm.getFieldValue("batchToStorage");
          const batchStoragePool =
            batchConfigForm.getFieldValue("batchStoragePool");

          const obj: FormItemObject = {};
          if (batchStorage) {
            selectedRowKeys.forEach((t: string) => {
              const toStorageformItem = `toStorage-${t}`;
              obj[toStorageformItem] = batchStorage as any;
            });
          }
          if (batchStoragePool) {
            selectedRowKeys.forEach((t: string) => {
              const toStoragePoolformItem = `toStoragePool-${t}`;
              obj[toStoragePoolformItem] = batchStoragePool as any;
            });
          }
          form.setFieldsValue(obj);
        }}
      >
        <Form form={batchConfigForm} name="image" ref={batchConfigFormRef}>
          <Form.Item
            name="batchToStorage"
            label={intl.formatMessage({
              id: "aim.dataStorage",
              defaultMessage: "Destination Data Storage",
            })}
            rules={[isRequired(IIsRequiredType.input)]}
          >
            <ModalSelect
              style={WIDTH_320_STYLE}
              title={intl.formatMessage({
                id: "aim.dataStorage",
                defaultMessage: "Destination Data Storage",
              })}
            >
              <PrimaryStorageList
                view="select"
                defaultQuery={{
                  // ，支持迁移：sblk -> sblk，sblk -> ceph, ceph -> sblk， 不支持迁移：ceph-> ceph
                  conditions: [
                    // {
                    //   key: 'type',
                    //   op: Op.in,
                    //   values:
                    //     selectedList?.[0]?.primaryStorage?.type === 'SharedBlock'
                    //       ? ['SharedBlock', 'Ceph']
                    //       : ['SharedBlock']
                    // },
                    {
                      key: "status",
                      op: Op.eq,
                      value: "Connected",
                    },
                  ],
                  // type: PrimaryStorageQueryType.StorageMigrateVm
                  // extraConditions: [
                  //   {
                  //     key: 'vmInstanceUuid',
                  //     op: Op.eq,
                  //     value: vm.uuid
                  //   },
                  //   {
                  //     key: 'withDataVolumes',
                  //     op: Op.eq,
                  //     value: `${withDataVolumes}`
                  //   },
                  //   {
                  //     key: 'migrateStorageOnly',
                  //     op: Op.eq,
                  //     value: 'true'
                  //   }
                  // ]
                }}
              />
            </ModalSelect>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(pre, cur) =>
              pre.batchToStorage !== cur.batchToStorage
            }
          >
            {() => {
              const batchToStorage =
                batchConfigForm.getFieldValue("batchToStorage");
              return (
                batchToStorage?.[0]?.type === "Ceph" && (
                  <Form.Item
                    name="batchStoragePool"
                    label={intl.formatMessage({
                      id: "rootDisk.storage.pool",
                      defaultMessage: "Disk 1 Storage Pool",
                    })}
                    // rules={[isRequired(IIsRequiredType.input)]}
                  >
                    <ModalSelect
                      title={intl.formatMessage({
                        id: "rootDisk.storage.pool",
                        defaultMessage: "Disk 1 Storage Pool",
                      })}
                      transformKey="poolName"
                      style={WIDTH_320_STYLE}
                      autoDispatch={true}
                    >
                      <CephPoolList
                        view="select"
                        defaultQuery={{
                          conditions: formatConditions({
                            //   primaryStorageUuid: primaryStorage?.uuid,
                            type: "Root",
                          }),
                        }}
                      />
                    </ModalSelect>
                  </Form.Item>
                )
              );
            }}
          </Form.Item>
        </Form>
      </DialogForm>
      <DialogWeakP1
        title={intl.formatMessage({
          id: "vm.storage.migrate.extra.delele.snapshot.modal.title",
          defaultMessage: "Delete Snapshot?",
        })}
        type="warning"
        onConfirm={() => {
          setHaveSnaphsotVisible(false);
          // ZSV-11709: 使用 DialogForm 校验通过时缓存的 values，避免 form 已被
          // DialogForm.handleOk 内部 resetFields() 清空导致字段丢失。
          if (pendingSubmitValues) {
            onOk(pendingSubmitValues);
            setPendingSubmitValues(null);
          }
        }}
        visible={haveSnaphsotVisible}
        setVisible={setHaveSnaphsotVisible}
        description={intl.formatMessage(
          {
            id: "vm.modal.storageMigrate.extra.delete.snapshot",
            defaultMessage:
              "The virtual machine has {snapshotCount} snapshots. Migrating storage while the VM is running will delete these snapshots. Proceed with caution.",
          },
          {
            snapshotCount: currentVmSnapShotCount,
          },
        )}
      />
    </>
  );
};

export default BatchChangeHost;
