import { Tooltip, RadioGroup } from "@zstack/design";
import {
  Form,
  Input,
  InputUnit,
  Switch,
  ZSVForm,
} from "@zstack/zsphere-components";
import { isIn, parseNumber } from "@zstack/zsphere-utils";
import { isNull, isUndefined, isInteger as isIntegerNumber } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import {
  SetDiskQosType,
  bandWidthUnitList,
} from "zsv_resource_shared/vm/disk/shared-disk-utils";

import { useOptions } from "../utils-common";
import { isInteger as validateInteger } from "../validators";

import style from "../style.module.less";

interface IProps {
  form: any;
  isEdit?: boolean;
  index: number;
  displayIndex?: number;
}

const { Item } = Form;

const STYLE_WIDTH_80PX = { width: "80px" } as const;
const STYLE_MARGIN_LEFT_8PX = { marginLeft: "8px" } as const;

const bandRange = {
  maxValue: 1024 * 1024 * 1024 * 100,
  minValue: 1024 * 1024,
};

const QoS: React.FC<IProps> = ({
  form,
  index,
  displayIndex,
  isEdit = false,
}) => {
  const intl = useIntl();
  const isRootDisk = index === 0 || displayIndex === 0;

  // 获取各formitem筛选项
  const { iopsModeOptions, bandwidthModeOptions } = useOptions(isRootDisk);

  const validBand = () => {
    return {
      validateTrigger: "onChange",
      validator(...[, { number: v, unit }]: any[]) {
        const mode = form.getFieldValue([
          `bandwidthMode-${index}`,
        ]) as SetDiskQosType;

        const _bandwidthMode = mode === SetDiskQosType.SetBandwidthTotal;

        const _v = parseNumber(Number(v), unit);

        // Number(null) = 0 所以需要 _.isNull(v)
        if (
          !isNull(v) &&
          !Number.isNaN(_v) &&
          !isIn(_v, bandRange.minValue, bandRange.maxValue)
        ) {
          return Promise.reject(
            intl.formatMessage({
              id: "volume.field.readingAndWritingSpeed.validator.format",
              defaultMessage: "The speed must be an integer between 1 MB/s and 100 GB/s.",
            }),
          );
        }

        // 读写一起校验
        if (!_bandwidthMode) {
          const r = form.getFieldValue([`readBandwidth-${index}`]);
          const w = form.getFieldValue([`writeBandwidth-${index}`]);
          const _readBandwidth = parseNumber(Number(r.number), r.unit);
          const validR = isIn(
            _readBandwidth,
            bandRange.minValue,
            bandRange.maxValue,
          );
          const _writeBandwidth = parseNumber(Number(w.number), w.unit);
          const validW = isIn(
            _writeBandwidth,
            bandRange.minValue,
            bandRange.maxValue,
          );

          if (
            (_readBandwidth === 0 && validW) ||
            (_writeBandwidth === 0 && validR)
          ) {
            return Promise.resolve();
          }
        }

        return Promise.resolve();
      },
    };
  };

  const validIops = () => {
    return {
      validateTrigger: "onChange",
      validator(...[, value]: any[]) {
        const mode = form.getFieldValue([
          `iopsMode-${index}`,
        ]) as SetDiskQosType;

        const _iopsMode = mode === SetDiskQosType.SetIopsTotal;

        if (!_iopsMode) {
          const r = form.getFieldValue([`iopsRead-${index}`]);
          const w = form.getFieldValue([`iopsWrite-${index}`]);
          const _iopsRead = Number(r);
          const validR = _iopsRead > 0;
          const _iopsWrite = Number(w);
          const validW = _iopsWrite > 0;

          if ((_iopsRead === 0 && validW) || (_iopsWrite === 0 && validR)) {
            return Promise.resolve();
          }
        }

        // Number.isNaN(null) = false Number.isNaN(undefined) = false 所以需要 _.isNull(value)
        if (
          value !== "" &&
          !isNull(value) &&
          !isUndefined(value) &&
          !Number.isNaN(value) &&
          value < 16
        ) {
          return Promise.reject(
            intl.formatMessage({
              id: "volume.field.readingAndWritingIops.validator.format",
              defaultMessage: "The value must be equal to or greater than 16.",
            }),
          );
        }

        return Promise.resolve();
      },
    };
  };

  const validateEmpty = () => {
    return {
      required: true,
      validateTrigger: "onChange",
      validator() {
        return Promise.resolve();
      },
    };
  };

  const isIntegerWithUnit = async (
    _rule: any,
    value: { number?: string | number; unit?: string },
  ) => {
    if (
      value?.number === undefined ||
      value?.number === null ||
      value?.number === ""
    ) {
      return;
    }

    if (!isIntegerNumber(value.number)) {
      throw intl.formatMessage({
        id: "volume.field.qos.validator.format",
        defaultMessage: "Enter an integer.",
      });
    }

    return;
  };

  return (
    <Item noStyle>
      <Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev[`diskSharable-${index}`] !== curr[`diskSharable-${index}`]
        }
      >
        {() => {
          const diskShare = form.getFieldValue(`diskSharable-${index}`);

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
                    defaultMessage: "You cannot modify the Qos of a shared disk.",
                  })}
                >
                  <Switch size="small" checked={false} disabled={diskShare} />
                </Tooltip>
              ) : (
                <Switch size="small" checked={true} disabled={diskShare} />
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
              [`bandwidthMode-${index}`]: SetDiskQosType.SetBandwidthTotal,
              [`totalBandwidth-${index}`]: {
                number: undefined,
                unit: bandWidthUnitList[0],
              },
              [`iopsMode-${index}`]: SetDiskQosType.SetIopsTotal,
            };
            form.setFieldsValue(fields);
          }

          return turnOnQoS ? (
            <ZSVForm.Card showLine className={style.card}>
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
                {() => {
                  switch (form?.getFieldValue(`bandwidthMode-${index}`)) {
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
                          <InputUnit unitList={bandWidthUnitList} />
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
                            <InputUnit unitList={bandWidthUnitList} />
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
                            <InputUnit unitList={bandWidthUnitList} />
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
                  prev[`iopsMode-${index}`] !== curr[`iopsMode-${index}`]
                }
              >
                {() => {
                  switch (
                    form?.getFieldValue(`iopsMode-${index}`) as SetDiskQosType
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
                                validator: (rule, value) =>
                                  validateInteger(rule, value, intl),
                              },
                            ]}
                            noStyle
                          >
                            <Input
                              type="number"
                              min={16}
                              style={STYLE_WIDTH_80PX}
                            />
                          </Item>
                          <span style={STYLE_MARGIN_LEFT_8PX}>IOPS</span>
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
                                  validator: (rule, value) =>
                                    validateInteger(rule, value, intl),
                                },
                              ]}
                              noStyle
                            >
                              <Input
                                type="number"
                                min={16}
                                style={STYLE_WIDTH_80PX}
                              />
                            </Item>
                            <span style={STYLE_MARGIN_LEFT_8PX}>IOPS</span>
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
                                  validator: (rule, value) =>
                                    validateInteger(rule, value, intl),
                                },
                              ]}
                              noStyle
                            >
                              <Input
                                type="number"
                                min={16}
                                style={STYLE_WIDTH_80PX}
                              />
                            </Item>
                            <span style={STYLE_MARGIN_LEFT_8PX}>IOPS</span>
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
    </Item>
  );
};

export default React.memo(QoS);
