import { formatSecToPeriod, formatStorage } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";
import { useIntl } from "react-intl";

interface ISelectProps {
  value: string | number;
  displayName: string;
}

interface IUnitProps {
  value: string | number;
  displayName: string;
}

export const useTranslateValue = () => {
  const intl = useIntl();

  const translateSecondTime = (value: string | number) => {
    return formatSecToPeriod(Number(value), intl);
  };

  const translateMinuteTime = (value: string | number) => {
    return formatSecToPeriod(Number(value) * 60, intl);
  };

  // 毫秒 或 带单位的时间
  const translateMillisecondTimeOrWithUnit = (d: string) => {
    const [_number, _unit] = _.words(d);

    let number = Number(_number);
    if (_unit) {
      switch (_unit) {
        case "s":
          number = Number(_number);
          break;
        case "m":
          number = Number(_number) * 60;
          break;
        case "h":
          number = Number(_number) * 60 * 60;
          break;
        case "d":
          number = Number(_number) * 60 * 60 * 24;
          break;
      }
    } else {
      number /= 1000;
    }

    return formatSecToPeriod(number, intl);
  };

  const translateStorageValue = (value: string | number): string => {
    return formatStorage(Number(value), 2);
  };

  const translateStorageValueWithUnit = (value: string): string => {
    const [_number, _unit] = _.words(value);
    if (_unit) {
      return value;
    }
    return formatStorage(Number(_number), 2);
  };

  const translateStorageValueWithComputerStorageUnit = (
    value: string,
  ): string => {
    const [_number, _unit] = _.words(value);

    if (_unit) {
      return `${_number}${transformComputerStorageUnit(_unit)}`;
    }
    return formatStorage(Number(_number), 2);
  };
  const transformComputerStorageUnit = (unit: string | undefined) => {
    switch (unit) {
      case "K":
        return "KB";
      case "M":
        return "MB";
      case "G":
        return "GB";
      default:
        return unit;
    }
  };

  const translateHaHostCheckSuccessRatio = (value: string): string => {
    return `${_.round(_.toNumber(value) * 100, 0)}%`;
  };

  const translateLoginControl = (list: any[]): string => {
    const loginControl = _.find(
      list,
      (it) => `${it?.category}.${it?.name}` === "loginControl.login.control",
    );
    const loginAttempts = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` === "loginControl.login.attempts.maximum",
    );
    if (loginControl?.value === "false") {
      return "false";
    }
    return `${loginAttempts?.value}${_.get(loginAttempts, [
      "formItem",
      "unitList",
      "0",
      "displayName",
    ])}`;
  };

  const translateHostAllocator = (list: any[]): string => {
    const hostAllocator = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "hostAllocator.hostAllocator.concurrent",
    );
    const syncLevel = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "hostAllocator.hostAllocator.concurrent.level",
    );
    if (hostAllocator?.value === "false") {
      return "false";
    }
    if (
      intl.locale !== "zh-CN" &&
      syncLevel?.formItem?.componentProps?.disableNonZhLangUnit
    ) {
      return `${syncLevel?.value}`;
    }
    return `${syncLevel?.value}${_.get(syncLevel, ["formItem", "unitList", "0", "displayName"])}`;
  };

  const translateIAM2ProjectExpunge = (list: any[]): string => {
    const expungeInterval = _.find(
      list,
      (it) => `${it.category}.${it.name}` === "iam2.expungeInterval",
    );
    const expungePeriod = _.find(
      list,
      (it) => `${it.category}.${it.name}` === "iam2.expungePeriod",
    );
    return formatSecToPeriod(
      Number(
        _.max([
          Number(_.get(expungeInterval, ["value"])),
          Number(_.get(expungePeriod, ["value"])),
        ]),
      ),
      intl,
    );
  };

  const translateExpungeInterval = (list: any[]): string => {
    const vmExpungeInterval = _.find(
      list,
      (it) => `${it.category}.${it.name}` === "vm.expungeInterval",
    );

    const imageExpungeInterval = _.find(
      list,
      (it) => `${it.category}.${it.name}` === "image.expungeInterval",
    );

    const volumeExpungeInterval = _.find(
      list,
      (it) => `${it.category}.${it.name}` === "volume.expungeInterval",
    );

    return formatSecToPeriod(
      Number(
        _.max([
          Number(_.get(vmExpungeInterval, ["value"], 3600)),
          Number(_.get(imageExpungeInterval, ["value"], 3600)),
          Number(_.get(volumeExpungeInterval, ["value"], 3600)),
        ]),
      ),
      intl,
    );
  };

  const translateDeletePolicy = (list: any[]): string => {
    const policyItem = _.find(list, (it) => !!it?.formItem?.selectList);
    // const expungeInterval = _.find(list, it => it?.name === 'expungeInterval')
    const expungePeriod = _.find(list, (it) => it?.name === "expungePeriod");

    //延时删除
    if (_.isEqual("Delay", _.get(policyItem, "value"))) {
      return `${_.get(
        _.find(policyItem?.formItem?.selectList, (it) =>
          _.isEqual(it.value, _.get(policyItem, "value")),
        ),
        "displayName",
        "",
      )}, ${formatSecToPeriod(Number(expungePeriod?.value), intl)}`;
    }

    return _.get(
      _.find(policyItem?.formItem?.selectList, (it) =>
        _.isEqual(it.value, _.get(policyItem, "value")),
      ),
      "displayName",
      "",
    );
  };

  const translateSelectValue = (
    value: string | number,
    {
      selectList,
      unitList,
    }: {
      selectList: ISelectProps[];
      unitList: IUnitProps[];
    },
  ): string => {
    return `${_.get(
      _.find(selectList, (it) => _.isEqual(it.value, value)),
      "displayName",
      "",
    )}${_.get(unitList, ["0", "displayName"], "")}`;
  };

  const translateCpuModeSelect = (
    value: string | number,
    {
      selectList,
      unitList,
    }: {
      selectList: ISelectProps[];
      unitList: IUnitProps[];
    },
  ): string | number => {
    const selectedValue = _.find(selectList, (it) =>
      _.isEqual(it.value, value),
    );
    if (selectedValue) {
      return `${_.get(selectedValue, "displayName", "")}${_.get(
        unitList,
        ["0", "displayName"],
        "",
      )}`;
    }
    return value;
  };

  // 单位为秒，个，台，线程等等只有一个固定单位
  const translateSingleUnit = (
    value: string | number,
    {
      unitList,
      componentProps,
    }: { unitList: IUnitProps[]; componentProps?: any },
  ) => {
    if (componentProps?.disableNonZhLangUnit && intl.locale !== "zh-CN") {
      return `${value}`;
    }
    return `${value} ${_.get(unitList, ["0", "displayName"], "")}`;
  };

  const translateNegativeOne = (
    value: string | number,
    { unitList }: { unitList: IUnitProps[] },
  ) => {
    if (_.isEqual(value, "-1")) {
      return intl.formatMessage({
        id: "globalConfig.close",
        defaultMessage: "Disabled",
      });
    }
    return translateSingleUnit(value, { unitList });
  };

  const translateNegativeOneAsUnlimited = (
    value: string | number,
    { unitList }: { unitList: IUnitProps[] },
  ) => {
    if (_.isEqual(value, "-1")) {
      return intl.formatMessage({
        id: "globalConfig.unlimited",
        defaultMessage: "Unlimited",
      });
    }
    return translateSingleUnit(value, { unitList });
  };

  const translateZeroAndSecondTime = (value: string) => {
    if (value === "0") {
      return intl.formatMessage({
        id: "globalConfig.close",
        defaultMessage: "Disabled",
      });
    }
    return translateSecondTime(value);
  };

  const translateTrueAndFalse = (value: string) => {
    if (value === "true") {
      return intl.formatMessage({
        id: "globalConfig.open",
        defaultMessage: "Enabled",
      });
    }

    if (value === "false") {
      return intl.formatMessage({
        id: "globalConfig.close",
        defaultMessage: "Disabled",
      });
    }

    return value;
  };

  const translateToAsterisk = (): string => {
    return "******";
  };

  const translatePasswordStrategyPeriod = (list: any[]): string => {
    const passwordStrategyEnable = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.enable.force.change.password.period",
    );
    const passwordStrategyPeriod = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.force.change.password.period",
    );

    if (_.get(passwordStrategyEnable, "value") === "false") {
      return intl.formatMessage({
        id: "globalConfig.close",
        defaultMessage: "Disabled",
      });
    }
    return translateSecondTime(Number(_.get(passwordStrategyPeriod, "value")));
  };

  const translatePasswordStrategyNum = (list: any[]): string => {
    const passwordStrategyCompare = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.enable.historical.password.compare",
    );
    const passwordStrategyNum = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.historical.password.num",
    );

    if (_.get(passwordStrategyCompare, "value") === "false") {
      return intl.formatMessage({
        id: "globalConfig.close",
        defaultMessage: "Disabled",
      });
    }
    return `${_.get(passwordStrategyNum, "value")}${_.get(passwordStrategyNum, [
      "formItem",
      "unitList",
      "0",
      "displayName",
    ])}`;
  };

  const translateLoginPasswordUpdateStrategy = (list: any[]): string => {
    const passwordStrategyEnable = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.enable.force.change.password.period",
    );
    const passwordStrategyPeriod = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.force.change.password.period",
    );
    const passwordStrategyCompare = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.enable.historical.password.compare",
    );
    const passwordStrategyNum = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.historical.password.num",
    );

    if (
      _.get(passwordStrategyEnable, "value") === "false" &&
      _.get(passwordStrategyCompare, "value") === "false"
    ) {
      return intl.formatMessage({
        id: "globalConfig.close",
        defaultMessage: "Disabled",
      });
    }
    return `${translateSecondTime(Number(_.get(passwordStrategyPeriod, "value")))}, ${_.get(
      passwordStrategyNum,
      "value",
    )}${_.get(passwordStrategyNum, ["formItem", "unitList", "0", "displayName"])}`;
  };

  const translatePasswordStrategyLockLogin = (list: any[]): string => {
    const passwordStrategyEnable = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.enable.lock.login.attempts.maximum",
    );
    const passwordStrategyNum = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` ===
        "passwordStrategy.lock.login.attempts.maximum",
    );
    const passwordStrategyPeriod = _.find(
      list,
      (it) =>
        `${it?.category}.${it?.name}` === "passwordStrategy.lock.login.period",
    );

    if (_.get(passwordStrategyEnable, "value") === "false") {
      return "false";
    }
    return `${_.get(passwordStrategyNum, "value")}${_.get(passwordStrategyNum, [
      "formItem",
      "unitList",
      "0",
      "displayName",
    ])}, ${translateSecondTime(_.get(passwordStrategyPeriod, "value"))}`;
  };

  const translatePasswordStrategyCheckConfig = (value: string) => {
    let _value: any = {};
    try {
      _value = JSON.parse(String(value));
    } catch (error) {
      console.log(error);
    }
    if (!_value.enabled) {
      return "false";
    }
    const text = _value?.checkUppercase
      ? `, ${intl.formatMessage({
          id: "combination.of.numbers.capitalization.special.characters",
          defaultMessage: "",
        })}`
      : "";
    return `${_value?.minimum}-${_value?.maximum}${text}`;
  };

  const translateIAM2ProjectLoginPortal = (value: string) => {
    let _value: any = {};
    try {
      _value = JSON.parse(value);
    } catch (error) {
      console.log(error);
    }

    // if (!_.get(_value, ['cas', 'enable'])) return 'false'

    const defaultLoginType = _.get(
      _value,
      "defaultLoginType",
      "local-iam2-user",
    );

    if (
      !_.get(_value, ["cas", "enable"]) &&
      defaultLoginType === "cas-iam2-user"
    ) {
      return intl.formatMessage({
        id: "globalConfig.localIAM2User",
        defaultMessage: "Local User",
      });
    }

    switch (defaultLoginType) {
      case "local-iam2-user":
        return intl.formatMessage({
          id: "globalConfig.localIAM2User",
          defaultMessage: "Local User",
        });
      case "ad-ldap-iam2-user":
        return intl.formatMessage({
          id: "globalConfig.adldapIAM2User",
          defaultMessage: "AD/LDAP User",
        });
      case "cas-iam2-user":
        return intl.formatMessage({
          id: "globalConfig.casIAM2User",
          defaultMessage: "CAS User",
        });
      default:
        return intl.formatMessage({
          id: "globalConfig.localIAM2User",
          defaultMessage: "Local User",
        });
    }
  };

  const translateVmPasswordCheckConfig = (value: string) => {
    const [checkConfig, numRange] = _.split(value, ",");
    const [checkPasswordStrength] = checkConfig;

    if (checkPasswordStrength === "0") {
      return intl.formatMessage({
        id: "globalConfig.close",
        defaultMessage: "Disabled",
      });
    }

    if (checkConfig === "10000") {
      return `${numRange}`;
    }

    if (checkConfig === "11111") {
      return intl.formatMessage(
        {
          id: "combination.of.numbers.capitalization.special.characters.and.minimum-maximum",
          defaultMessage: "{minimumMaximum} and a combination of digits, letters, and special characters",
        },
        {
          minimumMaximum: `${numRange}`,
        },
      );
    }

    return `${numRange}`;
  };

  const translateVmRebootStrategyConfig = (value: any[]) => {
    const timeConfig = _.find(
      value,
      (it) => it.name === "crash.rebootThreshold.duration",
    );
    const countConfig = _.find(
      value,
      (it) => it.name === "crash.rebootThreshold.times",
    );

    const time = _.get(timeConfig, "value");
    const count = _.get(countConfig, "value");
    return `${intl.formatMessage(
      {
        id: "globalConfig.crash.reboot.strategy.description",
        defaultMessage: "Restart {count} times within {minute} minutes",
      },
      {
        minute: time / 60,
        count,
      },
    )}`;
  };

  const translateVmCrashStrategyConfig = (value: string = "None") => {
    const vmCrashStrategyMap = {
      None: intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      Preserve: intl.formatMessage({
        id: "Preserve",
        defaultMessage: "No Action",
      }),
      Shutdown: intl.formatMessage({ id: "Shutdown", defaultMessage: "Shutdown" }),
      Reboot: intl.formatMessage({ id: "Reboot", defaultMessage: "Reboot" }),
    };
    return vmCrashStrategyMap[value as "None"];
  };

  const translateVNCConsolePasswordCheckConfig = (value: string) => {
    const [checkConfig, numRange] = _.split(value, ",");
    const [checkPasswordStrength] = checkConfig;

    if (checkPasswordStrength === "0") {
      return intl.formatMessage({
        id: "globalConfig.close",
        defaultMessage: "Disabled",
      });
    }

    if (checkConfig === "10000") {
      return `${numRange}`;
    }

    if (checkConfig === "11111") {
      return intl.formatMessage(
        {
          id: "combination.of.numbers.capitalization.special.characters.and.minimum-maximum",
          defaultMessage: "{minimumMaximum} and a combination of digits, letters, and special characters",
        },
        {
          minimumMaximum: `${numRange}`,
        },
      );
    }

    return `${numRange}`;
  };

  const translateCompared = (value: string) => `${value} : 1`;

  return {
    translateVmPasswordCheckConfig,
    translateVmRebootStrategyConfig,
    translateVmCrashStrategyConfig,
    translateVNCConsolePasswordCheckConfig,
    translatePasswordStrategyCheckConfig,
    translatePasswordStrategyLockLogin,
    translateLoginPasswordUpdateStrategy,
    translatePasswordStrategyNum,
    translatePasswordStrategyPeriod,
    translateZeroAndSecondTime,
    translateTrueAndFalse,
    translateNegativeOne,
    translateNegativeOneAsUnlimited,
    translateStorageValue,
    translateDeletePolicy,
    translateExpungeInterval,
    translateSelectValue,
    translateCpuModeSelect,
    translateMillisecondTimeOrWithUnit,
    translateSecondTime,
    translateMinuteTime,
    translateToAsterisk,
    translateSingleUnit,
    translateLoginControl,
    translateHostAllocator,
    translateIAM2ProjectLoginPortal,
    translateIAM2ProjectExpunge,
    translateStorageValueWithUnit,
    translateHaHostCheckSuccessRatio,
    translateStorageValueWithComputerStorageUnit,
    translateCompared,
  };
};
