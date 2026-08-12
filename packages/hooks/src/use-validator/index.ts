import { gql } from "@apollo/client";
import { formatBytesToSize, isIP } from "@zstack/utils";
import * as _ from "lodash-es";

import type { Rule, RuleObject } from "./type";
import { IIsRequiredType } from "./type";

// 直接使用 string 类型，避免依赖 @zstack/types
type ResourceQueryType = string;

export const useValidator = (intl: any) => {
  /**
   * 默认使用 rules = [{ required: true }] 默认显示 请输入$label
   * 需要自定义文案名字时使用这个方法
   * resourceName 用于需要指定展示选择label时使用
   */
  const isRequired = (
    type: IIsRequiredType = IIsRequiredType.input,
    resourceName?: string,
  ): RuleObject => {
    let message = "";
    switch (type) {
      case IIsRequiredType.input:
        message = intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "输入内容不能为空",
        });
        break;
      case IIsRequiredType.select:
        message = resourceName
          ? intl.formatMessage(
              {
                id: "global.field.validator.select.withResource.required",
                defaultMessage: "请选择{resourceName}",
              },
              { resourceName },
            )
          : intl.formatMessage({
              id: "global.field.validator.select.required",
              defaultMessage: "选择不能为空",
            });
        break;
      case IIsRequiredType.inputWithUnit:
        message = intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "输入内容不能为空",
        });
        return {
          required: true,
          message,
          transform: (val: { number: number; unit: string }) => val.number,
          type: "number",
        };
    }
    return {
      required: true,
      message,
    };
  };

  const isRequiredString = (): RuleObject => {
    return {
      required: true,
      message: intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "输入内容不能为空",
      }),
      whitespace: true,
    };
  };

  const isValidNameString = (): RuleObject => {
    // [a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+ 可以重复一次或者多次，表示：'输入内容只能包含中文汉字、英文字母、数字和以下 7 种英文字符“-”、“_”、“.”、“(”、“)”、“:”、“+”'
    // (\s+[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+)* 可以重复零次和多次，表示：'输入内容只能包含中文汉字、英文字母、数字和以下 7 种英文字符“-”、“_”、“.”、“(”、“)”、“:”、“+”'，并且以空格开头

    if (!_.includes(["zh-CN", "zh-TW", "en-US"], intl.locale)) {
      return {
        type: "string",
        pattern: /^(?!\s*$)[^\s].*[^\s]$/,
        message: intl.formatMessage({
          id: "global.field.validator.input.no.leading.trailing.spaces",
          defaultMessage: "输入内容不能全是空格，首尾也不能有空格",
        }),
      };
    }

    return {
      type: "string",
      pattern:
        /^[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()/]+(\s+[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()/]+)*$/, // 中间允许有空格，两边不准有空格
      // pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+$/,
      message: intl.formatMessage({
        id: "global.field.validator.input.valid",
        defaultMessage:
          "输入内容只能包含中文汉字、英文字母、数字和以下 7 种英文字符“-”、“_”、“.”、“(”、“)”、“:”、“+”",
      }),
    };
  };

  const isValidVmGroupNameString = (): RuleObject => {
    return {
      type: "string",
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s()（）【】@._+-]+$/,
      message: intl.formatMessage({
        id: "global.field.validator.vm.group.input.valid",
        defaultMessage:
          "输入内容只能包含中文汉字、英文字母、数字、空格和以下字符()（）【】@._-+",
      }),
    };
  };

  const isValidAliyunNameString = (): RuleObject => {
    return {
      type: "string",
      pattern: /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5\-_.:]+$/,
      message: intl.formatMessage({
        id: "global.field.esc.name.hover",
        defaultMessage:
          "长度为2～128个字符，不能以特殊字符及数字开头，只可包含特殊符号中的点号（.）、下划线（_）、连字符（-）和半角冒号（:）。",
      }),
    };
  };

  /**
   * 字符串长度限制
   */
  const lengthRange = (min: number = 1, max: number): RuleObject => {
    return {
      type: "string",
      min,
      max,
      message: intl.formatMessage(
        {
          id: "global.field.validator.lengthRange",
          defaultMessage: "输入内容需在{min}~{max}字符范围内",
        },
        {
          min,
          max,
        },
      ),
    };
  };

  /**
   * 数字大小限制
   */
  const numberRange = (
    min: number = 1,
    max: number,
    type: RuleObject["type"] = "number",
  ): RuleObject => {
    return {
      type,
      transform: (v: string) => Number(v),
      min,
      max,
      message: intl.formatMessage(
        {
          id: "global.field.validator.numberRange",
          defaultMessage: "输入内容需在{min}~{max}范围内",
        },
        {
          min,
          max,
        },
      ),
    };
  };

  /**
   * 大于
   */
  const greatThan = (num: number = 0, formatter?: Function) => {
    return {
      validator: (__: Rule, value: any) => {
        const checkValue = formatter ? formatter(value) : Number(value);
        if (checkValue <= num) {
          return Promise.reject(
            new Error(
              intl.formatMessage(
                {
                  id: "global.field.validator.greatThan",
                  defaultMessage: "输入内容需大于{num}",
                },
                {
                  num,
                },
              ),
            ),
          );
        }
        return Promise.resolve();
      },
    };
  };

  /**
   * 校验字符串是否是合法的json
   */
  const validJsonParse = () => {
    return {
      validator: (__: Rule, value: any) => {
        try {
          JSON.parse(value);
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(
            new Error(
              intl.formatMessage({
                id: "global.field.validator.validJsonParse",
                defaultMessage: "不合法的JSON",
              }),
            ),
          );
        }
      },
    };
  };

  /**
   * 尺寸大小限制
   */
  const sizeRange = (min: number = 0, max: number): RuleObject => {
    return {
      ...numberRange(min, max),
      message: intl.formatMessage(
        {
          id: "global.field.validator.sizeRange",
          defaultMessage: "输入内容需在{min}~{max}范围内",
        },
        {
          min,
          max: formatBytesToSize(max),
        },
      ),
    };
  };

  /**
   * 校验 ip
   */
  const ipValidator = (ipVersion: number = 4) => {
    // const validatorFn = ipVersion === 4 ? isIP : isIPV6IP
    const errorMsg =
      ipVersion === 4
        ? intl.formatMessage({
            id: "l3Network.field.ipv4Ip.validator.format",
            defaultMessage: "无效的Ipv4 IP地址",
          })
        : intl.formatMessage({
            id: "l3Network.field.ipv6Ip.validator.format",
            defaultMessage: "无效的Ipv6 IP地址",
          });
    return {
      validator: (__: Rule, value: any) => {
        if (value && !isIP(value, ipVersion as 4)) {
          return Promise.reject(new Error(errorMsg));
        }
        return Promise.resolve();
      },
    };
  };

  /**
   * 校验整数
   */
  const integerValidator = () => {
    return {
      validator: async (_rule: Rule, value: number | string) => {
        if (!value) {
          return;
        }

        if (!_.isInteger(+value)) {
          throw intl.formatMessage({
            id: "block.volume.field.qos.validator.format",
            defaultMessage: "请输入整数",
          });
        }

        return;
      },
    };
  };

  /**
   * 校验带单位的整数
   */
  const integerWithUnitValidator = () => {
    return {
      validator: async (
        _rule: Rule,
        value: { number?: number | string; unit?: string },
      ) => {
        if (
          value?.number === undefined ||
          value?.number === null ||
          value?.number === ""
        ) {
          return;
        }

        if (!_.isInteger(value.number)) {
          throw intl.formatMessage({
            id: "block.volume.field.qos.validator.format",
            defaultMessage: "请输入整数",
          });
        }

        return;
      },
    };
  };

  /**
   * 根据 validator 函数校验
   */
  const commonValidatorChecker = (
    validatorFn: Function,
    resource: string = "",
    extraParam: any[] = [],
  ) => {
    return {
      validator: (__: Rule, value: any) => {
        if (!validatorFn(value, ...extraParam)) {
          return Promise.reject(
            new Error(
              intl.formatMessage(
                {
                  id: "rules.invalid",
                  defaultMessage: "无效的{resource}",
                },
                {
                  resource,
                },
              ),
            ),
          );
        }
        return Promise.resolve();
      },
    };
  };

  /**
   * 自定义 message validator 函数校验
   */
  const validatorChecker = (
    validatorFn: Function,
    message: string = "",
    extraParam: any[] = [],
  ) => {
    return {
      validator: (__: Rule, value: any) => {
        if (!validatorFn(value, ...extraParam)) {
          return Promise.reject(new Error(message));
        }
        return Promise.resolve();
      },
    };
  };

  /**
   * 正则匹配
   */
  const commonRegexChecker = (reg: RegExp, resource: string = "") => {
    return {
      validator: (__: Rule, value: any) => {
        if (!reg.test(value)) {
          return Promise.reject(
            new Error(
              intl.formatMessage(
                {
                  id: "rules.invalid",
                  defaultMessage: "无效的{resource}",
                },
                {
                  resource,
                },
              ),
            ),
          );
        }
        return Promise.resolve();
      },
    };
  };

  /**
   * 自定义 message 正则匹配
   */
  const regexChecker = (reg: RegExp, message: string = "") => {
    return {
      validator: (__: Rule, value: any) => {
        if (!reg.test(value)) {
          return Promise.reject(new Error(message));
        }
        return Promise.resolve();
      },
    };
  };

  // 资源名唯一
  const queryResourceCount = gql`
    query resourceCount($conditions: [Condition!], $type: ResourceQueryType!) {
      resourceCount(conditions: $conditions, type: $type) {
        total
      }
    }
  `;

  // 资源名唯一
  const queryResourceList = gql`
    query resourceList($conditions: [Condition!], $type: ResourceQueryType!) {
      resourceList(conditions: $conditions, type: $type) {
        list {
          name
          uuid
        }
        total
      }
    }
  `;

  const validatorUniqName = (
    resourceType: string,
    originName?: string,
    message?: string,
    caseSensitive?: boolean,
  ) => {
    return {
      validator: async (__: Rule, value: any) => {
        if (!value) {
          return;
        }

        if (originName && originName === value) {
          return;
        }

        const res = await window.g_main.apolloClient.query({
          query: caseSensitive ? queryResourceList : queryResourceCount,
          variables: {
            type: resourceType,
            conditions: [
              {
                key: "name",
                value,
              },
            ],
          },
        });

        if (caseSensitive) {
          return _.some(_.get(res, ["data", "resourceList", "list"]), [
            "name",
            value,
          ])
            ? Promise.reject(
                message ??
                  intl.formatMessage({
                    id: "name.validate.should.be.uniq",
                    defaultMessage: "名称不能和已有的重复",
                  }),
              )
            : Promise.resolve();
        }

        return res?.data?.resourceCount?.total === 0
          ? Promise.resolve()
          : Promise.reject(
              message ??
                intl.formatMessage({
                  id: "name.validate.should.be.uniq",
                  defaultMessage: "名称不能和已有的重复",
                }),
            );
      },
    };
  };

  const commonNameRules = [
    isRequiredString(),
    lengthRange(1, 128),
    isValidNameString(),
  ];

  const commonAliyunNameRules = [
    isRequiredString(),
    lengthRange(2, 256),
    isValidAliyunNameString(),
  ];

  const commonDescriptionRules = [lengthRange(1, 256)];

  return {
    isRequired,
    isRequiredString,
    isValidNameString,
    isValidVmGroupNameString,
    lengthRange,
    numberRange,
    greatThan,
    validJsonParse,
    sizeRange,
    validatorChecker,
    integerWithUnitValidator,
    regexChecker,
    commonValidatorChecker,
    commonRegexChecker,
    ipValidator,
    integerValidator,
    commonAliyunNameRules,
    commonNameRules,
    commonDescriptionRules,
    validatorUniqName,
  };
};
