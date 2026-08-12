import { gql, useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { InfoPopover } from "@zstack/design";
import { Checkbox } from "@zstack/design";
import CephPoolList from "@zstack/virtualization-resource/src/pages/ceph-primary-storage-pool/list";
import List from "@zstack/virtualization-resource/src/pages/host/list";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import {
  Form,
  Input,
  ModalSelect,
  Switch,
  ZSVForm,
} from "@zstack/zsphere-components";
import { DialogBase, DialogWeakP1 } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery, Item } from "@zstack/zsphere-types";
import {
  HostQueryType,
  Op,
  PrimaryStorageQueryType,
  PrimaryStorageType,
  VmInstanceState,
} from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  VmNic,
  Volume,
} from "@zstack/zsphere-types/graphql";
import { formatConditions, isIn, parseNumber } from "@zstack/zsphere-utils";
import { useDebounceFn, useMount } from "ahooks";
import type { FormInstance } from "antd/es/form";
import {
  filter,
  get,
  some,
  uniq,
  without,
  includes,
  map,
  every,
} from "lodash-es";
import ReactMarkdown from "react-markdown";

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
import { DialogForm } from "@zstack/zsphere-design-biz";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import ClearOriginDataField from "../components/ClearOriginDataField";
import TableInForm from "../components/table-in-form";
import {
  getMigrateAlertMessage,
  isRootAndDataVolumePsTypeDifferent,
} from "../utils";

import style from "./style.module.less";

const migrateVm = gql`
  mutation migrateVm($input: MigrateVmInput!) {
    migrateVm(input: $input) {
      actionId
    }
  }
`;

const getVMSnapshoCount = gql`
  query getVMSnapshoCount($conditions: [Condition!]) {
    volumeSnapshotList(conditions: $conditions) {
      total
    }
  }
`;

const STYLE_DIV_MARGIN = { marginTop: -5 } as const;
const STYLE_INPUT_160 = { width: 160, marginRight: 4 } as const;
const STYLE_DIV_FLEX = { display: "flex", alignItems: "center" } as const;
const STYLE_SELECT_320 = { width: 320 } as const;

/**
 * 多个vm，默认能到这一步的都是可以迁移storage的vm
 * vm回显处理
 * 批量修改服务
 */

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

const { apolloClient } = window.g_main;

const BatchChangeHost: React.FC<IBatchActionWrapperProps<IVM>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList: _setSelectedList,
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
  // form.resetFields() 清空表单，导致快照确认弹框点确定时 toStorage / toHost 等字段全部为 undefined，
  // 进而 dstPrimaryStorageUuid 为 undefined，最终 API 未真正调用。
  const [pendingSubmitValues, setPendingSubmitValues] = useState<any>(null);
  const [invalidStorages, setInvalidStorages] = useState<string[]>([]);
  const [dataInBatchTable, setDataInBatchTable] = useState(selectedList);
  const [batchConfigModalVisible, setBatchConfigModalVisible] = useState(false);
  const [selectTargetHostListVisible, setSelectTargetHostListVisible] =
    useState<any>({});
  const [noAvailableTargetHostVisible, setNoAvailableTargetHostVisible] =
    useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchConfigHostModalVisible, setBatchConfigHostModalVisible] =
    useState(false);

  const [getSnapshoCount, { data: currentVmSnapshotList = {} }] =
    useLazyQuery(getVMSnapshoCount);

  const rootAndDataVolumePsTypeDifferent = useMemo(() => {
    return !!selectedList?.some((vm) => isRootAndDataVolumePsTypeDifferent(vm));
  }, [selectedList]);

  useEffect(() => {
    setDataInBatchTable(selectedList);
    if (selectedList.length > 0) {
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
  }, [selectedList]);

  const currentVmSnapShotCount = useMemo(() => {
    return currentVmSnapshotList?.volumeSnapshotList?.total;
  }, [currentVmSnapshotList?.volumeSnapshotList?.total]);

  const defaultHostQuery: IQuery = useMemo(() => {
    //批量过滤，仅过滤源主机，其他条件暂不考虑，（2024/2/23）

    return {
      type: HostQueryType.Normal,
      conditions: [
        {
          key: "state",
          op: Op.notIn,
          values: ["Disabled", "Maintenance", "PreMaintenance"],
        },

        {
          key: "status",
          op: Op.in,
          values: ["Connected"],
        },
        {
          key: "zoneUuid",
          value: dataInBatchTable?.[0]?.zoneUuid,
        },
      ],
    } as any;
  }, [dataInBatchTable]);

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

    if (list?.length) {
      let haveTrashWithVolumes: Volume[] = [];
      if (row?.state === VmInstanceState.Running) {
        const volumeList = get(row, "allVolumes", []);
        const trashResourceUuid = list?.map((it: any) => it?.resourceUuid);
        haveTrashWithVolumes = filter(volumeList, (volume) =>
          includes(trashResourceUuid, volume?.uuid),
        );
      }
      const _haveTrashWithVolumeUuids = haveTrashWithVolumes?.map(
        (volume) => volume?.uuid,
      );
      const rootVolumeUuid = get(row, "rootVolumeUuid", "");
      if (
        some(list, (it) => it.resourceUuid === rootVolumeUuid) &&
        every(haveTrashWithVolumes, (it) => it.uuid !== rootVolumeUuid)
      ) {
        _haveTrashWithVolumeUuids.push(rootVolumeUuid);
      }
      if (_haveTrashWithVolumeUuids?.length) {
        if (
          !(
            row?.primaryStorage?.uuid === psUuid &&
            row?.primaryStorage?.type === "Ceph"
          )
        ) {
          setInvalidStorages((prev) => uniq([...prev, psName]));
          return;
        }
      }
    }

    setInvalidStorages((prev) => without(prev, psName));
  };

  useEffect(() => {
    if (invalidStorages.length > 0) {
      const storageNames = invalidStorages.join("、");
      form.setFieldsValue({
        primaryStorageTrashWarning: intl.formatMessage(
          {
            id: "vm.migrate.batch.change.host.storage.validator.clearOriginData.alert.message",
            defaultMessage:
              'The destination data storage {primaryStorage} contains raw data retained due to cross-storage migration. You can clean up these data on the Data Cleanup tab of the data storage details page.',
          },
          {
            primaryStorage: storageNames,
          },
        ),
      });
    } else {
      form.setFieldsValue({
        primaryStorageTrashWarning: "",
      });
    }
  }, [invalidStorages, form, intl]);

  useEffect(() => {
    if (visible) {
      // ZSV-11455: 当根盘和数据盘存储类型不同时，强制勾选
      // 当有 VM 带数据盘时，也默认勾选，避免跨存储迁移失败
      const hasDataVolumes = selectedList?.some(
        (t: IVM) => t?.allVolumes && t?.allVolumes?.length > 1,
      );
      form.setFieldsValue({
        migrateDisk: rootAndDataVolumePsTypeDifferent || hasDataVolumes,
      });
    }
  }, [visible]);

  const getHostModalSelect = (
    row: IVM,
    _visible: boolean,
    _setVisible: (visible: boolean) => void,
  ) => {
    const toStorage = form.getFieldValue(`toStorage-${row?.uuid}`)?.[0];
    const hostQuery = {
      type: HostQueryType.GetHostCandidatesForVmMigration,
      extraConditions: [
        {
          key: "vmInstanceUuid",
          op: Op.eq,
          value: row?.uuid,
        },
        {
          key: "dstPrimaryStorageUuid",
          op: Op.eq,
          value: form.getFieldValue(`toStorage-${row?.uuid}`)?.[0]?.uuid,
        },
      ],
      conditions: [
        {
          key: "state",
          op: Op.notIn,
          values: ["Disabled", "Maintenance", "PreMaintenance"],
        },
        {
          key: "status",
          op: Op.in,
          values: ["Connected"],
        },
        {
          key: "zoneUuid",
          value: dataInBatchTable?.[0]?.zoneUuid,
        },
        ...(toStorage
          ? [
              {
                key: "clusterUuid",
                op: Op.in,
                values: toStorage.attachedClusterUuids ?? [],
              },
            ]
          : []),
      ],
    };

    return (
      <Form.Item name={`toHost-${row.uuid}`}>
        <ModalSelect
          disabledItem={row.state === VmInstanceState.Stopped}
          title={intl.formatMessage({ id: "host", defaultMessage: "Host" })}
          widthClassName="w-200"
          autoDispatch={true}
          visible={_visible}
          setVisible={_setVisible}
          onSelectModalShow={() => {
            if (row.state === VmInstanceState.Stopped) {
              return;
            }
            if (!form.getFieldValue(`toStorage-${row?.uuid}`)) {
              setNoAvailableTargetHostVisible(true);
            } else {
              _setVisible(true);
            }
          }}
        >
          <List view="select.vm.migration" defaultQuery={hostQuery} />
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
      width: 122,
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
      width: 122,

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
      width: 156,
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
                  conditions: [
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
                      value: row.uuid,
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
      width: 156,
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
                <Form.Item name={`toStoragePool-${row.uuid}`}>
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
    {
      title: intl.formatMessage({
        id: "migrate.modal.form.item.table.colume.pre.host",
        defaultMessage: "Host",
      }),
      key: "preHost",
      width: 120,
      render: (row: any) => {
        return <Text>{row?.host?.name || row?.lastHost?.name}</Text>;
      },
    },
    {
      title: intl.formatMessage({
        id: "migrate.modal.form.item.table.colume.to.host",
        defaultMessage: "Destination Host",
      }),
      key: "toHost",
      width: 156,
      render: (row: any) => {
        return getHostModalSelect(
          row,
          selectTargetHostListVisible[row.uuid],
          (_selectTargetHostVisible) =>
            setSelectTargetHostListVisible((prev: any) => ({
              ...prev,
              [row.uuid]: _selectTargetHostVisible,
            })),
        );
      },
    },
  ];

  //操作部分
  // 迁移主存储和迁移主存储+host中间只差了一个参数，Orz
  const onOk = (value: any) => {
    if (selectedRowKeys.length === 0) {
      setVisible(false);
      return;
    }

    const isWithDataVolumes = value.migrateDisk;
    //先不管bandwidth
    const bandwidth = value.bandWidth;
    const strategy = value.autoconvergencePolicy;
    delete value.autoconvergencePolicy;
    delete value.migrateDisk;
    delete value.bandWidth;

    //过滤掉未选中的vm
    const selectedVmList = filter(selectedList, (vm: IVM) =>
      includes(selectedRowKeys, vm?.uuid),
    );

    let payloadList = selectedVmList.map((vm) => {
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

      const dstPrimaryStorageUuid = storage?.[0]?.uuid;
      const srcPrimaryStorageUuid = vm?.primaryStorage?.uuid;
      const isSrcLocalStorage =
        vm?.primaryStorage?.type === PrimaryStorageType.LocalStorage;
      const isSamePS = dstPrimaryStorageUuid === srcPrimaryStorageUuid;
      const dstPoolName = storagePool?.[0]?.poolName;
      const srcInstallPath = vm?.allVolumes?.find(
        (vol) => vol.uuid === vm.rootVolumeUuid,
      )?.installPath;
      const srcPoolName = srcInstallPath?.startsWith("ceph://")
        ? srcInstallPath.split("/")[2]
        : undefined;
      const isSamePool = !srcPoolName || dstPoolName === srcPoolName;
      const srcHostUuid = vm?.hostUuid || vm?.lastHostUuid;
      const dstHostUuid = value[`toHost-${vm?.uuid}`]?.[0]?.uuid;
      const isSameHost = dstHostUuid === srcHostUuid;

      if (isSamePS && isSamePool && isSameHost) {
        return null;
      }

      if (isSamePS && isSamePool && !isSrcLocalStorage) {
        // 迁移主机
        return {
          gql: migrateVm,
          vmInstanceUuid: vm?.uuid,
          hostUuid: dstHostUuid,
          strategy: strategy ? "auto-converge" : undefined,
        };
      }

      return {
        gql: storageMigrateVmInstance,
        vmInstanceUuid: vm?.uuid,
        dstHostUuid,
        dstPrimaryStorageUuid,
        //systemTag 与Pool有关
        //固定参数h
        withDataVolumes: isWithDataVolumes,
        strategy: strategy ? "auto-converge" : undefined,
        withSnapshots: vm?.state !== VmInstanceState.Running,
        bandwidth: Number(bandwidth),
        systemTags,
      };
    });
    payloadList = payloadList.filter((item) => !!item);

    try {
      const _doAction = ({ gql: mutation, ...payload }: any) => {
        doAction({
          mutation,
          payload,
          name: intl.formatMessage({
            id: "instance.migrate.action.title.change.hostAndPrimaryStorage",
            defaultMessage: "Migration: Change Host and Data Storage",
          }),
          total: payloadList.length,
          type: "VmInstance",
          onProgress: () => {},
          onFinish: () => {
            refetch?.();
          },
        });
      };
      map(payloadList, (payload) => _doAction(payload));
    } catch {
      //todo
    }
    setOriginVisible?.(false);
    setOriginSelectedList?.([]);
  };

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

  const haveStoppedVm = selectedList.some(
    (t: IVM) => t?.state === VmInstanceState.Stopped,
  );

  const renderAdvanceConfig = useMemo(() => {
    return (
      <>
        {migrateDataVolumeFlag ||
        includes(
          selectedList.map((t) => t.state),
          VmInstanceState.Running,
        ) ? (
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
                  <div style={STYLE_DIV_MARGIN}>
                    {intl.formatMessage({
                      id: "migrate.data.disk.checkbox.description",
                      defaultMessage:
                        "when the destination data storage is ZCE distributed storage, all data disks will be migrated to the storage pool where disk 1 resides.",
                    })}
                  </div>
                }
              >
                <FormCheckbox
                  disabled={rootAndDataVolumePsTypeDifferent}
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
              <>
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
                        style={STYLE_INPUT_160}
                        placeholder={intl.formatMessage({
                          id: "unlimited",
                          defaultMessage: "Unlimited",
                        })}
                      />
                    </Form.Item>
                    <span>MB/s</span>
                  </div>
                </Form.Item>
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
              </>
            )}
          </ZSVForm.Card>
        ) : null}
      </>
    );
  }, [
    intl,
    migrateDataVolumeFlag,
    selectedList,
    rootAndDataVolumePsTypeDifferent,
  ]);

  const noAvailableTargetHostModal = (
    <DialogBase
      title={intl.formatMessage({
        id: "vm.modal.title.no.available.target.host",
        defaultMessage: "No Available Destination Host",
      })}
      visible={noAvailableTargetHostVisible}
      setVisible={setNoAvailableTargetHostVisible}
      hideCancelButton
    >
      {intl.formatMessage({
        id: "vm.modal.storageMigrate.no.available.target.host.msg",
        defaultMessage:
          "Select a destination data storage first. After selection, you can specify a destination host. If no host is selected, the system will automatically choose the host with the fewest running VMs among those that meet the migration conditions for the migration.",
      })}
    </DialogBase>
  );

  return (
    <>
      <DialogForm
        title={intl.formatMessage({
          id: "virtualization.change.host.and.data.storage",
          defaultMessage: "Change Host and Data Storage",
        })}
        visible={visible}
        alertType="warning"
        alertMessage={getMigrateAlertMessage(
          intl,
          "batchChangeHostAndStorage",
          {
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
            snapshotCount: currentVmSnapShotCount,
          },
        )}
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
            title={
              <div style={STYLE_DIV_FLEX}>
                {intl.formatMessage({
                  id: "virtualization.vm.change.host.form.config.card.title",
                  defaultMessage: "Migration Configuration",
                })}
                <InfoPopover
                  content={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "virtualization.vm.change.host.form.config.card.tooltip",
                        defaultMessage:
                          "### Migration Configuration\n\n- If the destination data storage is the same as the source data storage, the virtual machine will only change host.\n- If the destination host is the same as the source host, the virtual machine will only change data storage.\n- If both the destination data storage and host are the same as the source data storage and host, the virtual machine will not perform any migration.\n- For host migration on the ZCE distributed storage, if the destination data storage is the same as the source data storage and no storage pool is specified, the virtual machine will not perform any migration.\n",
                      })}
                    </ReactMarkdown>
                  }
                />
              </div>
            }
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
          {renderAdvanceConfig}
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
          const batchToHost = batchConfigForm.getFieldValue("batchToHost");

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
          if (batchToHost) {
            selectedRowKeys.forEach((t: string) => {
              const toStoragePoolformItem = `toHost-${t}`;
              obj[toStoragePoolformItem] = batchToHost as any;
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
              style={STYLE_SELECT_320}
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
                  //type: PrimaryStorageQueryType.StorageMigrateVm
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
                  >
                    <ModalSelect
                      title={intl.formatMessage({
                        id: "rootDisk.storage.pool",
                        defaultMessage: "Disk 1 Storage Pool",
                      })}
                      transformKey="poolName"
                      style={STYLE_SELECT_320}
                      autoDispatch={true}
                    >
                      <CephPoolList
                        view="select"
                        defaultQuery={{
                          conditions: formatConditions({
                            primaryStorageUuid:
                              batchConfigForm.getFieldValue(
                                "batchToStorage",
                              )?.[0]?.uuid,
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
          <Form.Item
            noStyle
            shouldUpdate={(pre, cur) =>
              pre.batchToStorage !== cur.batchToStorage
            }
          >
            {({ getFieldValue }) => {
              const toStorage = getFieldValue("batchToStorage")?.[0];

              return (
                <Form.Item
                  name="batchToHost"
                  label={intl.formatMessage({
                    id: "aim.host",
                    defaultMessage: "Destination Host",
                  })}
                >
                  <ModalSelect
                    disabledItem={haveStoppedVm}
                    title={intl.formatMessage({
                      id: "host",
                      defaultMessage: "Host",
                    })}
                    style={STYLE_SELECT_320}
                    autoDispatch={true}
                    visible={batchConfigHostModalVisible}
                    setVisible={setBatchConfigHostModalVisible}
                    onSelectModalShow={() => {
                      if (haveStoppedVm) {
                        return;
                      }
                      if (!toStorage) {
                        setNoAvailableTargetHostVisible(true);
                      } else {
                        setBatchConfigHostModalVisible(true);
                      }
                    }}
                  >
                    <List
                      view="select.vm.migration"
                      defaultQuery={{
                        ...defaultHostQuery,
                        conditions: [
                          ...(defaultHostQuery.conditions ?? []),
                          ...(toStorage
                            ? [
                                {
                                  key: "clusterUuid",
                                  op: Op.in,
                                  values: toStorage.attachedClusterUuids ?? [],
                                },
                              ]
                            : []),
                        ],
                      }}
                    />
                  </ModalSelect>
                </Form.Item>
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

      {noAvailableTargetHostModal}
    </>
  );
};

export default BatchChangeHost;
