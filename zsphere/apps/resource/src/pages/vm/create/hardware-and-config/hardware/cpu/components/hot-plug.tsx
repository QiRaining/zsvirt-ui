import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { Form, Switch } from "@zstack/zsphere-components";
import React, { useContext, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import HotAddDescription from "../../../../components/hot-add-desc";
import { updateHotPlugAndSwitchDisable } from "../utils";

import styles from "../style.module.less";

interface IProps {
  form?: any;
  isEdit: boolean;
  cpuBindList: any;
  lockRef: React.RefObject<boolean>;
}

const { Item } = Form;

const HotPlug: React.FC<IProps> = ({ form, isEdit, cpuBindList, lockRef }) => {
  const intl = useIntl();

  const disabledConfig = useContext(ConfigContext);

  // 监听相关字段变化
  const guest = Form.useWatch("guest", form);
  const vnumaEnabled = Form.useWatch("vnumaEnabled", form);
  const os = Form.useWatch("os", form);

  // 使用 useState 存储开关禁用状态
  const [switchDisable, setSwitchDisable] = useState(false);

  // 监听相关字段变化，统一计算 hotPlug 和 switchDisable
  useEffect(() => {
    const { hotPlug, switchDisable: disable } = updateHotPlugAndSwitchDisable({
      guest,
      isEdit,
      lockRef,
      vnumaEnabled,
      cpuBindList,
      os,
    });

    // 更新开关禁用状态
    setSwitchDisable(disable);

    // 非编辑模式下，自动设置 hotPlug 值
    if (!isEdit) {
      form.setFieldsValue({ hotPlug });
    }
  }, [guest, vnumaEnabled, os, isEdit, cpuBindList, lockRef, form]);

  return (
    <Item
      className={styles.hotAdd}
      label={intl.formatMessage({
        id: "virtualization.create.instance.cpu.hot.plug",
        defaultMessage: "CPU Hot Plug",
      })}
      name="hotPlug"
      valuePropName="checked"
      icon="info"
      iconTooltip={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "zsv.create.instance.cpu.hot.plug.tooltip",
            defaultMessage: `### CPU Hot Plug

Default: enabled. Specify whether to allow online modification of a VM's CPU.
                                  `,
          })}
        </ReactMarkdown>
      }
      tooltip={
        vnumaEnabled && cpuBindList?.length
          ? intl.formatMessage({
              id: "virtualization.create.instance.hotPlug.open.bind.cpu.tip",
              defaultMessage: "To enable CPU Hot Plug, unbind CPU NUMA first.",
            })
          : disabledConfig.tooltip
      }
      description={<HotAddDescription />}
    >
      <Switch disabled={switchDisable || disabledConfig.disabled} />
    </Item>
  );
};

export default React.memo(HotPlug);
