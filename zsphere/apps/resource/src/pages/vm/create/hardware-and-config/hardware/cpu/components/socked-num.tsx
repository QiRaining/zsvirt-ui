import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { Form, Select } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { isUndefined } from "lodash-es";
import React, { useContext } from "react";
import { useIntl } from "react-intl";

import { MAX_CPU_NUM } from "../utils";

interface IProps {
  form?: any;
  isEdit?: boolean;
}

const { Item } = Form;

const STYLE_MARGIN_BOTTOM_4 = { marginBottom: 4 } as const;

const SocketNum: React.FC<IProps> = ({ form, isEdit: _isEdit }) => {
  const intl = useIntl();

  const disabledConfig = useContext(ConfigContext);

  const { isRequired } = useValidator(intl);
  // ZSV-3824, 数字太大会导致页面卡死
  const limitCpuNum = () => {
    const formCpuNum = form.getFieldValue("totalCoreNum");
    return formCpuNum > MAX_CPU_NUM ? MAX_CPU_NUM : formCpuNum;
  };

  return (
    <Item
      noStyle
      shouldUpdate={(pre, cur) =>
        pre.totalCoreNum !== cur.totalCoreNum && !isUndefined(pre.totalCoreNum)
      }
    >
      {() => {
        const _cpuNum = limitCpuNum();

        let sockedNumOptions = [1];
        if (_cpuNum) {
          const result = [];
          for (let i = 1; i < _cpuNum + 1; i++) {
            if (_cpuNum % i === 0) {
              result.push(i);
            }
          }
          sockedNumOptions = result;
        }

        return (
          <Item
            noStyle
            shouldUpdate={(pre: any, cur: any) =>
              pre.sockedNum !== cur.sockedNum
            }
          >
            {() => {
              const presockedNum = form.getFieldValue("sockedNum");
              const sockedNum = Math.floor(_cpuNum / presockedNum);

              return (
                <Item
                  rules={[isRequired()]}
                  label={intl.formatMessage({
                    id: "virtualization.create.instance.cpu.socket.num",
                    defaultMessage: "Cores per Socket",
                  })}
                  name="sockedNum"
                  description={
                    <div style={STYLE_MARGIN_BOTTOM_4}>
                      {intl.formatMessage(
                        {
                          id: "virtualization.create.instance.field.socket.num.tips.info",
                          defaultMessage: "Sockets: {socketNum}",
                        },
                        {
                          socketNum: sockedNum,
                        },
                      )}
                    </div>
                  }
                  tooltip={disabledConfig.tooltip}
                >
                  <Select
                    disabled={disabledConfig.disabled}
                    width={200}
                    options={sockedNumOptions?.map((it) => ({
                      value: it,
                      label: `${it}`,
                      key: it,
                    }))}
                  />
                </Item>
              );
            }}
          </Item>
        );
      }}
    </Item>
  );
};

export default React.memo(SocketNum);
