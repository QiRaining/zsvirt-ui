import { Text, Tooltip } from "@zstack/design";
import { imageListForZSVCreateInstance } from "@zstack/virtualization-resource/src/gql/image.gql";
import ImageList from "@zstack/virtualization-resource/src/pages/image/list";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import {
  Form,
  InputUnit,
  ModalSelect,
  Select,
} from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import {
  ImageQueryType,
  ImageState,
  ImageStatus,
  Op,
  VmInstanceState,
} from "@zstack/zsphere-types";
import type { Volume as IVolume } from "@zstack/zsphere-types/graphql";
import { formatStorage, formatStorageToObj } from "@zstack/zsphere-utils";
import { isVhostStorage } from "@zstack/zsphere-utils";
import { assign } from "lodash-es";
import React, { useContext, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import {
  SetDiskQosType,
  bandWidthUnitList,
  diskSizeUnitList,
} from "zsv_resource_shared/vm/disk/shared-disk-utils";

import {
  Aio,
  AllocationType,
  CreatedDisk,
  DiskOptions,
  PSWithPool,
  QoS,
  RDMDisk,
  Shareable,
} from "./components";
import { getTotalSize, useOptions } from "./utils-common";
import { validateDiskSize, validateImageStatus } from "./validators";

import styles from "./style.module.less";
interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  add?: Function;
  index: number;
  displayIndex?: number;
  isEdit?: boolean;
  source?: any;
  zoneUuid?: string;
  originValue?: IVolume;
  newCreate?: boolean; //判断是否是新增硬盘
}

const { Item } = Form;

const STYLE_MARGIN_TOP_16 = { marginTop: 16 } as const;
const STYLE_WIDTH_80 = { width: 80 } as const;
const STYLE_WIDTH_116 = { width: 116 } as const;
const STYLE_WIDTH_200 = { width: 200 } as const;

export {
  SetDiskQosType,
  bandWidthUnitList,
  diskSizeUnitList,
} from "zsv_resource_shared/vm/disk/shared-disk-utils";

const DiskCard: React.FC<IProps> = ({
  form,
  index,
  displayIndex,
  isEdit = false,
  zoneUuid = "",
  source,
  _newCreate = false,
  originValue,
}) => {
  const intl = useIntl();
  const isRootDisk = index === 0 || displayIndex === 0;
  const sourceType = source?.__typename;
  const isVmRunning = source?.state === VmInstanceState.Running;

  const disabledConfig = useContext(ConfigContext);

  // 获取各formitem筛选项
  const { allocatTypeOptions, cacheModeTypeOptions, busTypeOptions } =
    useOptions(isRootDisk);

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
        form.setFieldsValue({
          [`diskCreateType-${index}`]: "new",
        });
      }
    }
  }, [sourceType]);

  // 使用 useWatch 监听 guest 变化，自动设置 busType
  const guest = Form.useWatch("guest", form);
  const currentBusType = Form.useWatch(`busType-${index}`, form);

  useEffect(() => {
    if (guest === "Other") {
      // 当 OS 为 Other 时，设置为 ide
      if (currentBusType !== "ide") {
        form.setFieldsValue({
          [`busType-${index}`]: "ide",
        });
      }
    } else if (index > 0 && currentBusType === "ide") {
      // 当从 Other 切换到其他系统时，将非根盘的 busType 设置为 virtio
      form.setFieldsValue({
        [`busType-${index}`]: "virtio",
      });
    }
  }, [guest, currentBusType, index]);

  return (
    <div className={styles.content}>
      {!(isEdit && originValue) && (
        <DiskOptions
          index={index}
          isRoot={isRootDisk}
          onlyShowBasic={isRootDisk}
        />
      )}
      <PSWithPool
        // form={form}
        index={index}
        isEdit={isEdit}
        source={source}
        zoneUuid={zoneUuid}
      />
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          // 检查当前磁盘相关字段的变化 - 使用值比较而非引用比较
          const currentDiskChanged =
            pre[`diskCreateType-${index}`] !== cur[`diskCreateType-${index}`] ||
            pre[`storePath-${index}`]?.[0]?.uuid !==
              cur[`storePath-${index}`]?.[0]?.uuid ||
            pre[`diskImage-${index}`]?.[0]?.uuid !==
              cur[`diskImage-${index}`]?.[0]?.uuid;

          // 检查全局字段的变化 - 使用值比较而非引用比较
          const globalFieldsChanged =
            pre.runPath?.[0]?.uuid !== cur.runPath?.[0]?.uuid ||
            pre.count !== cur.count ||
            pre.guest !== cur.guest;

          // 检查当前磁盘的busType变化
          const currentBusTypeChanged =
            pre[`busType-${index}`] !== cur[`busType-${index}`];

          return (
            currentDiskChanged || globalFieldsChanged || currentBusTypeChanged
          );
        }}
      >
        {({ getFieldsValue, getFieldValue }) => {
          const values = getFieldsValue();
          const type = getFieldValue(`diskCreateType-${index}`);
          const storePath = getFieldValue(`storePath-${index}`);
          const runPath = getFieldValue(`runPath`);
          const guest = values.guest;
          const primaryStorageUuid = storePath?.[0]?.uuid;
          const showMaxSize = storePath?.[0]?.availableCapacity ?? 0;
          const storageType = storePath?.[0]?.type;

          //busType option disabled start
          const conflictingBusTypes = ["scsi", "virtio-scsi"];

          const getConflictingDiskInfoList = () => {
            const conflictingDiskInfoList = [];
            let i = 0;
            while (form.getFieldValue(`diskCreateType-${i}`) !== undefined) {
              const diskType = form.getFieldValue(`diskCreateType-${i}`);
              const busType = form.getFieldValue(`busType-${i}`);
              if (
                diskType !== "deleted" &&
                conflictingBusTypes.includes(busType)
              ) {
                conflictingDiskInfoList.push({ index: i, busType });
              }
              i++;
            }
            return conflictingDiskInfoList;
          };

          const conflictingDiskInfoList: { index: number; busType: string }[] =
            getConflictingDiskInfoList();

          const isBusTypeDisabled = (currentIndex: number, busType: string) => {
            if (!conflictingDiskInfoList?.length) {
              return false;
            }
            if (
              conflictingDiskInfoList?.length === 1 &&
              conflictingDiskInfoList?.[0]?.index === currentIndex
            ) {
              return false;
            }
            return (
              conflictingBusTypes.includes(busType) &&
              busType !== conflictingDiskInfoList?.[0].busType
            );
          };

          // busType option disabled end

          if (type === "new" || type === "image") {
            //
            //
            // 解决交运的问题 ： 当修改时os为Other时，可以修改busType
            const busTypeDisableAboutOther = guest === "Other";

            let busTypeOptionsInForm = busTypeOptions;
            if (guest === "Other") {
              busTypeOptionsInForm = busTypeOptions.filter(
                (item) => item.value === "ide",
              );
            } else if (index > 0) {
              busTypeOptionsInForm = busTypeOptions.filter(
                (item) => item.value !== "ide",
              );
            }

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
                    rules={[
                      {
                        validateTrigger: "onChange",
                        validator: (_rule, _val) =>
                          validateDiskSize(
                            form,
                            index,
                            originValue,
                            getTotalSize(storePath, runPath, originValue),
                            intl,
                          ),
                      },
                    ]}
                    initialValue={{ number: 40, unit: "GB" }}
                    required
                    description={
                      showMaxSize !== 0 && (
                        <div style={STYLE_MARGIN_TOP_16}>
                          {intl.formatMessage(
                            {
                              id: "virtualization.create.instance.field.hardware.diskSize.tips.info",
                              defaultMessage: "Max Capacity: {availableCapacity}",
                            },
                            {
                              availableCapacity: formatStorage(
                                getTotalSize(storePath, runPath, originValue),
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
                      style={STYLE_WIDTH_116}
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

              // 已存在的数据盘在修改配置时，不支持修改镜像，只显示回显
              const isDataDiskInEdit = isEdit && !isRootDisk && !!originValue;
              // 系统盘在修改配置时，如果虚拟机运行中，不支持修改镜像
              const isImageSelectDisabled = isEdit && isRootDisk && isVmRunning;

              const imageSelectTooltip = isImageSelectDisabled
                ? intl.formatMessage({
                    id: "disable.vm.edit.action.with.running",
                    defaultMessage:
                      "Cannot modify this setting when the VM is running. Power off the VM and try again.",
                  })
                : undefined;

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
                    noStyle
                    shouldUpdate={(pre, cur) => {
                      return (
                        pre[`diskImage-${index}`] !==
                          cur[`diskImage-${index}`] || pre.guest !== cur.guest
                      );
                    }}
                  >
                    {() => {
                      const diskImage = form.getFieldValue(
                        `diskImage-${index}`,
                      );

                      const imageItem = diskImage?.[0];
                      // 获取镜像的显示值：优先显示 name，如果 name 不存在则显示 uuid
                      const getImageDisplayValue = (image: any) => {
                        if (!image) {
                          return "-";
                        }
                        return image.name || image.uuid || "-";
                      };
                      // 判断镜像是否被删除：只有 uuid 没有 name
                      const isImageDeleted =
                        imageItem && !imageItem.name && imageItem.uuid;
                      // 数据盘和根盘在修改配置时，如果镜像被彻底删除，只显示回显，不显示选择器
                      if (
                        isDataDiskInEdit ||
                        (isEdit && isRootDisk && isImageDeleted)
                      ) {
                        return (
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
                          >
                            <div style={STYLE_WIDTH_200}>
                              <Text>{getImageDisplayValue(imageItem)}</Text>
                            </div>
                          </Item>
                        );
                      }
                      return (
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
                          rules={[
                            {
                              required: true,
                              validateTrigger: "onChange",
                              validator: () =>
                                validateImageStatus(
                                  form,
                                  index,
                                  isRootDisk,
                                  intl,
                                ),
                            },
                          ]}
                          required={!isImageSelectDisabled}
                          description={
                            <div style={STYLE_MARGIN_TOP_16}>
                              {intl.formatMessage({
                                id: "virtualization.create.instance.field.select.disk.image.tips.info",
                                defaultMessage: "Supports raw/qcow2 image.",
                              })}
                            </div>
                          }
                          tooltip={imageSelectTooltip}
                        >
                          <ModalSelect
                            style={STYLE_WIDTH_200}
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
                            disabledItem={isImageSelectDisabled}
                            transformKey={(item: any) =>
                              item?.name || item?.uuid || ""
                            }
                            onChange={(value: any) => {
                              if (!isEdit && value?.[0]) {
                                const size = Number(value[0].size ?? 0);
                                const { number, unit } = formatStorageToObj(
                                  size,
                                  2,
                                );
                                form.setFieldsValue({
                                  [`diskSize-${index}`]: {
                                    number: Math.ceil(Number(number)),
                                    unit,
                                  },
                                });
                              }
                            }}
                          >
                            <ImageList
                              view="select.virtualization"
                              gql={imageListForZSVCreateInstance}
                              defaultQuery={imageDefaultQuery}
                            />
                          </ModalSelect>
                        </Item>
                      );
                    }}
                  </Item>

                  <Item
                    noStyle
                    shouldUpdate={(pre, cur) => {
                      const prevDiskImage = pre[`diskImage-${index}`]?.[0];
                      const currentDiskImage = cur[`diskImage-${index}`]?.[0];

                      return (
                        prevDiskImage &&
                        currentDiskImage &&
                        prevDiskImage?.uuid !== currentDiskImage?.uuid
                      );
                    }}
                  >
                    {() => {
                      const diskImage = form.getFieldValue(
                        `diskImage-${index}`,
                      );

                      //如果是修改配置，需要变成可修改的Input框
                      if (sourceType === "VmInstance") {
                        return (
                          <Item
                            label={intl.formatMessage({
                              id: "virtualization.create.instance.hardware.diskSize",
                              defaultMessage: "Capacity",
                            })}
                            name={`diskSize-${index}`}
                            rules={[
                              {
                                validateTrigger: "onChange",
                                validator: () =>
                                  validateDiskSize(
                                    form,
                                    index,
                                    originValue,
                                    getTotalSize(
                                      storePath,
                                      runPath,
                                      originValue,
                                    ),
                                    intl,
                                  ),
                              },
                            ]}
                            initialValue={{ number: 40, unit: "GB" }}
                            required
                            description={
                              showMaxSize !== 0 && (
                                <div style={{ marginTop: 16 }}>
                                  {intl.formatMessage(
                                    {
                                      id: "virtualization.create.instance.field.hardware.diskSize.tips.info",
                                      defaultMessage:
                                        "Max Capacity: {availableCapacity}",
                                    },
                                    {
                                      availableCapacity: formatStorage(
                                        getTotalSize(
                                          storePath,
                                          runPath,
                                          originValue,
                                        ),
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
                              style={{ width: 116 }}
                            />
                          </Item>
                        );
                      }

                      if (index === 0 && diskImage?.[0]?.size) {
                        return (
                          <Item
                            label={intl.formatMessage({
                              id: "virtualization.create.instance.hardware.diskSize",
                              defaultMessage: "Capacity",
                            })}
                            name={`diskSize-${index}`}
                            rules={[
                              {
                                validateTrigger: "onChange",
                                validator: (_rule, _val) =>
                                  validateDiskSize(
                                    form,
                                    index,
                                    originValue,
                                    getTotalSize(
                                      storePath,
                                      runPath,
                                      originValue,
                                    ),
                                    intl,
                                  ),
                              },
                            ]}
                            initialValue={{ number: 40, unit: "GB" }}
                            required
                            description={
                              showMaxSize !== 0 && (
                                <div style={{ marginTop: 16 }}>
                                  {intl.formatMessage(
                                    {
                                      id: "virtualization.create.instance.field.hardware.diskSize.tips.info",
                                      defaultMessage:
                                        "Max Capacity: {availableCapacity}",
                                    },
                                    {
                                      availableCapacity: formatStorage(
                                        getTotalSize(
                                          storePath,
                                          runPath,
                                          originValue,
                                        ),
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
                              style={{ width: 116 }}
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
                            description={
                              showMaxSize !== 0 && (
                                <div style={STYLE_MARGIN_TOP_16}>
                                  {intl.formatMessage(
                                    {
                                      id: "virtualization.create.instance.field.hardware.diskSize.tips.info",
                                      defaultMessage:
                                        "Max Capacity: {availableCapacity}",
                                    },
                                    {
                                      availableCapacity: formatStorage(
                                        getTotalSize(
                                          storePath,
                                          runPath,
                                          originValue,
                                        ),
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
                    style={STYLE_WIDTH_200}
                    disabled={
                      busTypeDisableAboutOther ||
                      (originValue &&
                        (disabledConfig.disabled || shareableVolume?.disabled))
                    }
                  >
                    {busTypeOptionsInForm.map(({ value, text }) => {
                      const isConflictingBusType = isBusTypeDisabled(
                        index,
                        value,
                      );
                      //vhost 不支持 ide scsi virtio-scsi
                      const isVhostDisabled =
                        isVhostStorage(storePath?.[0]) &&
                        ["ide", "scsi", "virtio-scsi"].includes(value);

                      const isOptionDisabled =
                        isConflictingBusType || isVhostDisabled;

                      return (
                        <Select.Option
                          value={value}
                          key={value}
                          disabled={isOptionDisabled}
                        >
                          {isConflictingBusType ? (
                            <Tooltip
                              title={intl.formatMessage({
                                id: "virtualization.create.instance.hardware.disk.busType.tooltip.error",
                                defaultMessage:
                                  "Cannot use Virtio SCSI and SCSI bus types together.",
                              })}
                            >
                              <span>{text}</span>
                            </Tooltip>
                          ) : (
                            text
                          )}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Item>
                <Item
                  noStyle
                  shouldUpdate={(pre, cur) =>
                    pre[`storePath-${index}`] !== cur[`storePath-${index}`]
                  }
                >
                  {() => (
                    <AllocationType
                      form={form}
                      intl={intl}
                      index={index}
                      sourceType={sourceType}
                      originValue={originValue}
                      shareableVolume={shareableVolume}
                      allocatTypeOptions={allocatTypeOptions}
                    />
                  )}
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
                  tooltip={originValue && disabledConfig.tooltip}
                >
                  <Select
                    disabled={originValue && disabledConfig.disabled}
                    style={STYLE_WIDTH_200}
                  >
                    {cacheModeTypeOptions.map(({ value, text }) => (
                      <Select.Option value={value} key={value}>
                        {text}
                      </Select.Option>
                    ))}
                  </Select>
                </Item>

                <Aio
                  form={form}
                  index={index}
                  isEdit={isEdit}
                  source={source}
                />

                <QoS
                  index={index}
                  form={form}
                  displayIndex={displayIndex}
                  isEdit={isEdit}
                />

                <Shareable
                  form={form}
                  index={index}
                  isEdit={isEdit}
                  isRootDisk={isRootDisk}
                  originValue={originValue}
                  storageType={storageType}
                />
              </>
            );
          }

          if (type === "created") {
            return (
              <CreatedDisk index={index} source={source} formValues={values} />
            );
          }

          if (type === "rdm" && !isRootDisk) {
            return (
              <RDMDisk
                index={index}
                isEdit={isEdit}
                formValues={values}
                originValue={originValue}
                source={source}
              />
            );
          }
        }}
      </Item>
    </div>
  );
};

export default React.memo(DiskCard);
