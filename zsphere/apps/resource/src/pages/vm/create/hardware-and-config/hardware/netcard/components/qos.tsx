import { ZSVForm, Switch } from "@zstack/zsphere-components";
import { Form, InputUnit } from "@zstack/zsphere-components";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

import { nicBandWidthList, validateBandwidth } from "../utils";

import styles from "../style.module.less";

interface IProps {
  form: any;
  index: number;
  isEdit?: boolean;
}

const { Item } = Form;

const QoS: React.FC<IProps> = ({ form, index, isEdit = false }) => {
  const intl = useIntl();

  // 监听QoS启用状态变化，设置默认带宽值
  useEffect(() => {
    const enableFlag = form.getFieldValue(`netCardQosEnabled-${index}`);
    const inboundBandwidth = form.getFieldValue(`inboundBandwidth-${index}`);
    const outboundBandwidth = form.getFieldValue(`outboundBandwidth-${index}`);

    if (enableFlag && !isEdit && !(inboundBandwidth || outboundBandwidth)) {
      const fields = {
        [`inboundBandwidth-${index}`]: {
          number: undefined,
          unit: nicBandWidthList[0],
        },
        [`outboundBandwidth-${index}`]: {
          number: undefined,
          unit: nicBandWidthList[0],
        },
      };
      form.setFieldsValue(fields);
    }
  }, [form, index, isEdit]);
  return (
    <Item
      noStyle
      shouldUpdate={(pre, cur) =>
        pre[`nicType-${index}`] !== cur[`nicType-${index}`]
      }
    >
      {() => {
        const SRIOVFlag = form.getFieldValue(`nicType-${index}`) === "SR-IOV";

        return (
          !SRIOVFlag && (
            <>
              <Item
                label={intl.formatMessage({
                  id: "nic.qos",
                  defaultMessage: "NIC QoS",
                })}
                name={`netCardQosEnabled-${index}`}
                valuePropName="checked"
              >
                <Switch />
              </Item>
              <Item
                noStyle
                shouldUpdate={(curr, prev) =>
                  curr[`netCardQosEnabled-${index}`] !==
                  prev[`netCardQosEnabled-${index}`]
                }
              >
                {({ getFieldValue }) => {
                  const enableFlag = getFieldValue(
                    `netCardQosEnabled-${index}`,
                  );
                  return enableFlag ? (
                    <ZSVForm.Card showLine className={styles.card}>
                      <Item
                        name={`outboundBandwidth-${index}`}
                        label={intl.formatMessage({
                          id: "sed.boundBandwidth",
                          defaultMessage: "Transmit Bandwidth",
                        })}
                        validateFirst
                        dependencies={[`inboundBandwidth-${index}`]}
                        rules={[
                          // {
                          //   validator: (_rule, val) => {
                          //     return isEmpty(
                          //       getFieldValue(`inboundBandwidth-${index}`)?.number
                          //     ) && isEmpty(val.number)
                          //       ? Promise.reject(
                          //         new Error(
                          //           intl.formatMessage({
                          //             id: 'vm.field.outboundInbound.validator.require',
                          //             defaultMessage: '上行带宽/下行带宽不可同时为无限制'
                          //           })
                          //         )
                          //       )
                          //       : Promise.resolve()
                          //   }
                          // },
                          {
                            validator: (_rule, val) =>
                              validateBandwidth(
                                val,
                                intl.formatMessage({
                                  id: "vm.field.outbound.validator.invalid",
                                  defaultMessage: "Invalid upstream bandwidth",
                                }),
                              ),
                          },
                        ]}
                      >
                        <InputUnit
                          unitList={nicBandWidthList}
                          tooltip={intl.formatMessage({
                            id: "vm.field.bandwidth.tooltip",
                            defaultMessage: "Bandwidth range: 8 Kpbs – 30 Gbps",
                          })}
                        />
                      </Item>
                      <Item
                        name={`inboundBandwidth-${index}`}
                        label={intl.formatMessage({
                          id: "receive.boundBandwidth",
                          defaultMessage: "Receive Bandwidth",
                        })}
                        validateFirst
                        dependencies={[`inboundBandwidth-${index}`]}
                        rules={[
                          // {
                          //   validator: (_rule, val) => {
                          //     return isEmpty(
                          //       getFieldValue(`outboundBandwidth-${index}`)?.number
                          //     ) && isEmpty(val.number)
                          //       ? Promise.reject(
                          //         new Error(
                          //           intl.formatMessage({
                          //             id: 'vm.field.outboundInbound.validator.require',
                          //             defaultMessage: '上行带宽/下行带宽不可同时为无限制'
                          //           })
                          //         )
                          //       )
                          //       : Promise.resolve()
                          //   }
                          // },
                          {
                            validator: (_rule, val) =>
                              validateBandwidth(
                                val,
                                intl.formatMessage({
                                  id: "vm.inbound.validator.invalid",
                                  defaultMessage: "Invalid downstream bandwidth.",
                                }),
                              ),
                          },
                        ]}
                      >
                        <InputUnit
                          unitList={nicBandWidthList}
                          tooltip={intl.formatMessage({
                            id: "vm.field.bandwidth.tooltip",
                            defaultMessage: "Bandwidth range: 8 Kpbs – 30 Gbps",
                          })}
                        />
                      </Item>
                    </ZSVForm.Card>
                  ) : null;
                }}
              </Item>
            </>
          )
        );
      }}
    </Item>
  );
};

export default React.memo(QoS);
