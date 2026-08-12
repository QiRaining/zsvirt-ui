import { Form, InputDebounce, ZSVForm } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { ResourceQueryType } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  form: any;
  source?: any;
}

const { Item } = Form;
const { Card } = ZSVForm;

export const fieldsNeedsValidateInBasic = ["name", "count"];

const BasicPart: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();

  const { commonNameRules, validatorUniqName } = useValidator(intl);

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={[
          ...commonNameRules,
          validatorUniqName(
            ResourceQueryType.VmInstance,
            source?.__typename === "VmInstance" ? source?.name : undefined,
            intl.formatMessage({
              id: "instance.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      >
        <InputDebounce className={styles.baseFormItem} />
      </Item>
    </Card>
  );
};

export default React.memo(BasicPart);

// {!isEdit && (
//   <Item
//     label={intl.formatMessage({
//       id: 'virtualization.create.instance.count',
//       defaultMessage: '数量'
//     })}
//     name="count"
//     rules={[isRequired(), numberRange(1, 2000)]}
//   >
//     <InputNumber max={2000} className={styles.baseFormItem} />
//   </Item>
// )}

// {/* //选择分组,只有admin才有 */}
// {currentUser?.currentIdentity === 'Admin' && (
//   <Group form={form} zoneUuid={zoneUuid} source={source} />
// )}

// {/* //选择运行位置 */}
// <RunInPosition form={form} zoneUuid={zoneUuid} source={source} />

// {/* //选择系统 */}
// <Os form={form} source={source} />

// <Item noStyle shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
//   {() => {
//     const runPath = form.getFieldValue('runPath')

//     if (runPath?.[0] && runPath?.[0]?.__typename && !isEdit) {
//       let ha = true

//       if (runPath?.[0]?.__typename === 'HostVO') {
//         ha = runPath?.[0]?.cluster?.resourceConfigValue?.haVmHaLevel !== 'None'
//       }

//       if (runPath?.[0]?.__typename === 'Cluster') {
//         ha = runPath?.[0]?.resourceConfigValue?.haVmHaLevel !== 'None'
//       }

//       form.setFieldsValue({ ha })
//     }

//     return (
//       <Item
//         label={intl.formatMessage({
//           id: 'virtualization.create.instance.ha.mode',
//           defaultMessage: '高可用模式'
//         })}
//         name="ha"
//         valuePropName="checked"
//         icon="info"
//         style={{ marginBottom: isEdit ? '20px' : '12px' }}
//         iconTooltip={
//           <ReactMarkdown>
//             {intl.formatMessage({
//               id: 'virtualization.create.instance.ha.mode.tooltip',
//               defaultMessage: `
// ### 高可用
// 用于设置虚拟机关机时，是否自动重启。

// 1. 若关闭开关，关机后不会自动重启。

// 2. 若打开开关，且高可用策略启用后：

// 计划性关机的虚拟机将自动重启。
// 异常关机的虚拟机将根据自定义的高可用策略按需迁移至其他主机 HA 启动。

// ### 注意：
// 1. 支持通过高可用策略全局控制虚拟机高可用功能是否可用。该策略默认开启，若关闭将不允许为虚拟机设置高可用。
// 2. 支持通过高可用策略高级设置在平台全局范围内设置虚拟机高可用。该系统参数默认关闭开关，若单独对虚拟机进行设置，系统参数对该虚拟机不生效。
//               `
//             })}
//           </ReactMarkdown>
//         }
//       >
//         <Switch />
//       </Item>
//     )
//   }}
// </Item>

// {!isEdit && (
//   <Item
//     label={intl.formatMessage({
//       id: 'virtualization.create.instance.poweron',
//       defaultMessage: '默认开机'
//     })}
//     name="strategy"
//     valuePropName="checked"
//   >
//     <Checkbox>
//       {intl.formatMessage({
//         id: 'virtualization.create.instance.poweron.checkbox.description',
//         defaultMessage: '创建后自动开机'
//       })}
//     </Checkbox>
//   </Item>
// )}
