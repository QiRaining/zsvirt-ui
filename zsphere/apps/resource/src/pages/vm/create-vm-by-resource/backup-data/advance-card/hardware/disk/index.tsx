import { RadioGroup } from "@zstack/design";
import { Checkbox, Tooltip, Divider } from "@zstack/design";
import { imageListForZSVCreateInstance } from "@zstack/virtualization-resource/src/gql/image.gql";
import { primaryStorageForCreateResourceList } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import CephPoolList from "@zstack/virtualization-resource/src/pages/ceph-primary-storage-pool/list";
import ImageList from "@zstack/virtualization-resource/src/pages/image/list";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import ScsiLunList from "@zstack/virtualization-resource/src/pages/scsi-lun/list";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { formatConditions } from "@zstack/virtualization-resource/src/pages/vm/utils";
import DataVolumeList from "@zstack/virtualization-resource/src/pages/volume/list";
import { ModalSelect, ZSVForm, Switch } from "@zstack/zsphere-components";
import { Form, Input, InputUnit, Select } from "@zstack/zsphere-components";
import type { Condition, FormCreateType } from "@zstack/zsphere-types";
import {
  ImageQueryType,
  ImageState,
  ImageStatus,
  Op,
  PrimaryStorageQueryType,
  PrimaryStorageState,
  PrimaryStorageStatus,
  ScsiLunQueryType,
  VolumeQueryType,
  PrimaryStorageType,
} from "@zstack/zsphere-types";
import type { Volume as IVolume } from "@zstack/zsphere-types/graphql";
import {
  formatStorage,
  formatStorageToObj,
  isOfferingSize,
  isUint,
  parseNumber,
} from "@zstack/zsphere-utils";
import { sumBy, includes, assign, keys, get } from "lodash-es";
import React, { useContext, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  SetDiskQosType,
  bandWidthUnitList,
  diskSizeUnitList,
  createValidBand,
  createValidIops,
  createValidateEmpty,
  createValidateImageStatus,
  createIsIntegerWithUnit,
  createIsInteger,
} from "zsv_resource_shared/vm/disk/shared-disk-utils";

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
import { useIntl } from "react-intl";

import styles from "./style.module.less";

// Style constants
const MARGIN_TOP_16_STYLE = { marginTop: 16 } as const;
const WIDTH_80_STYLE = { width: 80 } as const;
const WIDTH_200_STYLE = { width: 200 } as const;
const MARGIN_LEFT_8PX_STYLE = { marginLeft: "8px" } as const;
const WIDTH_80PX_STYLE = { width: "80px" } as const;

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  add?: Function;
  index: number;
  isEdit?: boolean;
  source?: any;
  zoneUuid?: string;
  originValue?: IVolume;
}

const { Item } = Form;

// prettier-ignore
export { SetDiskQosType, bandWidthUnitList, diskSizeUnitList } from "zsv_resource_shared/vm/disk/shared-disk-utils";

const DiskCard: React.FC<IProps> = ({
  form,
  index,
  isEdit = false,
  zoneUuid = "",
  source,
  originValue,
}) => {
  const intl = useIntl();
  const isRootDisk = index === 0;
  const sourceType = source?.__typename;
  const disabledConfig = useContext(ConfigContext);

  const shareableVolume = useMemo(
    () =>
      originValue?.isShareable
        ? {
            tooltip: intl.formatMessage({
              id: "shareable.volume.not.support.edit.bus.type",
              defaultMessage: "You cannot modify the bus type of a shared disk.",
            }),
            disabled: true,
          }
        : undefined,
    [originValue],
  );

  const busTypeOptions = useMemo(() => {
    if (isRootDisk) {
      return [
        {
          value: "virtio",
          text: intl.formatMessage({
            id: "busType.virtio",
            defaultMessage: "Virtio",
          }),
        },
        {
          value: "ide",
          text: intl.formatMessage({
            id: "busType.ide",
            defaultMessage: "ide",
          }),
        },
      ];
    }
    return [
      {
        value: "virtio",
        text: intl.formatMessage({
          id: "busType.virtio",
          defaultMessage: "Virtio",
        }),
      },
      {
        value: "virtio-scsi",
        text: "Virtio Scsi",
      },
    ];
  }, [intl, isRootDisk]);

  const getTotalSize = () => {
    const values = form.getFieldsValue();
    const storePath = form.getFieldValue(`storePath-${index}`);

    const availableCapacity = storePath?.[0]?.availableCapacity ?? 0;
    const currentStoreUuid = storePath?.[0]?.uuid;
    const otherNewDiskSize = sumBy(
      Object.keys(values).filter((key) => {
        if (!key.startsWith("diskSize-")) {
          return false;
        }
        const otherIndex = key.split("-")[1];
        if (otherIndex === index.toString()) {
          return false;
        }
        // 只计算同一存储上的其他磁盘容量
        const otherStorePath = form.getFieldValue(`storePath-${otherIndex}`);
        return otherStorePath?.[0]?.uuid === currentStoreUuid;
      }),
      (key) => {
        const value = values[key];
        return value.number ? parseNumber(value.number, value.unit) : 0;
      },
    );

    if (isEdit) {
      const allVolumesSize = source?.allVolumes
        ? source.allVolumes.reduce(
            (total: any, value: any) => total + value.size,
            0,
          )
        : 0;
      return availableCapacity - (otherNewDiskSize - allVolumesSize);
    }

    return availableCapacity - otherNewDiskSize;
  };
  //精简分配（默认）
  //厚置备
  //延迟置零厚置备
  const allocatTypeOptions = [
    {
      text: intl.formatMessage({
        id: "thinProvision",
        defaultMessage: "Thin Provision",
      }),
      value: "ThinProvisioning",
      key: "ThinProvisioning",
    },
    {
      text: intl.formatMessage({
        id: "thickProvision",
        defaultMessage: "Thick Provision",
      }),
      value: "ThickProvisioning",
      key: "ThickProvisioning",
    },
    // {
    //   value: 'none',
    //   key: 'none',
    //   text: intl.formatMessage({
    //     id: 'delay.set.to.zero.provision',
    //     defaultMessage: '延迟置零厚置备（暂未实现）'
    //   })
    // }
  ];

  const cacheModeTypeOptions = [
    {
      text: intl.formatMessage({
        id: "vir.create.instance.disk.cachemode.none",
        defaultMessage: "none",
      }),
      value: "none",
      key: "none",
    },
    {
      text: intl.formatMessage({
        id: "vir.writethrough",
        defaultMessage: "writethrough",
      }),
      value: "writethrough",
      key: "writethrough",
    },
    {
      value: "writeback",
      key: "writeback",
      text: intl.formatMessage({
        id: "vir.writeback",
        defaultMessage: "writeback",
      }),
    },
  ];

  const iopsModeOptions = [
    {
      label: intl.formatMessage({
        id: "totalIops",
        defaultMessage: "Total IOPS",
      }),
      value: SetDiskQosType.SetIopsTotal,
      key: SetDiskQosType.SetIopsTotal,
    },
    {
      label: intl.formatMessage({
        id: "readingWritingIops",
        defaultMessage: "Read/Write IOPS",
      }),
      value: SetDiskQosType.SetIopsWR,
      key: SetDiskQosType.SetIopsWR,
    },
  ];

  const bandwidthModeOptions = [
    {
      label: intl.formatMessage({
        id: "totalSpeed",
        defaultMessage: "Total Speed",
      }),
      value: SetDiskQosType.SetBandwidthTotal,
      key: 1,
    },
    {
      label: intl.formatMessage({
        id: "readingWritingSpeed",
        defaultMessage: "Read/Write Speed",
      }),
      value: SetDiskQosType.SetBandwidthWR,
      key: 2,
    },
  ];

  useEffect(() => {
    if (sourceType === "Image") {
      const imageFormat = source?.format;
      const imageType = source?.mediaType;
      if (
        imageFormat !== "iso" &&
        imageType !== "DataVolumeTemplate" &&
        isRootDisk
      ) {
        //实际上只有raw qcow2和disk有关
        //只有根盘走这个逻辑
        const formatList = formatStorageToObj(Number(source.size ?? 0), 2);
        form.setFieldsValue({
          [`diskCreateType-${index}`]: "image",
          [`diskImage-${index}`]: [source],
          //
          [`diskSize-${index}`]: {
            number: Math.ceil(formatList.number as number),
            unit: formatList.unit,
          },
        });
      }
    } else {
      const createWay = form.getFieldValue(`diskCreateType-${index}`);
      if (!createWay) {
        form.setFieldValue(`diskCreateType-${index}`, "new");
      }
    }
  }, [sourceType]);

  const validBand = createValidBand(form, index, intl);
  const validIops = createValidIops(form, index, intl);
  const validateEmpty = createValidateEmpty(form, index, intl);
  const validateImageStatus = createValidateImageStatus(form, index, intl);
  const isIntegerWithUnit = createIsIntegerWithUnit(form, index, intl);
  const isInteger = createIsInteger(form, index, intl);

  const validaDiskSize = () => {
    return {
      validateTrigger: "onChange",
      validator() {
        const image = form.getFieldValue(`diskImage-${index}`);
        const diskSize = form.getFieldValue(`diskSize-${index}`);
        const storePath = form.getFieldValue(`storePath-${index}`); //存储大小
        const diskCreateTypeRadioValue = form.getFieldValue(
          `diskCreateType-${index}`,
        );
        const size = parseNumber(diskSize?.number, diskSize?.unit);

        if (!diskSize?.number && diskSize?.number !== 0) {
          return Promise.reject(
            intl.formatMessage({
              id: "global.field.validator.input.required",
              defaultMessage: "This field is required.",
            }),
          );
        }

        //新建硬盘容量
        if (
          diskCreateTypeRadioValue === "new" &&
          storePath?.[0] &&
          size > getTotalSize()
        ) {
          return Promise.reject(
            intl.formatMessage({
              id: "virtualization.disk.field.diskSize.validator.valueRange",
              defaultMessage: "Exceeding designated capacity can utilize the storage limit.",
            }),
          );
        }

        //镜像容量
        if (diskCreateTypeRadioValue === "image") {
          const imageSize = image?.[0]?.size ?? 0;
          const imageSizeFormatted = formatStorageToObj(imageSize, 2);
          const alignedImageSize = parseNumber(
            Number(imageSizeFormatted.number),
            imageSizeFormatted.unit,
          );

          if (alignedImageSize <= size) {
            if (storePath && storePath?.[0]?.availableCapacity < size) {
              return Promise.reject(
                intl.formatMessage({
                  id: "virtualization.disk.field.dataDiskCapacity.validator.valueRange",
                  defaultMessage: "Invalid capacity, capacity value must be less than data storage capacity.",
                }),
              );
            }

            return Promise.resolve();
          }
          return Promise.reject(
            intl.formatMessage({
              id: "virtualization.disk.field.imageDiskCapacity.validator.valueRange",
              defaultMessage: "Invalid capacity, capacity value must be greater than hard disk image capacity.",
            }),
          );
        }

        if (originValue && size) {
          const originFormatted = formatStorageToObj(originValue.size, 2);
          const alignedOriginSize = parseNumber(
            Number(originFormatted.number),
            originFormatted.unit as string,
          );

          if (size < alignedOriginSize) {
            return Promise.reject(
              intl.formatMessage({
                id: "volume.field.resize.validator.greaterThan.current.capacity",
                defaultMessage: "The new size must be greater than the current size.",
              }),
            );
          }
        }

        if (
          isUint(diskSize?.number) &&
          isOfferingSize(`${diskSize?.number}${diskSize?.unit.substr(0, 1)}`)
        ) {
          return Promise.resolve();
        }

        return Promise.resolve();
      },
    };
  };

  return (
    <div className={styles.content}>
      {!(isEdit && originValue) && (
        <>
          <Item name={`diskCreateType-${index}`} initialValue="new" noStyle>
            <RadioGroup
              options={[
                {
                  value: "new",
                  label: intl.formatMessage({
                    id: "virtualization.create.instance.hardware.disk.createType.new",
                    defaultMessage: "New Disk",
                  }),
                },
                {
                  value: "image",
                  label: isRootDisk
                    ? intl.formatMessage({
                        id: "virtualization.create.instance.hardware.diskImage.systemImage",
                        defaultMessage: "System Image",
                      })
                    : intl.formatMessage({
                        id: "virtualization.create.instance.hardware.diskImage",
                        defaultMessage: "Disk Image",
                      }),
                },
                ...(isRootDisk
                  ? []
                  : [
                      {
                        value: "created",
                        label: intl.formatMessage({
                          id: "virtualization.create.instance.hardware.disk.createType.created",
                          defaultMessage: "Existing Disk",
                        }),
                      },
                      {
                        value: "rdm",
                        label: intl.formatMessage({
                          id: "virtualization.create.instance.hardware.disk.createType.RDM",
                          defaultMessage: "RDM Disk",
                        }),
                      },
                    ]),
              ]}
            />
          </Item>
          <Divider type="horizontal" dashed />
        </>
      )}
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          const preClusterUuid =
            pre.runPath?.[0]?.__typename === "Cluster"
              ? pre.runPath?.[0]?.uuid
              : pre.runPath?.[0]?.cluster?.uuid;

          const curClusterUuid =
            cur.runPath?.[0]?.__typename === "Cluster"
              ? cur.runPath?.[0]?.uuid
              : cur.runPath?.[0]?.cluster?.uuid;

          return (
            preClusterUuid !== curClusterUuid ||
            pre[`diskCreateType-${index}`] !== cur[`diskCreateType-${index}`]
          );
        }}
      >
        {() => {
          const type = form?.getFieldValue(`diskCreateType-${index}`);
          const isPSTouched = form.isFieldTouched(`storePath-${index}`);

          if (type === "created" || type === "rdm") {
            return;
          }

          if (isPSTouched && sourceType !== "BackupData") {
            form.setFields([
              {
                name: `storePath-${index}`,
                value: null,
              },
            ]);
          }

          if (sourceType === "BackupData") {
            const runPath = form.getFieldValue("runPath");

            const psConditions: Condition[] = [
              {
                key: "state",
                op: Op.eq,
                value: PrimaryStorageState.Enabled,
              },
              {
                key: "status",
                op: Op.eq,
                value: PrimaryStorageStatus.Connected,
              },
            ];

            if (zoneUuid) {
              psConditions.push({
                key: "zoneUuid",
                op: Op.eq,
                value: zoneUuid,
              });
            }

            let psQueryType = PrimaryStorageQueryType.Zstack;
            let psExtraConditions: Condition[] = [];

            const hostTypeNames = new Set(["HostVO", "Host"]);
            if (hostTypeNames.has(runPath?.[0]?.__typename)) {
              psQueryType =
                PrimaryStorageQueryType.CreateInstanceDiskOptionFromHostInLocalStorageType;
              psExtraConditions = [
                { key: "hostUuid", op: Op.eq, value: runPath?.[0]?.uuid },
              ];
            }

            let clusterUuid = "";
            if (runPath?.[0]?.__typename === "Cluster") {
              clusterUuid = runPath?.[0]?.uuid ?? "";
            } else if (hostTypeNames.has(runPath?.[0]?.__typename)) {
              clusterUuid =
                runPath?.[0]?.cluster?.uuid ?? runPath?.[0]?.clusterUuid ?? "";
            }

            if (clusterUuid) {
              psConditions.push({
                key: "cluster.uuid",
                op: Op.eq,
                value: clusterUuid,
              });
            }

            const renderBackupStoragePoolEle = () => {
              const storePath = form.getFieldValue(`storePath-${index}`)?.[0];
              if (storePath?.type === "Ceph") {
                return (
                  <Item
                    name={`volumeStoragePool-${index}`}
                    label={intl.formatMessage({
                      id: "virtualization.storage.pool",
                      defaultMessage: "Storage Pool",
                    })}
                    dependencies={[`storePath-${index}`]}
                  >
                    <ModalSelect
                      transformKey="poolName"
                      title={intl.formatMessage({
                        id: "virtualization.select.storage.ceph.pool",
                        defaultMessage: "Select a storage pool.",
                      })}
                      style={WIDTH_200_STYLE}
                      autoDispatch={true}
                    >
                      <CephPoolList
                        view="select"
                        defaultQuery={{
                          conditions: formatConditions({
                            primaryStorageUuid: storePath?.uuid,
                            type: "Data",
                          }),
                        }}
                      />
                    </ModalSelect>
                  </Item>
                );
              }
              if (form.getFieldValue(`volumeStoragePool-${index}`)) {
                form.setFieldValue(`volumeStoragePool-${index}`, undefined);
              }
              return null;
            };

            return (
              <>
                <Item
                  label={intl.formatMessage({
                    id: "virtualization.create.instance.store.path",
                    defaultMessage: "Storage Location",
                  })}
                  name={`storePath-${index}`}
                >
                  <ModalSelect
                    title={intl.formatMessage({
                      id: "virtualization.create.instance.store.path.select.modal.title",
                      defaultMessage: "Select Storage Location",
                    })}
                    modalWidth={800}
                    style={WIDTH_200_STYLE}
                    autoDispatch={true}
                  >
                    <PrimaryStorageList
                      view="select"
                      gql={primaryStorageForCreateResourceList}
                      defaultQuery={{
                        conditions: psConditions,
                        type: psQueryType,
                        extraConditions: psExtraConditions,
                      }}
                    />
                  </ModalSelect>
                </Item>
                <Item
                  noStyle
                  shouldUpdate={(prev, cur) =>
                    prev[`storePath-${index}`] !== cur[`storePath-${index}`]
                  }
                >
                  {() => renderBackupStoragePoolEle()}
                </Item>
              </>
            );
          }

          return null;
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          const result =
            pre[`diskCreateType-${index}`] !== cur[`diskCreateType-${index}`] ||
            pre[`storePath-${index}`] !== cur[`storePath-${index}`] ||
            pre[`diskImage-${index}`]?.[0]?.uuid !==
              cur[`diskImage-${index}`]?.[0]?.uuid ||
            pre.guest !== cur.guest;
          return result;
        }}
      >
        {({ getFieldsValue, getFieldValue }) => {
          const values = getFieldsValue();

          const type = getFieldValue(`diskCreateType-${index}`);
          const storePath = getFieldValue(`storePath-${index}`);
          const runPath = values.runPath;
          const guest = values.guest;
          const primaryStorageUuid = storePath?.[0]?.uuid;
          const showMaxSize = storePath?.[0]?.availableCapacity ?? 0;
          const storageType = storePath?.[0]?.type;
          const _shareableFlag = includes(["Ceph", "SharedBlock"], storageType);

          if (type === "new" || type === "image") {
            //
            const busTypeDisable = guest === "Other";

            let headerEle = <></>;

            if (type === "new") {
              headerEle = (
                <>
                  <Item
                    label={intl.formatMessage({
                      id: "virtualization.create.instance.hardware.diskSize",
                      defaultMessage: "Capacity",
                    })}
                    name={`diskSize-${index}`}
                    rules={[validaDiskSize]}
                    initialValue={{ number: 40, unit: "GB" }}
                    required
                    description={
                      showMaxSize !== 0 && (
                        <div style={MARGIN_TOP_16_STYLE}>
                          {intl.formatMessage(
                            {
                              id: "virtualization.create.instance.field.hardware.diskSize.tips.info",
                              defaultMessage: "Max Capacity: {availableCapacity}",
                            },
                            {
                              availableCapacity: formatStorage(
                                getTotalSize(),
                                2,
                              ),
                            },
                          )}
                        </div>
                      )
                    }
                  >
                    <InputUnit
                      min={1}
                      unitList={diskSizeUnitList}
                      style={WIDTH_80_STYLE}
                      disabled={!!originValue}
                    />
                  </Item>
                </>
              );
            }

            if (type === "image") {
              // 参考 /zstack/premium/conf/springConfigXml/HostAllocatorManager.xml BackupStoragePrimaryStorageMetrics
              //
              //
              const imageConditions = [
                { key: "backupStorage.status", op: Op.eq, value: "Connected" },
                { key: "__systemTag__", op: Op.ne, value: "remote" },
                { key: "format", op: Op.ne, value: "iso" },
                { key: "state", op: Op.eq, value: ImageState.Enabled },
                { key: "status", op: Op.eq, value: ImageStatus.Ready },
                {
                  key: "__mediaType__",
                  op: Op.in,
                  values: isRootDisk
                    ? ["RootVolumeTemplate"]
                    : ["DataVolumeTemplate"],
                },
              ];

              if (zoneUuid) {
                imageConditions.push({
                  key: "backupStorage.zone.uuid",
                  op: Op.eq,
                  value: zoneUuid,
                });
              }

              const imageDefaultQuery = {
                conditions: imageConditions,
              };

              if (primaryStorageUuid) {
                assign(imageDefaultQuery, {
                  type: ImageQueryType.GetCandidateImagesForCreatingVm,
                  extraConditions: [
                    {
                      key: "primaryStorageUuid",
                      op: Op.eq,
                      value: primaryStorageUuid,
                    },
                  ],
                });
              }

              //
              if (primaryStorageUuid && storePath?.[0]?.type !== "Ceph") {
                imageConditions.push({
                  key: "backupStorage.type",
                  op: Op.ne,
                  value: "Ceph",
                });
              }

              headerEle = (
                <Item>
                  <Item
                    label={
                      isRootDisk
                        ? intl.formatMessage({
                            id: "virtualization.create.instance.hardware.diskImage.systemImage",
                            defaultMessage: "System Image",
                          })
                        : intl.formatMessage({
                            id: "virtualization.create.instance.hardware.diskImage",
                            defaultMessage: "Disk Image",
                          })
                    }
                    name={`diskImage-${index}`}
                    rules={[validateImageStatus]}
                    required
                    description={
                      <div style={MARGIN_TOP_16_STYLE}>
                        {intl.formatMessage({
                          id: "virtualization.create.instance.field.select.disk.image.tips.info",
                          defaultMessage: "Supports raw/qcow2 image.",
                        })}
                      </div>
                    }
                  >
                    <ModalSelect
                      style={WIDTH_200_STYLE}
                      disabledItem={!!originValue}
                      title={
                        isRootDisk
                          ? intl.formatMessage({
                              id: "virtualization.create.instance.select.system.image",
                              defaultMessage: "System Image",
                            })
                          : intl.formatMessage({
                              id: "virtualization.create.instance.select.disk.image",
                              defaultMessage: "Disk Image",
                            })
                      }
                    >
                      <ImageList
                        view="select.virtualization"
                        gql={imageListForZSVCreateInstance}
                        defaultQuery={imageDefaultQuery}
                      />
                    </ModalSelect>
                  </Item>

                  <Item
                    noStyle
                    shouldUpdate={(pre, cur) => {
                      if (
                        pre[`diskImage-${index}`]?.[0]?.uuid &&
                        cur[`diskImage-${index}`]?.[0]?.uuid &&
                        pre[`diskImage-${index}`]?.[0]?.uuid !==
                          cur[`diskImage-${index}`]?.[0]?.uuid
                      ) {
                        return true;
                      }
                      return false;
                    }}
                  >
                    {() => {
                      const diskImage = form.getFieldValue(
                        `diskImage-${index}`,
                      );

                      if (index === 0 && diskImage?.[0]?.size) {
                        return (
                          <Item
                            label={intl.formatMessage({
                              id: "virtualization.create.instance.hardware.diskSize",
                              defaultMessage: "Capacity",
                            })}
                            name={`diskSize-${index}`}
                            rules={[validaDiskSize]}
                            initialValue={{ number: 40, unit: "GB" }}
                            required
                            description={
                              showMaxSize !== 0 && (
                                <div style={MARGIN_TOP_16_STYLE}>
                                  {intl.formatMessage(
                                    {
                                      id: "virtualization.create.instance.field.hardware.diskSize.tips.info",
                                      defaultMessage:
                                        "Max Capacity: {availableCapacity}",
                                    },
                                    {
                                      availableCapacity: formatStorage(
                                        getTotalSize(),
                                        2,
                                      ),
                                    },
                                  )}
                                </div>
                              )
                            }
                          >
                            <InputUnit
                              min={1}
                              unitList={diskSizeUnitList}
                              style={WIDTH_80_STYLE}
                              disabled={!!originValue}
                            />
                          </Item>
                        );
                      }

                      if (diskImage) {
                        const diskSizeValue = form.getFieldValue(
                          `diskSize-${index}`,
                        );
                        const displaySize = diskSizeValue
                          ? `${diskSizeValue.number} ${diskSizeValue.unit}`
                          : formatStorage(diskImage[0]?.size ?? 0, 2);
                        return diskImage?.[0]?.uuid ? (
                          <Item
                            label={intl.formatMessage({
                              id: "virtualization.create.instance.hardware.diskSize",
                              defaultMessage: "Capacity",
                            })}
                            name="imageSizeJustForShow"
                            // rules={[validaDiskSize]}
                            // required={diskImage[0]?.format !== 'qcow2'}
                            description={
                              showMaxSize !== 0 && (
                                <div style={MARGIN_TOP_16_STYLE}>
                                  {intl.formatMessage(
                                    {
                                      id: "virtualization.create.instance.field.hardware.diskSize.tips.info",
                                      defaultMessage:
                                        "Max Capacity: {availableCapacity}",
                                    },
                                    {
                                      availableCapacity: formatStorage(
                                        getTotalSize(),
                                        2,
                                      ),
                                    },
                                  )}
                                </div>
                              )
                            }
                          >
                            {displaySize}
                          </Item>
                        ) : null;
                      }
                    }}
                  </Item>
                </Item>
              );
            }

            return (
              <>
                {headerEle}
                <Item
                  label={intl.formatMessage({
                    id: "virtualization.create.instance.hardware.disk.busType",
                    defaultMessage: "Bus Type",
                  })}
                  name={`busType-${index}`}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "virtualization.create.instance.hardware.disk.busType.tooltip",
                        defaultMessage: ` `,
                      })}
                    </ReactMarkdown>
                  }
                  tooltip={
                    originValue &&
                    (disabledConfig.tooltip || shareableVolume?.tooltip)
                  }
                >
                  <Select
                    style={WIDTH_200_STYLE}
                    disabled={busTypeDisable || !!originValue}
                  >
                    {busTypeOptions.map(({ value, text }) => (
                      <Select.Option value={value} key={value}>
                        {text}
                      </Select.Option>
                    ))}
                  </Select>
                </Item>
                <Item
                  noStyle
                  shouldUpdate={(pre, cur) =>
                    pre[`storePath-${index}`] !== cur[`storePath-${index}`]
                  }
                >
                  {() => {
                    //
                    // 手动指定存储时，增加置备方式 的字段展示
                    // 仅有精简置备时，为固定字段展示
                    // 本地存储：精简置备
                    // NFS：精简置备
                    // SAN 存储：厚置备、精简置备
                    //
                    // 实际上，就SAN有选项，其他的存储都是文字
                    const indexStorePath = form.getFieldValue(
                      `storePath-${index}`,
                    );

                    const indexStorePathType = indexStorePath?.[0]?.type;

                    if (
                      [
                        PrimaryStorageType.Addon,
                        PrimaryStorageType.Ceph,
                      ].includes(
                        originValue?.primaryStorage?.type ?? indexStorePathType,
                      )
                    ) {
                      return null;
                    }

                    if (
                      sourceType === "VmInstance" &&
                      originValue &&
                      form.getFieldValue(`allocationType-${index}`)
                    ) {
                      return (
                        <Item
                          label={intl.formatMessage({
                            id: "virtualization.create.instance.hardware.disk.allocation.type",
                            defaultMessage: "Provision Method",
                          })}
                          name={`allocationType-${index}`}
                          icon="info"
                          iconTooltip={
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "virtualization.create.instance.hardware.disk.allocation.type.tooltip",
                                defaultMessage: `### Provision Method

Specifies how to allocate storage space on the disk. Supports thin provision and thick provision methods.

1. Thin Provision: Allocates storage space according to actual usage to achieve higher storage utilization.

2. Thick Provision: Pre-allocates required storage space when creating the disk, which can provide sufficient storage capacity and ensure storage performance.`,
                              })}
                            </ReactMarkdown>
                          }
                          tooltip={originValue && shareableVolume?.tooltip}
                        >
                          {form.getFieldValue(`allocationType-${index}`) ===
                          "ThinProvisioning"
                            ? intl.formatMessage({
                                id: "thinProvision",
                                defaultMessage: "Thin Provision",
                              })
                            : intl.formatMessage({
                                id: "thickProvision",
                                defaultMessage: "Thick Provision",
                              })}
                        </Item>
                      );
                    }

                    return indexStorePathType ? (
                      <Item
                        label={intl.formatMessage({
                          id: "virtualization.create.instance.hardware.disk.allocation.type",
                          defaultMessage: "Provision Method",
                        })}
                        name={`allocationType-${index}`}
                        icon="info"
                        iconTooltip={
                          <ReactMarkdown>
                            {intl.formatMessage({
                              id: "virtualization.create.instance.hardware.disk.allocation.type.tooltip",
                              defaultMessage: `### Provision Method

Specifies how to allocate storage space on the disk. Supports thin provision and thick provision methods.

1. Thin Provision: Allocates storage space according to actual usage to achieve higher storage utilization.

2. Thick Provision: Pre-allocates required storage space when creating the disk, which can provide sufficient storage capacity and ensure storage performance.`,
                            })}
                          </ReactMarkdown>
                        }
                      >
                        {indexStorePathType === "SharedBlock" ? (
                          <Select
                            disabled={!!originValue}
                            style={WIDTH_200_STYLE}
                          >
                            {allocatTypeOptions.map(({ value, text }) => (
                              <Select.Option value={value} key={value}>
                                {text}
                              </Select.Option>
                            ))}
                          </Select>
                        ) : (
                          intl.formatMessage({
                            id: "thinProvision",
                            defaultMessage: "Thin Provision",
                          })
                        )}
                      </Item>
                    ) : null;
                  }}
                </Item>
                <Item
                  label={intl.formatMessage({
                    id: "virtualization.create.instance.hardware.disk.cacheMode",
                    defaultMessage: "Cache Mode",
                  })}
                  name={`cacheMode-${index}`}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "zsv.create.instance.hardware.disk.cacheMode.tooltip",
                        defaultMessage: `### Cache Mode

Default: none. Specifies the cache mode of a virtual machine.

  * none:
    - The host page cache is bypassed and data is directly read from or written to the storage device of the VM.
    - Applies to scenarios that require real-time data synchronization.
  * writethrough:
    - Data is initially written to the host's page cache before being committed to the host disk.
    - Suitable for situations where high data consistency is crucial.
  * writeback:
    - Data is first written to the host's page cache and then synchronized to the host disk when the cache is full or a write-back event occurs.
    - Applies to scenarios that require high write performance.`,
                      })}
                    </ReactMarkdown>
                  }
                >
                  <Select disabled={!!originValue} style={WIDTH_200_STYLE}>
                    {cacheModeTypeOptions.map(({ value, text }) => (
                      <Select.Option value={value} key={value}>
                        {text}
                      </Select.Option>
                    ))}
                  </Select>
                </Item>
                <Item
                  label={intl.formatMessage({
                    id: "virtualization.create.instance.hardware.disk.aio.speed.up",
                    defaultMessage: "AIO Acceleration",
                  })}
                  name={`aio-${index}`}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "zsv.create.instance.hardware.disk.aio.speed.up.tooltip",
                        defaultMessage: `### AIO Acceleration

1. Default: disabled. After you turn on this switch, you need to set the VM cache mode to none.
2. Asynchronous I/O acceleration enables the VM to handle multiple I/O requests concurrently. This reduces CPU overhead and boosts overall throughput. This feature usually applies to scenarios with frequent I/O activities, such as database transactions, file transfers, virtual desktops, and network communications.
                    `,
                      })}
                    </ReactMarkdown>
                  }
                  valuePropName="checked"
                >
                  <Switch disabled={!!originValue} />
                </Item>
                <Item
                  noStyle
                  shouldUpdate={(prev, curr) =>
                    prev[`diskSharable-${index}`] !==
                    curr[`diskSharable-${index}`]
                  }
                >
                  {() => {
                    const diskShare = form.getFieldValue(
                      `diskSharable-${index}`,
                    );

                    return (
                      <Item
                        label={intl.formatMessage({
                          id: "disk.turn.on.QoS",
                          defaultMessage: "QoS",
                        })}
                        name={`turnOnQoS-${index}`}
                        valuePropName="checked"
                      >
                        {diskShare ? (
                          <Tooltip
                            title={intl.formatMessage({
                              id: "disk.share.tip",
                              defaultMessage:
                                "You cannot modify the Qos of a shared disk.",
                            })}
                          >
                            <Switch
                              size="small"
                              checked={false}
                              disabled={diskShare || !!originValue}
                            />
                          </Tooltip>
                        ) : (
                          <Switch
                            size="small"
                            checked={true}
                            disabled={diskShare || !!originValue}
                          />
                        )}
                      </Item>
                    );
                  }}
                </Item>
                <Item
                  noStyle
                  shouldUpdate={(prev, curr) =>
                    prev[`turnOnQoS-${index}`] !== curr[`turnOnQoS-${index}`]
                  }
                >
                  {({ getFieldValue: _getFieldValue }) => {
                    const turnOnQoS = _getFieldValue(`turnOnQoS-${index}`);
                    if (turnOnQoS && !isEdit) {
                      //当开启qos并且是创建时才默认设置qos选项
                      const fields = {
                        [`bandwidthMode-${index}`]:
                          SetDiskQosType.SetBandwidthTotal,
                        [`totalBandwidth-${index}`]: {
                          number: undefined,
                          unit: bandWidthUnitList[0],
                        },
                        [`iopsMode-${index}`]: SetDiskQosType.SetIopsTotal,
                      };
                      form.setFieldsValue(fields);
                    }

                    return turnOnQoS ? (
                      <ZSVForm.Card>
                        <Item
                          label={intl.formatMessage({
                            id: "bandwidthLimit",
                            defaultMessage: "Bandwidth Limit",
                          })}
                          name={`bandwidthMode-${index}`}
                          icon="info"
                          iconTooltip={{
                            title: (
                              <>
                                <ReactMarkdown>
                                  {intl.formatMessage({
                                    id: "setVolumeQos.field.bandwidthMode.tooltip",
                                    defaultMessage:
                                      "### Bandwidth Limit\nSet the upper limit of the disk I/O bandwidth. We recommend that you set a proper value. Excessively low bandwidth might cause VMs to work abnormally.",
                                  })}
                                </ReactMarkdown>
                              </>
                            ),
                          }}
                        >
                          <RadioGroup
                            variant="button"
                            disabled={!!originValue}
                            options={bandwidthModeOptions}
                            onValueChange={(val) => {
                              form.setFieldsValue({
                                [`bandwidthMode-${index}`]: val,
                              });
                            }}
                          />
                        </Item>
                        <Item
                          noStyle
                          shouldUpdate={(prev, curr) =>
                            prev[`bandwidthMode-${index}`] !==
                            curr[`bandwidthMode-${index}`]
                          }
                        >
                          {({ getFieldValue }) => {
                            switch (getFieldValue(`bandwidthMode-${index}`)) {
                              case SetDiskQosType.SetBandwidthTotal:
                                return (
                                  <Item
                                    label={intl.formatMessage({
                                      id: "totalSpeed",
                                      defaultMessage: "Total Speed",
                                    })}
                                    // required
                                    name={`totalBandwidth-${index}`}
                                    rules={[validateEmpty, validBand]}
                                  >
                                    <InputUnit
                                      unitList={bandWidthUnitList}
                                      disabled={!!originValue}
                                    />
                                  </Item>
                                );
                              case SetDiskQosType.SetBandwidthWR:
                                return (
                                  <>
                                    <Item
                                      label={intl.formatMessage({
                                        id: "readingAndWritingSpeed",
                                        defaultMessage: "Read Speed",
                                      })}
                                      name={`readBandwidth-${index}`}
                                      rules={[
                                        validateEmpty,
                                        validBand,
                                        {
                                          validator: isIntegerWithUnit,
                                        },
                                      ]}
                                    >
                                      <InputUnit
                                        unitList={bandWidthUnitList}
                                        disabled={!!originValue}
                                      />
                                    </Item>
                                    <Item
                                      label={intl.formatMessage({
                                        id: "writeSpeed",
                                        defaultMessage: "Write Speed",
                                      })}
                                      name={`writeBandwidth-${index}`}
                                      rules={[
                                        validateEmpty,
                                        validBand,
                                        {
                                          validator: isIntegerWithUnit,
                                        },
                                      ]}
                                    >
                                      <InputUnit
                                        unitList={bandWidthUnitList}
                                        disabled={!!originValue}
                                      />
                                    </Item>
                                  </>
                                );
                              default:
                                return null;
                            }
                          }}
                        </Item>
                        <Item
                          label={intl.formatMessage({
                            id: "iopsLimit",
                            defaultMessage: "IOPS Limit",
                          })}
                          name={`iopsMode-${index}`}
                          icon="info"
                          iconTooltip={{
                            title: (
                              <>
                                <ReactMarkdown>
                                  {intl.formatMessage({
                                    id: "setVolumeQos.field.iopsMode.tooltip",
                                    defaultMessage:
                                      "### IOPS Limit\nSet the upper limit of the disk reads/writes per second (IOPS). We recommend that you set a proper value. Excessively low IOPS might cause VMs to work abnormally.",
                                  })}
                                </ReactMarkdown>
                              </>
                            ),
                          }}
                        >
                          <RadioGroup
                            disabled={!!originValue}
                            variant="button"
                            options={iopsModeOptions}
                            onValueChange={(val) => {
                              form.setFieldsValue({
                                [`iopsMode-${index}`]: val as SetDiskQosType,
                              });
                            }}
                          />
                        </Item>
                        <Item
                          noStyle
                          shouldUpdate={(prev, curr) =>
                            prev[`iopsMode-${index}`] !==
                            curr[`iopsMode-${index}`]
                          }
                        >
                          {({ getFieldValue }) => {
                            switch (
                              getFieldValue(
                                `iopsMode-${index}`,
                              ) as SetDiskQosType
                            ) {
                              case SetDiskQosType.SetIopsTotal:
                                return (
                                  <Item
                                    label={intl.formatMessage({
                                      id: "totalIops",
                                      defaultMessage: "Total IOPS",
                                    })}
                                  >
                                    <Item
                                      name={`iopsTotal-${index}`}
                                      rules={[
                                        validateEmpty,
                                        validIops,
                                        {
                                          validator: isInteger,
                                        },
                                      ]}
                                      noStyle
                                    >
                                      <Input
                                        type="number"
                                        min={16}
                                        style={WIDTH_80PX_STYLE}
                                        disabled={!!originValue}
                                      />
                                    </Item>
                                    <span style={MARGIN_LEFT_8PX_STYLE}>
                                      IOPS
                                    </span>
                                  </Item>
                                );
                              case SetDiskQosType.SetIopsWR:
                                return (
                                  <>
                                    <Item
                                      label={intl.formatMessage({
                                        id: "readingIops",
                                        defaultMessage: "Read IOPS",
                                      })}
                                    >
                                      <Item
                                        name={`iopsRead-${index}`}
                                        rules={[
                                          validateEmpty,
                                          validIops,
                                          {
                                            validator: isInteger,
                                          },
                                        ]}
                                        noStyle
                                      >
                                        <Input
                                          type="number"
                                          min={16}
                                          style={WIDTH_80PX_STYLE}
                                          disabled={!!originValue}
                                        />
                                      </Item>
                                      <span style={MARGIN_LEFT_8PX_STYLE}>
                                        IOPS
                                      </span>
                                    </Item>
                                    <Item
                                      label={intl.formatMessage({
                                        id: "writingIops",
                                        defaultMessage: "Write IOPS",
                                      })}
                                    >
                                      <Item
                                        name={`iopsWrite-${index}`}
                                        rules={[
                                          validateEmpty,
                                          validIops,
                                          {
                                            validator: isInteger,
                                          },
                                        ]}
                                        noStyle
                                      >
                                        <Input
                                          type="number"
                                          min={16}
                                          style={WIDTH_80PX_STYLE}
                                          disabled={!!originValue}
                                        />
                                      </Item>
                                      <span style={MARGIN_LEFT_8PX_STYLE}>
                                        IOPS
                                      </span>
                                    </Item>
                                  </>
                                );
                              default:
                                return null;
                            }
                          }}
                        </Item>
                      </ZSVForm.Card>
                    ) : null;
                  }}
                </Item>

                <Item
                  noStyle
                  shouldUpdate={(prev, curr) =>
                    prev[`turnOnQoS-${index}`] !== curr[`turnOnQoS-${index}`] ||
                    prev[`busType-${index}`] !== curr[`busType-${index}`] ||
                    prev[`allocationType-${index}`] !==
                      curr[`allocationType-${index}`]
                  }
                >
                  {() => {
                    const allocationType = form.getFieldValue(
                      `allocationType-${index}`,
                    );
                    const qosOn = form.getFieldValue(`turnOnQoS-${index}`);
                    const busType = form.getFieldValue(`busType-${index}`);

                    const canShareOnSAN =
                      storageType === "SharedBlock" &&
                      busType === "virtio-scsi" &&
                      allocationType === "ThickProvisioning";

                    const canShareOnCeph =
                      storageType === "Ceph" && busType === "virtio-scsi";

                    const isShareable = canShareOnSAN || canShareOnCeph;

                    if (!isShareable && !originValue) {
                      form.setFieldsValue({ [`diskSharable-${index}`]: false });
                    }

                    if (isEdit && originValue?.uuid && !isRootDisk) {
                      return (
                        <Item
                          label={intl.formatMessage({
                            id: "virtualization.create.instance.hardware.shareable.disk",
                            defaultMessage: "Shared Disk",
                          })}
                          icon="info"
                          iconTooltip={{
                            title: (
                              <>
                                <ReactMarkdown>
                                  {intl.formatMessage({
                                    id: "virtualization.create.instance.hardware.shareable.disk.tooltip",
                                    defaultMessage:
                                      "### Shared Disk\n\nA shared disk is essentially the disk that can be attached to multiple VMs for use, which is similar to a physical disk in that the disk can be attached to multiple physical servers, and each server can read data from and write data into the disk.\n\n- You can share a disk when the storage location is ZCE or ZBS distributed storage and the bus type is Virtio SCSI.\n- You can share a disk when the storage location is SAN storage, the bus type is Virtio SCSI, and the provision method is thick provision.\n- You cannot share a disk if the storage location is other storage types.\n",
                                  })}
                                </ReactMarkdown>
                              </>
                            ),
                          }}
                          name={`diskSharable-${index}`}
                        >
                          {form.getFieldValue(`diskSharable-${index}`) ? (
                            <span>
                              {intl.formatMessage({
                                id: "yes",
                                defaultMessage: "Yes",
                              })}
                            </span>
                          ) : (
                            <span>
                              {intl.formatMessage({
                                id: "no",
                                defaultMessage: "No",
                              })}
                            </span>
                          )}
                        </Item>
                      );
                    }

                    return (
                      !isRootDisk && (
                        <Item
                          label={intl.formatMessage({
                            id: "virtualization.create.instance.hardware.shareable.disk",
                            defaultMessage: "Shared Disk",
                          })}
                          icon="info"
                          iconTooltip={{
                            title: (
                              <>
                                <ReactMarkdown>
                                  {intl.formatMessage({
                                    id: "virtualization.create.instance.hardware.shareable.disk.tooltip",
                                    defaultMessage:
                                      "### Shared Disk\n\nA shared disk is essentially the disk that can be attached to multiple VMs for use, which is similar to a physical disk in that the disk can be attached to multiple physical servers, and each server can read data from and write data into the disk.\n\n- You can share a disk when the storage location is ZCE or ZBS distributed storage and the bus type is Virtio SCSI.\n- You can share a disk when the storage location is SAN storage, the bus type is Virtio SCSI, and the provision method is thick provision.\n- You cannot share a disk if the storage location is other storage types.\n",
                                  })}
                                </ReactMarkdown>
                              </>
                            ),
                          }}
                          name={`diskSharable-${index}`}
                          valuePropName="checked"
                          tooltip={(() => {
                            if (qosOn) {
                              return intl.formatMessage({
                                id: "qosOn.tip",
                                defaultMessage:
                                  "You cannot share this disk with other VMs, because the disk has already been set QoS.",
                              });
                            }

                            if (!isShareable) {
                              return (
                                <ReactMarkdown>
                                  {intl.formatMessage({
                                    id: "vm.disk.sharable.tooltip2",
                                    defaultMessage: `To share a disk:

- Make sure the storage location is ZCE or ZBS distributed storage and the bus type is Virtio SCSI,
- Make sure the storage location is SAN storage, the bus type is Virtio SCSI, and the provision method is thick provision.`,
                                  })}
                                </ReactMarkdown>
                              );
                            }
                          })()}
                        >
                          <FormCheckbox
                            disabled={
                              !!originValue?.uuid || qosOn || !isShareable
                            }
                            label={intl.formatMessage({
                              id: "virtualization.create.instance.hardware.disk.share.to.others",
                              defaultMessage: "Share with other VMs",
                            })}
                          />
                        </Item>
                      )
                    );
                  }}
                </Item>
              </>
            );
          }

          if (type === "created") {
            const selectedVolumeUuids =
              keys(values)
                .filter(
                  (key) =>
                    key.indexOf("createDisk-") > -1 && values?.[key]?.length,
                )
                .map((key) => values?.[key]?.[0]?.uuid) ?? [];

            const _DefaultQuery = {
              VmInstance: {
                type: VolumeQueryType.GET_VM_ATTACHABLE_NOT_SNAPSHOT_DATA_VOLUME,
                extraConditions: [
                  { key: "vmInstanceUuid", op: Op.eq, value: source?.uuid },
                ],
                conditions: [
                  {
                    key: "status",
                    op: Op.ne,
                    value: "Deleted",
                  },
                  // {
                  //   key: 'primaryStorageUuid',
                  //   op: Op.eq,
                  //   value: source?.primaryStorage?.uuid
                  // },
                  {
                    key: "uuid",
                    op: Op.notIn,
                    values: selectedVolumeUuids,
                  },
                ],
              },
              Cluster: {
                type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
                conditions: [
                  {
                    key: "status",
                    op: Op.ne,
                    value: "Deleted",
                  },
                  {
                    key: "type",
                    op: Op.eq,
                    value: "Data",
                  },
                  {
                    key: "primaryStorage.cluster.uuid",
                    op: Op.eq,
                    value: source?.uuid,
                  },
                  {
                    key: "uuid",
                    op: Op.notIn,
                    values: selectedVolumeUuids,
                  },
                  {
                    key: "__attachedVm__",
                    value: "false",
                    op: Op.eq,
                  },
                ],
              },
              PrimaryStorageVO: {
                type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
                conditions: [
                  {
                    key: "status",
                    op: Op.ne,
                    value: "Deleted",
                  },
                  {
                    key: "type",
                    op: Op.eq,
                    value: "Data",
                  },
                  {
                    key: "primaryStorageUuid",
                    op: Op.eq,
                    value: source?.uuid,
                  },
                  {
                    key: "uuid",
                    op: Op.notIn,
                    values: selectedVolumeUuids,
                  },
                  {
                    key: "__attachedVm__",
                    value: "false",
                    op: Op.eq,
                  },
                ],
              },
              Zone: {
                type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
                conditions: [
                  {
                    key: "status",
                    op: Op.ne,
                    value: "Deleted",
                  },
                  {
                    key: "type",
                    op: Op.eq,
                    value: "Data",
                  },
                  {
                    key: "primaryStorage.cluster.uuid",
                    op: Op.eq,
                    value:
                      runPath?.[0]?.__typename === "HostVO"
                        ? runPath?.[0]?.cluster?.uuid
                        : runPath?.[0]?.uuid,
                  },
                  {
                    key: "uuid",
                    op: Op.notIn,
                    values: selectedVolumeUuids,
                  },
                  {
                    key: "__attachedVm__",
                    value: "false",
                    op: Op.eq,
                  },
                ],
              },
              HostVO: {
                type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
                conditions: [
                  {
                    key: "status",
                    op: Op.ne,
                    value: "Deleted",
                  },
                  {
                    key: "type",
                    op: Op.eq,
                    value: "Data",
                  },
                  {
                    key: "primaryStorage.cluster.uuid",
                    op: Op.eq,
                    value: source?.cluster?.uuid,
                  },
                  {
                    key: "uuid",
                    op: Op.notIn,
                    values: selectedVolumeUuids,
                  },
                  {
                    key: "__attachedVm__",
                    value: "false",
                    op: Op.eq,
                  },
                ],
              },
            };

            const resourceType = source.__typename;

            const dataVolumeDefaultQuery = get(_DefaultQuery, resourceType, {
              type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
              conditions: [
                {
                  key: "status",
                  op: Op.ne,
                  value: "Deleted",
                },
                {
                  key: "type",
                  op: Op.eq,
                  value: "Data",
                },
                {
                  key: "uuid",
                  op: Op.notIn,
                  values: selectedVolumeUuids,
                },
                {
                  key: "__attachedVm__",
                  value: "false",
                  op: Op.eq,
                },
              ],
            });

            return (
              <>
                <Item
                  label={intl.formatMessage({
                    id: "virtualization.create.instance.hardware.created.disk",
                    defaultMessage: "Existing Disk",
                  })}
                  name={`createDisk-${index}`}
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: "instance.field.disk.createDisk.validator.required",
                        defaultMessage: "Select an existing disk.",
                      }),
                    },
                  ]}
                >
                  <ModalSelect
                    style={WIDTH_200_STYLE}
                    title={intl.formatMessage({
                      id: "virtualization.create.instance.select.created.disk",
                      defaultMessage: "Existing Disk",
                    })}
                    alertType="info"
                    alertMessage={
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "virtualization.create.instance.hardware.created.disk.alert",
                          defaultMessage: `The current list is filtered to show disks that meet the following prerequisites:
- Not tied to snapshots: The disk is not associated with any VM snapshots.
- Available for attachment: The disk is either a shared disk or an disk not in use by other VMs.`,
                        })}
                      </ReactMarkdown>
                    }
                  >
                    <DataVolumeList
                      view="select"
                      defaultQuery={dataVolumeDefaultQuery}
                    />
                  </ModalSelect>
                </Item>
              </>
            );
          }

          if (type === "rdm" && !isRootDisk) {
            const lunUuids = keys(values)
              .filter(
                (key) => key.indexOf("RDM-") > -1 && values?.[key]?.length,
              )
              .map((key) => values?.[key]?.[0]?.uuid);

            const defaultQuery =
              runPath?.[0]?.__typename === "HostVO"
                ? {
                    type: ScsiLunQueryType.GetScsiLunCandidatesForAttachingZSVInstanceByHost,
                    conditions: [
                      {
                        key: "uuid",
                        op: Op.notIn,
                        values: lunUuids.filter(
                          (uuid) =>
                            uuid !== values?.[`RDM-${index}`]?.[0]?.uuid,
                        ),
                      },
                    ],
                    extraConditions: [
                      {
                        key: "hostUuid",
                        op: Op.eq,
                        value: runPath?.[0]?.uuid,
                      },
                    ],
                  }
                : {
                    type: ScsiLunQueryType.GetScsiLunCandidatesForAttachingZSVInstanceByCluster,
                    conditions: [
                      {
                        key: "uuid",
                        op: Op.notIn,
                        values: lunUuids.filter(
                          (uuid) =>
                            uuid !== values?.[`RDM-${index}`]?.[0]?.uuid,
                        ),
                      },
                    ],
                    extraConditions: [
                      {
                        key: "clusterUuid",
                        op: Op.eq,
                        value: runPath?.[0]?.uuid,
                      },
                    ],
                  };

            return (
              <Item
                label={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.disk.createType.Lun",
                  defaultMessage: "LUN",
                })}
                name={`RDM-${index}`}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "instance.field.disk.rdm.validator.required",
                      defaultMessage: "Select a LUN.",
                    }),
                  },
                ]}
              >
                <ModalSelect
                  disabledItem={!!originValue}
                  style={WIDTH_200_STYLE}
                  title={intl.formatMessage({
                    id: "virtualization.create.instance.select.Lun",
                    defaultMessage: "Select LUN",
                  })}
                >
                  <ScsiLunList view="select" defaultQuery={defaultQuery} />
                </ModalSelect>
              </Item>
            );
          }
        }}
      </Item>
    </div>
  );
};

export default React.memo(DiskCard);
