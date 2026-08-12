import { Tooltip } from "@zstack/design";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { Switch, Form } from "@zstack/zsphere-components";
import { VmInstanceState } from "@zstack/zsphere-types";
import React, { useContext, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

interface IAioProps {
  form: any;
  index: number;
  isEdit?: boolean;
  source?: any;
  disabled?: boolean; // 外部控制是否禁用，默认false
}

const { Item } = Form;

const BusType: React.FC<IAioProps> = ({
  form,
  index,
  isEdit = false,
  source,
  disabled = false,
}) => {
  const intl = useIntl();
  const _disabledConfig = useContext(ConfigContext);

  const aioDisable = useMemo(() => {
    return isEdit && source?.state !== VmInstanceState.Stopped;
  }, [isEdit, source]);

  // 获取初始的 aio 状态
  useEffect(() => {
    const initialAioState = form.getFieldValue(`aio-${index}`);
    form.setFieldsValue({ [`aio-${index}`]: initialAioState });
  }, [form, index]);

  // 监听aio的变化
  const handleAioChange = (checked: boolean) => {
    if (checked) {
      // 如果开启aio，则缓存模式必须为none
      form.setFieldsValue({
        [`cacheMode-${index}`]: "none",
      });
    }
  };

  return (
    <Item
      noStyle
      shouldUpdate={(pre, cur) =>
        pre[`cacheMode-${index}`] !== cur[`cacheMode-${index}`]
      }
    >
      {() => {
        const cacheMode = form.getFieldValue(`cacheMode-${index}`);
        const isAioDisabled =
          cacheMode === "writethrough" ||
          cacheMode === "writeback" ||
          aioDisable;

        let tooltipText = "";
        if (isAioDisabled || disabled) {
          if (cacheMode === "writethrough" || cacheMode === "writeback") {
            form.setFieldsValue({
              [`aio-${index}`]: false,
            });
            tooltipText = intl.formatMessage({
              id: "virtualization.create.instance.hardware.disk.aio.disabled.tooltip",
              defaultMessage:
                "To enable AIO acceleration, make sure the cache mode is set to none.",
            });
          } else {
            tooltipText = intl.formatMessage({
              id: "virtualization.create.instance.hardware.disk.aio.running.tooltip",
              defaultMessage: "Cannot modify this setting when the VM is running. Power off the VM and try again.",
            });
          }
        }

        return (
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
            {isAioDisabled ? (
              <Tooltip title={tooltipText}>
                <Switch
                  checked={form.getFieldValue(`aio-${index}`)}
                  disabled={true}
                />
              </Tooltip>
            ) : (
              <Switch
                checked={form.getFieldValue(`aio-${index}`)}
                onChange={handleAioChange}
                disabled={disabled}
              />
            )}
          </Item>
        );
      }}
    </Item>
  );
};

export default React.memo(BusType);
