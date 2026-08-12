import type { ValueProps } from "@zstack/zsphere-components";
import { compareBigNumbers, isPowerOfTwo } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";
import { useIntl } from "react-intl";

export const useValidator = () => {
  const intl = useIntl();

  const validSharedblockUtilizationPercent = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 输入内容应该为整数数字，设置数值在[1%, 100%]之间
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _.inRange(_number, 1, 101)) {
      return;
    }

    throw intl.formatMessage({
      id: "setting.value.range.one.to.One.hundred.percent",
      defaultMessage: "Enter an integer that ranges from 1 to 100.",
    });
  };

  const validaKVMTestSshPortOpenTimeout = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 输入内容应该为整数数字，设置数值在[0, 3600]秒之间
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _.inRange(_number, 0, 3601)) {
      return;
    }

    throw intl.formatMessage({
      id: "setting.value.range.one.to.three.thousand.and.six.hundred.second",
      defaultMessage: "Enter an integer. The time period shall range from 0 second to 3,600 seconds.",
    });
  };

  const validReservedCapacity = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值在[1B, 1TB]之间
    let _number = Number(value?.number) || 0;

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    const _unit = value?.unit;
    switch (_unit) {
      case "B":
        break;
      case "K":
        _number *= 1024;
        break;
      case "M":
        _number = _number * 1024 * 1024;
        break;
      case "G":
        _number = _number * 1024 * 1024 * 1024;
        break;
      case "T":
        _number = _number * 1024 * 1024 * 1024 * 1024;
        break;
      default:
        break;
    }
    if (
      _.isInteger(_number) &&
      _number >= 1 &&
      _number <= 1 * 1024 * 1024 * 1024 * 1024
    ) {
      return;
    }
    throw intl.formatMessage({
      id: "reserved.capacity.validate.range",
      defaultMessage: "Enter an integer. The size shall range from 1 B to 1 TB.",
    });
  };

  // UI界面批量创建云主机最大数量
  const validateUIVmCreateLimitNum = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值在[1, 10000]之间
    const _number = Number(value?.number);

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _.inRange(_number, 1, 10001)) {
      return;
    }

    throw intl.formatMessage({
      id: "setting.value.range.one.to.10000",
      defaultMessage: "Enter an integer that ranges from 1 to 10,000.",
    });
  };

  const validHaHostCheckSuccessRatio = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 输入内容应该为整数数字，设置数值在[1, 99]之间
    const _number = Number(value?.number);

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _.inRange(_number, 1, 100)) {
      return;
    }

    throw intl.formatMessage({
      id: "setting.value.range.one.to.99",
      defaultMessage: "Enter an integer that ranges from 1 to 99.",
    });
  };

  // ApiTimeout
  const validApiTimeout = async (_rule: any, value: ValueProps) => {
    // 大于5*60=300的整数
    const _value = Number(value?.number);
    const _unit = value?.unit;
    let _number = _value;
    switch (_unit) {
      case "s":
        _number = _value;
        break;
      case "m":
        _number = _value * 60;
        break;
      case "h":
        _number = _value * 60 * 60;
        break;
      case "d":
        _number = _value * 60 * 60 * 24;
        break;
      default:
        _number = _value;
    }

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 300) {
      return;
    }

    throw intl.formatMessage({
      id: "apiTimeout.validate.five.minutes",
      defaultMessage: "Enter an integer. The timeout period shall be equal to or greater than five minutes.",
    });
  };

  const validTenToOneThousand = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值在[10, 1000]之间
    const _number = Number(value?.number);

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (
      value?.number !== undefined &&
      _.isInteger(_number) &&
      _.inRange(_number, 10, 1001)
    ) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.TenToOneThousand",
      defaultMessage: "Enter an integer that ranges from 10 to 1,000.",
    });
  };

  const validZeroSeconds = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于0秒
    const _number = Number(value?.number);

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.zero.seconds",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    });
  };

  const validMinusOneSeconds = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于-1秒
    const _number = Number(value?.number);

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.MinusOne.seconds",
      defaultMessage: "Enter an integer equal to or greater than -1.",
    });
  };

  const validOneSeconds = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于1秒
    const _number = Number(value?.number);

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 1) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.one.seconds",
      defaultMessage: "Enter an integer that is equal to or greater than 1.",
    });
  };

  const validExpungeInterval = async (_rule: any, value: ValueProps) => {
    // 设置时间在[1小时, 1天]之间
    const _value = Number(value?.number);

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 25)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.expunge.interval.seconds",
      defaultMessage: "Input should be an integer number, set time within [1, 24] hours.",
    });
  };

  const validDeletePolicySeconds = async (_rule: any, value: ValueProps) => {
    // 设置时间在[1小时, 30天]之间
    const _value = Number(value?.number);
    const _unit = value?.unit;
    let _number = _value;
    switch (_unit) {
      case "s":
        _number = _value;
        break;
      case "m":
        _number = _value * 60;
        break;
      case "h":
        _number = _value * 60 * 60;
        break;
      case "d":
        _number = _value * 60 * 60 * 24;
        break;
      default:
        _number = _value;
    }

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _.inRange(_number, 3600, 2592001)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.delete.policy.seconds",
      defaultMessage: "Enter an integer. The time period shall range from 1 hour to 30 days.",
    });
  };

  // 监控数据保留周期
  const validRangeMonth = async (_rule: any, value: ValueProps) => {
    // 1-12 的整数
    const _value = Number(value?.number);

    if (value?.number === undefined || value?.number === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 13)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.range.month",
      defaultMessage: "Enter an integer that ranges from 1 to 12.",
    });
  };

  const validZeroIndividual = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于0个
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.zero",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    });
  };

  const validLoadBalancerMaxConnection = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 输入内容应该为整数数字[1,2000000]
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (
      value?.number !== undefined &&
      _.isInteger(_number) &&
      _.inRange(_number, 1, 2000001)
    ) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.loadBalancer.maxConnection.range",
      defaultMessage: "Enter an integer that ranges from 1 to 2000,000.",
    });
  };

  const validOneIndividual = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于1个
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 1) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.one",
      defaultMessage: "Enter an integer that is equal to or greater than 1.",
    });
  };

  const validTwoIndividual = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于2个
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 2) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.two",
      defaultMessage: "Enter an integer that is equal to or greater than 2.",
    });
  };

  const validZeroTimes = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于0次
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.zero.times",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    });
  };

  const validOneTimes = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于1
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 1) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.one.times",
      defaultMessage: "Enter an integer that is equal to or greater than 1.",
    });
  };

  const validThreeTimes = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于1次
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 3) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.three.times",
      defaultMessage: "Enter an integer that is equal to or greater than 3.",
    });
  };

  // Keepalived心跳包发送时间间隔
  const validVpcHaKeepalivedInterval = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 1-60 的整数
    const _number = value?.number;
    const _value = Number(_number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 61)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.vpcHa.keepalived.interval.validate.range",
      defaultMessage: "Enter an integer that ranges from 1 to 60.",
    });
  };

  const validCountOneTiao = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于1条
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 1) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.one.tiao",
      defaultMessage: "Enter an integer that is equal to or greater than 1.",
    });
  };

  const validCountZeroTiao = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于0
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.zero.tiao",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    });
  };

  const validZeroThread = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于0线程
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.zero.thread",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    });
  };

  const validZeroCountTai = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于0台
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.zero.count.tai",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    });
  };

  // 云主机并发创建数量
  const validKvmVmCreateConcurrency = async (_rule: any, value: ValueProps) => {
    // 1-10 的整数
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 11)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.kvm.vm.createConcurrency.range",
      defaultMessage: "Enter an integer that ranges from 1 to 10.",
    });
  };

  const validWithinTwoToMaxIntegerRange = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 2-2147483647 的整数
    const MIN = 2;
    const MAX_INTEGER = 2147483647; // java.lang.Integer 的最大值

    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, MIN, MAX_INTEGER + 1)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.integerInRangeTwoToMaxInteger",
      defaultMessage: "Input value should be an integer number, set within the range [2, 2147483647].",
    });
  };

  const validWithinOneToMaxIntegerRange = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 1-2147483647 的整数
    const MIN = 1;
    const MAX_INTEGER = 2147483647; // java.lang.Integer 的最大值

    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, MIN, MAX_INTEGER + 1)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.integerInRangeOneToMaxInteger",
      defaultMessage: "Input content should be an integer number, set value within [1, 2147483647].",
    });
  };

  const validWithinZeroToMaxIntegerRange = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 0-2147483647 的整数
    const MIN = 0;
    const MAX_INTEGER = 2147483647; // java.lang.Integer 的最大值

    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, MIN, MAX_INTEGER + 1)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.integerInRangeZeroToMaxInteger",
      defaultMessage: "Input content should be an integer number, set the value within [0, 2147483647].",
    });
  };

  const validateIntegerInRangeZeroTo180 = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 0-180 的整数
    const MIN = 0;
    const MAX_INTEGER = 180;

    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, MIN, MAX_INTEGER + 1)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.integerInRangeZeroTo180",
      defaultMessage: "Input content should be integer numbers, set value within [0, 180] range.",
    });
  };

  const validOneDay = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于1天
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (
      _.isInteger(_number) &&
      _number >= 1 &&
      compareBigNumbers(
        String(Number.MAX_SAFE_INTEGER),
        String(value?.number),
      ) >= 0
    ) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.one.day",
      defaultMessage: "Enter an integer that is equal to or greater than 1.",
    });
  };

  const validOneHundredYears = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于1天
    // 104249991 * 24 * 60 * 60 * 1000 接近 Number.MAX_SAFE_INTEGER
    // 这里定义一百年即可 365 * 100 = 36500
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _.inRange(_number, 1, 36501)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.one.day.and.greater.than.OneHundredYears",
      defaultMessage: "Input content should be an integer number, set the value within [1, 36500].",
    });
  };

  const validOneByte = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于1字节
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 1) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.one.byte",
      defaultMessage: "Enter an integer that is equal to or greater than 1.",
    });
  };

  const validIsPowerOfTwo = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于1字节，并且数字是2的幂次
    const _number = Number(value?.number);
    const _unit = value?.unit as string;

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 1 && isPowerOfTwo(_number)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.one.byte.and.Power.of.two",
      defaultMessage:
        "Enter an integer that is greater than 1 and is the power of 2.",
    });
  };

  const validZeroByte = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于0字节
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (value?.number !== undefined && _.isInteger(_number) && _number >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.zero.byte",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    });
  };

  const validSharedblockInitializeSize = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 输入内容应该为整数数字，设置数值不得小于1GB
    const _number = Number(value?.number);
    let _value = _number;
    const _unit = value?.unit;
    switch (_unit) {
      case "M":
        _value = _value * 1024 * 1024;
        break;
      case "G":
        _value = _value * 1024 * 1024 * 1024;
        break;
      case "T":
        _value = _value * 1024 * 1024 * 1024 * 1024;
        break;
    }

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _value >= 1073741824) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.setting.value.shall.not.be.less.than.one.GB",
      defaultMessage: "Enter an integer. The size shall be no smaller than 1 GB.",
    });
  };

  const validDrsSchedulingInterval = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于300秒
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 300) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.drs.scheduling.interval.three.hundred.seconds",
      defaultMessage: "Enter an integer. The time period shall be no smaller than 300 seconds.",
    });
  };

  // 物理机分配器运行并发度
  const validHostAllocatorConcurrentLevel = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 1-255 的整数
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 256)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.host.allocator.concurrent.level.range",
      defaultMessage: "Enter an integer that ranges from 1 to 255.",
    });
  };

  const validHostCpuOverProvisioningRatio = async (
    _rule: any,
    value: string | number,
  ) => {
    // 输入内容应该为整数数字，设置数值在[1, 1000]之间
    const _number = Number(value);

    if (value === "" || value === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _.inRange(_number, 1, 1001)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.host.cpu.over.provisioning.ratio.range",
      defaultMessage: "Enter an integer that ranges from 1 to 1,000.",
    });
  };

  // 批量导入租户最大数量
  const validMaximumNumberOfImportedUsers = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 1-10000 的整数
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 10001)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.iam2.maximumNumberOfImportedUsers.range",
      defaultMessage: "Enter an integer that ranges from 1 to 10,000.",
    });
  };

  // 用户登录会话超时时间
  const validIdentitySessionTimeout = async (_rule: any, value: ValueProps) => {
    // 10m-30天 的整数
    // 600-2592000
    const number = value?.number;

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    const unit = value?.unit;
    let _value = 0;
    switch (unit) {
      case "s":
        _value = Number(number);
        break;
      case "m":
        _value = Number(number) * 60;
        break;
      case "h":
        _value = Number(number) * 60 * 60;
        break;
      case "d":
        _value = Number(number) * 60 * 60 * 24;
        break;
    }

    if (_.isInteger(_value) && _.inRange(_value, 600, 2592001)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.identity.session.timeout.range",
      defaultMessage: "Enter an integer. The time period shall range from 10 minutes to 30 days.",
    });
  };

  // kvm云主机可挂载的最大云盘数量
  const validKvmDataVolumeMaxNum = async (_rule: any, value: ValueProps) => {
    // 1-24 的整数
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 25)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.kvm.dataVolume.maxNum.range",
      defaultMessage: "Enter an integer that ranges from 1 to 24.",
    });
  };

  const validChassis2MaxNumber = async (_rule: any, value: ValueProps) => {
    // 1-500 的整数
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 501)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.Chassis2.maxNum.range",
      defaultMessage: "Enter an integer that ranges from 1 to 500.",
    });
  };

  const validLessThanOrEqualToOneWithoutUnit = async (
    _rule: any,
    value: string | number,
  ) => {
    // 输入内容应该为整数数字，设置数值不得小于1
    const _number = Number(value);

    if (value === "" || value === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 1) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.less.than.or.equal.to.one",
      defaultMessage: "Enter an integer that is equal to or greater than 1.",
    });
  };

  // MTU取值
  const validL2networkDefaultDhcpMtu = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // [68，65536] 的整数
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }
    console.log(_.inRange(_value, 68, 65537));
    if (_.isInteger(_value) && _.inRange(_value, 68, 65537)) {
      return;
    }

    throw intl.formatMessage({
      id: "virtualRouter.l2network.defaultDhcp.validate.mtu.range",
      defaultMessage: "Input content should be an integer number, set value between [68, 65536].",
    });
  };

  const validAuditRetentionDuration = async (
    rule: any,
    value?: string | number | null,
  ) => {
    if (value === "" || value === null || value === undefined) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }
    const num = Number(value);
    if (_.isInteger(num) && _.inRange(num, 1, 366)) {
      return;
    }
    throw intl.formatMessage({
      id: "globalConfig.validate.audit.retention.duration.range",
      defaultMessage: "Input should be an integer number, set value within [1, 365].",
    });
  };

  // 超分率
  const validOverProvisioning = async (_rule: any, value: string | number) => {
    if (value === "" || value === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (Number(value) >= 1.0 && Number(value) <= 1000.0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.mevoco.overProvisioning.range",
      defaultMessage: "Enter a number that ranges from 1.00 to 1,000.00.",
    });
  };

  // 主存储使用阈值
  const validPSCapacity = async (_rule: any, value: string | number) => {
    const primaryStoragePhysicalCapacityReg =
      /^(0\.\d{1,4})$|^(1\.0{0,4})$|^1$/;
    const numberValue = Number(value);

    if (value === "" || value === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (
      primaryStoragePhysicalCapacityReg.test(String(value)) &&
      numberValue > 0 &&
      numberValue <= 1
    ) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.mevoco.threshold.primaryStorage.physicalCapacity.range",
      defaultMessage: "Enter a number that ranges from 0 to 1.",
    });
  };

  const validCollectHostDataDuration = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // [0,24*3600] 的整数
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 0, 24 * 3600 + 1)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.premiumHostAllocator.minimumCPUUsageHostAllocatorStrategy.collectHostDataDuration.range",
      defaultMessage: "Enter an integer. The time period shall range from 0 second to 1 day.",
    });
  };

  const validV2VCacheRetention = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于10800秒
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 10800) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.v2v.cacheRetention.seconds",
      defaultMessage: "Enter an integer. The time period shall be no smaller than 10,800 seconds.",
    });
  };

  const validThirtySeconds = async (_rule: any, value: ValueProps) => {
    // 输入内容应该为整数数字，设置数值不得小于30秒
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 30) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.setting.value.shall.not.be.less.than.thirty.seconds",
      defaultMessage: "Enter an integer that is equal to or greater than 30.",
    });
  };

  const validPSCapacityPredict = async (_rule: any, value: string | number) => {
    const primaryStoragePhysicalCapacityReg =
      /^(0\.\d{1,2})$|^(1\.0{0,2})$|^1$/;
    const numberValue = Number(value);

    if (value === "" || value === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (
      primaryStoragePhysicalCapacityReg.test(String(value)) &&
      numberValue > 0 &&
      numberValue <= 1
    ) {
      return;
    }

    throw intl.formatMessage({
      id: "globalConfig.validate.primaryStorage.used.physicalCapacity.forecast.threshold.range",
      defaultMessage: "Enter a digit bigger than 0 and no bigger than 1.",
    });
  };

  const validvCenterSyncInterval = async (_rule: any, value: ValueProps) => {
    const _value = Number(value?.number);
    const _unit = value?.unit;
    let _number = _value;
    switch (_unit) {
      case "s":
        _number = _value;
        break;
      case "m":
        _number = _value * 60;
        break;
      case "h":
        _number = _value * 60 * 60;
        break;
      case "d":
        _number = _value * 60 * 60 * 24;
        break;
    }

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 3600) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.vcenter.vcenter.sync.interval.range",
      defaultMessage: "Enter an integer. The time period shall be no smaller than 3,600 seconds.",
    });
  };

  const validVolumeRefreshVolumeSizeInterval = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 输入内容应该为整数数字，设置数值不得小于600秒
    const _number = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_number) && _number >= 600) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.volume.refreshVolumeSizeInterval.six.hundred.seconds",
      defaultMessage: "Enter an integer. The time period shall be no smaller than 600 seconds.",
    });
  };

  // zsnp协议的老化时间
  const validVpcZsnpTimeout = async (_rule: any, value: ValueProps) => {
    // 大于30的整数
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _value >= 30) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.vpc.zsnp.timeout.thirty.seconds",
      defaultMessage: "Enter an integer that is equal to or greater than 30.",
    });
  };

  //报警消息总数量缓存留存时限
  const validZwatchCountCacheExpireSecTime = async (
    _rule: any,
    value: ValueProps,
  ) => {
    const _value = Number(value?.number);
    //最小为0的整数

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _value >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.zwatch.countCacheExpireSecTime.input",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    });
  };

  const validZwatchMinimumCountAmountAllowedAddedToCache = async (
    _rule: any,
    value: ValueProps,
  ) => {
    const _value = Number(value?.number);
    //最小为0的整数

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _value >= 0) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.zwatch.minimumCountAmountAllowedAddedToCache.input",
      defaultMessage: "Enter an integer that is equal to or greater than 0.",
    });
  };

  // 监控数据采样时间间隔
  const validZwatchScrapeInterval = async (_rule: any, value: ValueProps) => {
    // 大于9的整数
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _value >= 9) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.zwatch.scrape.interval.nine.seconds",
      defaultMessage: "Enter an integer. The time period shall be no smaller than 9 seconds.",
    });
  };

  const validRequired = async (_rule: any, value: string) => {
    if (_.isEmpty(_.trim(value))) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }
    return;
  };

  const validVirtualRouterVrouterPassword = async (
    _rule: any,
    value: string,
  ) => {
    if (_.isEmpty(_.trim(value))) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    const _Reg = /^[a-zA-Z0-9]{1}([a-zA-Z0-9]|[-_#]){5,19}$/;
    if (!_Reg.test(value)) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.virtualRouter.Vrouter.Password",
        defaultMessage:
          "The password must be 6 to 20 characters in length and can only contain digits, letters, hyphens (-), underscores (_), and number signs (#). The password must start with letters or digits.",
      });
    }

    return;
  };

  // SSH端口
  const validVirtualRouterSSHPort = async (
    _rule: any,
    value: string | number,
  ) => {
    // [0，65535] 的整数
    const _value = Number(value);

    if (value === "" || value === null) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 0, 65536)) {
      return;
    }

    throw intl.formatMessage({
      id: "virtualRouter.ssh.port.validate.port.range",
      defaultMessage: "Enter an integer that ranges from 0 to 65,535.",
    });
  };

  const validPasswordStrategyPeriod = async (_rule: any, value: ValueProps) => {
    // 1-999
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 1000)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.password.strategy.period.range",
      defaultMessage: "Enter a number that ranges from 1 to 999.",
    });
  };

  const validPasswordStrategyHistoricalNum = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 3-32
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 3, 33)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.password.strategy.historical.num.range",
      defaultMessage: "Enter a number that ranges from 3 to 32.",
    });
  };

  const validPasswordStrategyLockLoginTimes = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 6-10
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 6, 11)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.password.strategy.lock.login.times.range",
      defaultMessage: "Enter a number that ranges from 6 to 10.",
    });
  };

  const validCdpConcurrentInterval = async (_rule: any, value: ValueProps) => {
    // 1-16
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 17)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.cdp.concurrent.interval.range",
      defaultMessage: "Enter a number that ranges from 1 to 16.",
    });
  };

  const validPasswordStrategyLockLoginMinutes = async (
    _rule: any,
    value: ValueProps,
  ) => {
    // 1-1440
    const _value = Number(value?.number);

    if (
      value?.number === undefined ||
      value?.number === null ||
      _.isEmpty(String(value?.number))
    ) {
      throw intl.formatMessage({
        id: "globalConfig.edit.validator.cannot.be.empty",
        defaultMessage: "Specify a number.",
      });
    }

    if (_.isInteger(_value) && _.inRange(_value, 1, 1441)) {
      return;
    }

    throw intl.formatMessage({
      id: "globalconfig.validate.password.strategy.lock.login.minutes.range",
      defaultMessage: "Enter a number that ranges from 1 to 1,440.",
    });
  };

  return {
    validPasswordStrategyPeriod,
    validPasswordStrategyHistoricalNum,
    validPasswordStrategyLockLoginTimes,
    validPasswordStrategyLockLoginMinutes,
    validSharedblockUtilizationPercent,
    validaKVMTestSshPortOpenTimeout,
    validReservedCapacity,
    validateUIVmCreateLimitNum,
    validHaHostCheckSuccessRatio,
    validApiTimeout,
    validTenToOneThousand,
    validZeroSeconds,
    validOneSeconds,
    validDeletePolicySeconds,
    validExpungeInterval,
    validRangeMonth,
    validLoadBalancerMaxConnection,
    validZeroIndividual,
    validOneIndividual,
    validTwoIndividual,
    validZeroTimes,
    validOneTimes,
    validThreeTimes,
    validVpcHaKeepalivedInterval,
    validCountZeroTiao,
    validCountOneTiao,
    validZeroThread,
    validZeroCountTai,
    validKvmVmCreateConcurrency,
    validOneDay,
    validOneHundredYears,
    validOneByte,
    validWithinZeroToMaxIntegerRange,
    validWithinOneToMaxIntegerRange,
    validWithinTwoToMaxIntegerRange,
    validateIntegerInRangeZeroTo180,
    validIsPowerOfTwo,
    validZeroByte,
    validSharedblockInitializeSize,
    validDrsSchedulingInterval,
    validHostAllocatorConcurrentLevel,
    validHostCpuOverProvisioningRatio,
    validMaximumNumberOfImportedUsers,
    validIdentitySessionTimeout,
    validKvmDataVolumeMaxNum,
    validLessThanOrEqualToOneWithoutUnit,
    validAuditRetentionDuration,
    validOverProvisioning,
    validPSCapacity,
    validCollectHostDataDuration,
    validV2VCacheRetention,
    validThirtySeconds,
    validvCenterSyncInterval,
    validVolumeRefreshVolumeSizeInterval,
    validVpcZsnpTimeout,
    validMinusOneSeconds,
    validZwatchCountCacheExpireSecTime,
    validZwatchMinimumCountAmountAllowedAddedToCache,
    validZwatchScrapeInterval,
    validRequired,
    validVirtualRouterVrouterPassword,
    validVirtualRouterSSHPort,
    validChassis2MaxNumber,
    validCdpConcurrentInterval,
    validPSCapacityPredict,
    validL2networkDefaultDhcpMtu,
  };
};
