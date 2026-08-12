import { Icon } from "@zstack/icon";
import { Form } from "@zstack/zsphere-components";
import { Illustration } from "@zstack/zsphere-illustration";
import { formatBytesToSize, genUuid, parseNumber } from "@zstack/zsphere-utils";
import { Dropdown, Menu } from "antd";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { SetDiskQosType } from "../disk";
import { getValue } from "../netcard/utils";
import type { IHardWareItem } from "./utils";
import { IHardwareType, getIcon, getTitle } from "./utils";

import styles from "./style.module.less";

const { Item } = Form;

const HardwareItem: React.FC<IHardWareItem> = ({
  type,
  form,
  updateFieldName,
  flagKey = "cpu-0",
  setRemoveItemKey,
  actions,
  showErrorBackground = false,
}) => {
  const intl = useIntl();

  const index = flagKey.split("-")?.[1];

  const updateFileds = useMemo(() => {
    let fileds = [updateFieldName];
    switch (type) {
      case IHardwareType.Disk:
        fileds = fileds.concat([
          `diskCreateType-${index}`,
          `diskImage-${index}`,
          `createDisk-${index}`,
          `RDM-${index}`,
        ]);
        break;
      case IHardwareType.Cdrom:
        fileds.push(`diskCreateType-0`);
        break;
    }
    return fileds;
  }, [index, type]);

  return (
    <Item
      noStyle
      shouldUpdate={(pre, cur) =>
        updateFileds.some((filed) => pre[filed] !== cur[filed])
      }
    >
      {() => {
        //显示啥信息
        const infoShow = (hardwareType: IHardwareType) => {
          let info;

          if (hardwareType === IHardwareType.CPU) {
            const cpuNum = form?.getFieldValue(updateFieldName);
            if (cpuNum) {
              info = `${form?.getFieldValue(
                updateFieldName,
              )} ${intl.formatMessage({
                id: "core",
                defaultMessage: "Cores",
              })}`;
            } else {
              info = intl.formatMessage({
                id: "cpu.alert.in.hardware.item",
                defaultMessage: "Not Configured",
              });
            }
          }
          if ([IHardwareType.Memory].indexOf(hardwareType) !== -1) {
            const obj = form?.getFieldValue(updateFieldName);
            if (obj?.number) {
              info = formatBytesToSize(
                parseNumber(obj?.number ?? 0, obj?.unit ?? "GB"),
              );
            } else {
              info = intl.formatMessage({
                id: "memory.alert.in.hardware.item",
                defaultMessage: "Not Configured",
              });
            }
          }
          if ([IHardwareType.Disk].indexOf(hardwareType) !== -1) {
            const DiskIndex = updateFieldName.split("-")[1];
            //根盘
            // if (index === '0') {
            const createType = form?.getFieldValue(
              `diskCreateType-${DiskIndex}`,
            );
            const obj = form?.getFieldValue(updateFieldName);
            if (createType === "new") {
              if (obj?.number) {
                info = formatBytesToSize(
                  parseNumber(obj?.number ?? 0, obj?.unit ?? "GB"),
                );
              } else {
                info = intl.formatMessage({
                  id: "disk.alert.in.hardware.item",
                  defaultMessage: "Not Configured",
                });
              }
            }
            if (createType === "image") {
              //actualSize
              const diskImage = form?.getFieldValue(
                `diskImage-${DiskIndex}`,
              )?.[0]?.name;
              if (diskImage) {
                info = diskImage;
              } else {
                info = intl.formatMessage({
                  id: "disk.alert.in.hardware.item",
                  defaultMessage: "Not Configured",
                });
              }
            }

            if (createType === "created") {
              const createDisk = form?.getFieldValue([
                `createDisk-${DiskIndex}`,
              ]);
              if (createDisk) {
                info = formatBytesToSize(createDisk[0]?.size);
              } else {
                info = intl.formatMessage({
                  id: "disk.alert.in.hardware.item",
                  defaultMessage: "Not Configured",
                });
              }
            }
            if (createType === "rdm") {
              const lun = form?.getFieldValue(`RDM-${DiskIndex}`);
              if (lun) {
                info = lun?.[0]?.name;
              } else {
                info = intl.formatMessage({
                  id: "disk.alert.in.hardware.item",
                  defaultMessage: "Not Configured",
                });
              }
            }
          }

          if ([IHardwareType.Netcard].indexOf(hardwareType) !== -1) {
            const nic = form?.getFieldValue(updateFieldName)?.[0]?.name;
            if (nic) {
              info = nic;
            } else {
              info = intl.formatMessage({
                id: "nic.alert.in.hardware.item",
                defaultMessage: "Not Configured",
              });
            }
          }
          if ([IHardwareType.Cdrom].indexOf(hardwareType) !== -1) {
            const cdRom = form?.getFieldValue(updateFieldName)?.[0]?.name;

            if (cdRom) {
              info = cdRom;
            } else {
              info = intl.formatMessage({
                id: "cdrom.alert.in.hardware.item",
                defaultMessage: "Not Configured",
              });
            }
          }
          if ([IHardwareType.GPU].indexOf(hardwareType) !== -1) {
            const gpu = form?.getFieldValue(updateFieldName)?.[0]?.name;
            if (gpu) {
              info = gpu;
            } else {
              info = intl.formatMessage({
                id: "gpu.alert.in.hardware.item",
                defaultMessage: "Not Configured",
              });
            }
          }
          if ([IHardwareType.USB].indexOf(hardwareType) !== -1) {
            const usb = form?.getFieldValue(updateFieldName)?.[0]?.name;
            if (usb) {
              info = usb;
            } else {
              info = intl.formatMessage({
                id: "usb.alert.in.hardware.item",
                defaultMessage: "Not Configured",
              });
            }
          }
          if ([IHardwareType.PCIe].indexOf(hardwareType) !== -1) {
            const pcieName = form?.getFieldValue(updateFieldName)?.[0]?.name;
            if (pcieName) {
              info = pcieName.split("_").slice(1, -1).join("_");
            } else {
              info = intl.formatMessage({
                id: "pcie.alert.in.hardware.item",
                defaultMessage: "Not Configured",
              });
            }
          }
          if ([IHardwareType.TPM].indexOf(hardwareType) !== -1) {
            info = form?.getFieldValue("tpmVersion") ?? "";
          }
          if ([IHardwareType.Other].indexOf(hardwareType) !== -1) {
            info = form?.getFieldValue(updateFieldName)?.[0]?.name ?? "";
          }
          return info;
        };

        //是否校验失败
        const showError = (hardwareType: IHardwareType) => {
          if (hardwareType === IHardwareType.CPU) {
            const cpuNum = form?.getFieldValue(updateFieldName);
            return !cpuNum;
          }
          if (hardwareType === IHardwareType.Memory) {
            const obj = form?.getFieldValue(updateFieldName);
            return !obj?.number;
          }
          if (hardwareType === IHardwareType.Disk) {
            //分情况，根据不同CreateType判断
            const createType = form?.getFieldValue(`diskCreateType-${index}`);
            const diskSize = form?.getFieldValue(`diskSize-${index}`);
            if (!diskSize?.number) {
              return true;
            }
            if (createType === "new") {
              //还要判断qos
              const diskQos = form?.getFieldValue(`turnOnQoS-${index}`);
              if (diskQos) {
                const bandwidthMode = form?.getFieldValue(
                  `bandwidthMode-${index}`,
                );
                if (bandwidthMode === SetDiskQosType.SetBandwidthTotal) {
                  const totalBandwidth = form?.getFieldValue(
                    `totalBandwidth-${index}`,
                  );
                  if (!totalBandwidth?.number) {
                    return true;
                  }
                }
                if (bandwidthMode === SetDiskQosType.SetBandwidthWR) {
                  const iopsMode = form?.getFieldValue(`iopsMode-${index}`);
                  const readBandwidth = form?.getFieldValue(
                    `readBandwidth-${index}`,
                  );
                  const writeBandwidth = form?.getFieldValue(
                    `writeBandwidth-${index}`,
                  );
                  const totalIops = form?.getFieldValue(`iopsTotal-${index}`);
                  const iopsRead = form?.getFieldValue(`iopsRead-${index}`);
                  const iopsWrite = form?.getFieldValue(`iopsWrite-${index}`);

                  if (iopsMode === SetDiskQosType.SetIopsTotal) {
                    //三个都没有就报错
                    if (
                      !totalIops &&
                      !writeBandwidth?.number &&
                      !readBandwidth?.number
                    ) {
                      return true;
                    }
                  }
                  if (iopsMode === SetDiskQosType.SetIopsWR) {
                    //四个都没有就报错
                    if (
                      !iopsRead &&
                      !iopsWrite &&
                      !writeBandwidth?.number &&
                      !readBandwidth?.number
                    ) {
                      return true;
                    }
                  }
                }
              }
            }
            if (createType === "image") {
              //actualSize
              const diskImage = form?.getFieldValue(`diskImage-${index}`);
              if (diskImage && diskImage.length) {
                const imageDiskSize = form?.getFieldValue(`diskSize-${index}`);
                if (!imageDiskSize?.number) {
                  return true;
                }
                return false;
              }
              return true;
            }
            if (createType === "created") {
              const createdDisk = form?.getFieldValue(`createDisk-${index}`);
              if (!createdDisk) {
                return true;
              }
              return false;
            }
            if (createType === "rdm") {
              const createdDisk = form?.getFieldValue(`RDM-${index}`);
              if (!createdDisk) {
                return true;
              }
              return false;
            }
          }

          if (hardwareType === IHardwareType.Netcard) {
            const nic = form?.getFieldValue(updateFieldName)?.[0];
            if (!nic) {
              return true;
            }
            const nicQos = form?.getFieldValue(`netCardQosEnabled-${index}`);
            if (nicQos) {
              const min = getValue({ number: 8, unit: "Kbps" });
              const max = getValue({ number: 30, unit: "Gbps" });
              const inboundBandwidth = form?.getFieldValue(
                `inboundBandwidth-${index}`,
              );
              const outboundBandwidth = form?.getFieldValue(
                `outboundBandwidth-${index}`,
              );
              //俩都没有
              if (!inboundBandwidth?.number && !outboundBandwidth?.number) {
                return true;
              }
              if (inboundBandwidth?.number) {
                const value = getValue(inboundBandwidth);
                const isOverSize = value < min || value > max;
                return isOverSize;
              }
              if (outboundBandwidth?.number) {
                const value = getValue(outboundBandwidth);
                const isOverSize = value < min || value > max;
                return isOverSize;
              }
            }
          }
          if (hardwareType === IHardwareType.Cdrom) {
            //
            return false;
            // const rootDiskCreateType = form?.getFieldValue(`diskCreateType-0`)
            // if (rootDiskCreateType === 'image') {
            //   return false
            // }
            // if (rootDiskCreateType === 'new') {
            //   const cdrom = form?.getFieldValue(updateFieldName)?.[0]
            //   return !cdrom
            // }
          }
          if (hardwareType === IHardwareType.GPU) {
            const gpu = form?.getFieldValue(updateFieldName) ?? [];
            return !gpu[0];
          }
          if (hardwareType === IHardwareType.USB) {
            const usb = form?.getFieldValue(updateFieldName) ?? [];
            return !usb[0];
          }
          if (hardwareType === IHardwareType.PCIe) {
            const pcie = form?.getFieldValue(updateFieldName) ?? [];
            return !pcie[0];
          }
        };

        const showNoneInfo =
          infoShow(type)?.split("请")?.length > 1 ||
          infoShow(type)?.split("please")?.length > 1 ||
          infoShow(type) === "空" ||
          infoShow(type) === "null";

        return (
          //开启showErrorBackground并且真的有错误才显示红色
          <div
            className={
              showError(type) && showErrorBackground
                ? styles.errorItem
                : styles.item
            }
          >
            <div className={styles.name}>
              <div className={styles.icon}>
                <Illustration type={getIcon(type)} size={20} />
              </div>
              <div className={styles.title}>{getTitle(type, intl, index)}</div>
            </div>
            <div className={styles.info}>
              <div
                className={
                  showNoneInfo ? styles["info-text-none"] : styles["info-text"]
                }
              >
                {infoShow(type)}
              </div>
              <div className={styles.delete}>
                {((index !== "0" && setRemoveItemKey) ||
                  ([
                    IHardwareType.GPU,
                    IHardwareType.USB,
                    IHardwareType.PCIe,
                    IHardwareType.Cdrom,
                    IHardwareType.Netcard,
                    IHardwareType.TPM,
                  ].indexOf(type) !== -1 &&
                    setRemoveItemKey)) && (
                  <Icon
                    size={16}
                    type="trash"
                    onClick={() => {
                      setRemoveItemKey(flagKey);
                      form.setFieldsValue({ hardwareTitleUpdate: genUuid() }); //为了触发硬件信息Tab Header的校验
                    }}
                  />
                )}
              </div>
              {/*修改配置-操作*/}
              {actions && (
                <Dropdown
                  trigger={["hover"]}
                  dropdownRender={() => (
                    <Menu>
                      {actions.map((action: any) => (
                        <Menu.Item
                          disabled={action?.disabled}
                          key={action?.key}
                          onClick={action?.onClick}
                        >
                          {action?.label}
                        </Menu.Item>
                      ))}
                    </Menu>
                  )}
                  className={styles.actions}
                >
                  <span>...</span>
                </Dropdown>
              )}
            </div>
          </div>
        );
      }}
    </Item>
  );
};

export default React.memo(HardwareItem);
