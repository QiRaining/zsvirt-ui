import { Icon } from "@zstack/icon";
import { Form } from "@zstack/zsphere-components";
import type { IllustrationTypes } from "@zstack/zsphere-illustration";
import { Illustration } from "@zstack/zsphere-illustration";
import { genUuid } from "@zstack/zsphere-utils";
import { Dropdown, Menu } from "antd";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

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

          return info;
        };

        //是否校验失败
        const showError = (hardwareType: IHardwareType) => {
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
                <Illustration
                  type={getIcon(type) as IllustrationTypes}
                  size={20}
                />
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
                  ([IHardwareType.GPU, IHardwareType.USB].indexOf(type) !==
                    -1 &&
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
