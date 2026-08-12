import { gql } from "@apollo/client";
import type { ResourceQueryType } from "@zstack/zsphere-types";
import { formatBytesToSize, isIP, isValidNetMask } from "@zstack/zsphere-utils";
import type { Rule, RuleObject } from "antd/es/form";
import { some, get } from "lodash-es";

import { IIsRequiredType } from "./type";

const useValidator = (intl: any): any => {
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
          defaultMessage: "This field is required.",
        });
        break;
      case IIsRequiredType.select:
        message = resourceName
          ? intl.formatMessage(
              {
                id: "global.field.validator.select.withResource.required",
                defaultMessage: "Select {resourceName}.",
              },
              { resourceName },
            )
          : intl.formatMessage({
              id: "global.field.validator.select.required",
              defaultMessage: "This field is required.",
            });
        break;
      case IIsRequiredType.inputWithUnit:
        message = intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "This field is required.",
        });
        return {
          required: true,
          message,
          transform: (val: { number: number; unit: string }) => val.number,
          type: "number",
        };
      case IIsRequiredType.checkboxGroup:
        return {
          required: true,
          message: intl.formatMessage({
            id: "global.field.validator.checkboxGroup.required",
            defaultMessage: "This field is required.",
          }),
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
        defaultMessage: "This field is required.",
      }),
      whitespace: true,
    };
  };

  const isValidNameString = (): RuleObject => {
    // [a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+ 可以重复一次或者多次，表示：'输入内容只能包含中文汉字、英文字母、数字和以下 7 种英文字符“-”、“_”、“.”、“(”、“)”、“:”、“+”'
    // (\s+[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+)* 可以重复零次和多次，表示：'输入内容只能包含中文汉字、英文字母、数字和以下 7 种英文字符“-”、“_”、“.”、“(”、“)”、“:”、“+”'，并且以空格开头

    return {
      type: "string",
      pattern:
        /^[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+(\s+[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+)*$/, // 中间允许有空格，两边不准有空格
      // pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+$/,
      message: intl.formatMessage({
        id: "global.field.validator.input.valid",
        defaultMessage:
          "A name can contain Chinese characters, letters, digits, spaces, hyphens (-), underscores (_), periods (.), parenthesis (), colons (:), and plus signs (+) and cannot begin or end with spaces.",
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
          "The name can contain Chinese characters, English letters, digits, spaces, and the following characters: ()（）【】@._-+.",
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
          "The name must be 2-128 characters in length and can contain only periods (.), underscores (_), hyphens (-), and colons (:). Note that the name cannot start with special characters or numbers.",
      }),
    };
  };

  /**
   * 字符串长度限制
   */
  const lengthRange = (min: number = 1, max: number): Rule => {
    return {
      type: "string",
      min,
      max,
      message: intl.formatMessage(
        {
          id: "global.field.validator.lengthRange",
          defaultMessage: "This field must be {min}–{max} characters in length.",
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
          defaultMessage: "Allowed range: {min}–{max}.",
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
                  defaultMessage: "This field must be greater than {num}.",
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
                defaultMessage: "Invalid JSON.",
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
  const sizeRange = (min: number = 0, max: number): Rule => {
    return {
      ...numberRange(min, max),
      message: intl.formatMessage(
        {
          id: "global.field.validator.sizeRange",
          defaultMessage: "Valid size range: {min}–{max}.",
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
            defaultMessage: "Invalid IPv4 IP address.",
          })
        : intl.formatMessage({
            id: "l3Network.field.ipv6Ip.validator.format",
            defaultMessage: "Invalid IPv6 IP address.",
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
   * 校验 子网掩码
   */
  const netmaskValidator = () => {
    return {
      validator: (rule: any, value: any) =>
        !value || isValidNetMask(value)
          ? Promise.resolve()
          : Promise.reject(
              Error(
                intl.formatMessage({
                  id: "l3Network.field.netmask.validator.format",
                  defaultMessage: "Invalid netmask.",
                }),
              ),
            ),
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
                  defaultMessage: "Invalid {resource}.",
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
                  defaultMessage: "Invalid {resource}.",
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

  // const validatorUniqName = (
  //   resourceType: ResourceQueryType,
  //   originName?: string,
  //   message?: string,
  //   caseSensitive?: boolean
  // ) => {
  //   return {
  //     validator: async (__: Rule, value: any) => {
  //       if (!value) {
  //         return Promise.resolve()
  //       }

  //       if (originName && originName === value) return Promise.resolve()

  //       const res = await window.g_main.apolloClient.query({
  //         query: caseSensitive ? queryResourceList : queryResourceCount,
  //         variables: {
  //           type: resourceType,
  //           conditions: [
  //             {
  //               key: 'name',
  //               value
  //             }
  //           ]
  //         }
  //       })

  //       if (caseSensitive) {
  //         return _.some(_.get(res, ['data', 'resourceList', 'list']), ['name', value])
  //           ? Promise.reject(
  //               message ??
  //                 intl.formatMessage({
  //                   id: 'name.validate.should.be.uniq',
  //                   defaultMessage: '名称不能和已有的重复'
  //                 })
  //             )
  //           : Promise.resolve()
  //       }

  //       return res?.data?.resourceCount?.total === 0
  //         ? Promise.resolve()
  //         : Promise.reject(
  //             message ??
  //               intl.formatMessage({
  //                 id: 'name.validate.should.be.uniq',
  //                 defaultMessage: '名称不能和已有的重复'
  //               })
  //           )
  //     }
  //   }
  // }

  const validatorUniqName = (
    resourceType: ResourceQueryType,
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

        try {
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

          const isNameUnique = caseSensitive
            ? !some(get(res, ["data", "resourceList", "list"]), ["name", value])
            : res?.data?.resourceCount?.total === 0;

          if (!isNameUnique) {
            const errorMessage =
              message ??
              intl.formatMessage({
                id: "name.validate.should.be.uniq",
                defaultMessage: "The name cannot duplicate existing ones.",
              });
            return Promise.reject(errorMessage);
          }
        } catch (error) {
          console.error("Error occurred during name validation:", error);
          const errorMessage = "校验名称失败，请稍后再试";
          return Promise.reject(errorMessage);
        }

        return;
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

  const longDescriptionRules = [lengthRange(1, 2000)];

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
    regexChecker,
    commonValidatorChecker,
    commonRegexChecker,
    ipValidator,
    netmaskValidator,
    commonAliyunNameRules,
    commonNameRules,
    commonDescriptionRules,
    longDescriptionRules,
    validatorUniqName,
  };
};

export default useValidator;
