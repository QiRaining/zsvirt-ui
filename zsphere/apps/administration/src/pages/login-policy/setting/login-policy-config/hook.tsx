import { useIntl } from "react-intl";

import { useVirtualizationGlobalConfig } from "../../../system-parameter/hooks/useVirtualizationGlobalConfig";

export const useGlobalConfigList = () => {
  const intl = useIntl();

  // 目前先把需要的配置给直接从useGlobalConfig那边拷过来，防止运行时遍历global config来拿东西。
  // 这里的配置变的概率不大。
  // todo: 搞一个自动化的方式来动态生成这个配置
  const globalConfigList = [
    {
      key: "virtualization.identity.enable.unique.session",
      categoryType: "Basic",
      name: intl.formatMessage({
        id: "virtualization.globalConfig.identity.enable.unique.session",
      }),
      description: intl.formatMessage({
        id: "virtualization.globalConfig.identity.enable.unique.session.description",
      }),
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      formItem: { inputType: "Switch", unitList: [], selectList: [] },
    },
    {
      key: "virtualization.identity.session.timeout",
      categoryType: "Basic",
      name: intl.formatMessage({
        id: "virtualization.globalConfig.identity.session.timeout",
      }),
      description: intl.formatMessage({
        id: "virtualization.globalConfig.identity.session.timeout.description",
      }),
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      formItem: {
        validatorName: "validIdentitySessionTimeout",
        translateValue: "translateSecondTime",
        formatFunction: "formatTimeToSec",
        inputType: "InputWithUnit",
        unitList: [
          {
            value: "s",
            displayName: intl.formatMessage({ id: "virtualization.second" }),
          },
          {
            value: "m",
            displayName: intl.formatMessage({ id: "virtualization.minute" }),
          },
          {
            value: "h",
            displayName: intl.formatMessage({ id: "virtualization.hour" }),
          },
          {
            value: "d",
            displayName: intl.formatMessage({ id: "virtualization.day" }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "virtualization.loginControl.login.attempts.maximum",
      mergeKey:
        "loginControl.login.attempts.maximum||loginControl.login.control",
      license: "Community,Basic,Standard",
      categoryType: "Basic",
      name: intl.formatMessage({
        id: "virtualization.loginControl.login.attempts.maximum",
      }),
      description: intl.formatMessage({
        id: "virtualization.loginControl.login.attempts.maximum.description",
      }),
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage: intl.formatMessage({
        id: "virtualization.globalConfig.loginControl.login.attempts.maximum.alert",
      }),
      formItem: {
        validatorName: "validThreeTimes",
        translateValue: "translateLoginControl",
        formatFunction: "formatUnitWithNoUnit",
        inputType: "LoginControl",
        unitList: [{ value: "", displayName: "次" }],
        selectList: [],
      },
    },
    {
      // name: intl.formatMessage({
      //   id: 'virtualization.globalConfig.passwordStrategy.enable.force.change.password.period'
      // }),
      // description: intl.formatMessage({
      //   id: 'virtualization.globalConfig.passwordStrategy.enable.force.change.password.period.description'
      // }),
      name: intl.formatMessage({
        id: "virtualization.loginControl.login.attempts.maximum",
      }),
      description: intl.formatMessage({
        id: "virtualization.loginControl.login.attempts.maximum.description",
      }),
      key: "virtualization.loginControl.login.control",
      mergeKey:
        "loginControl.login.attempts.maximum||loginControl.login.control",
      license: "Community,Basic,Standard",
      categoryType: "Basic",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage: intl.formatMessage({
        id: "virtualization.globalConfig.loginControl.login.control.alert",
      }),
      formItem: {
        translateValue: "translateLoginControl",
        inputType: "LoginControl",
        unitList: [],
        selectList: [],
      },
    },
    {
      name: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.enable.force.change.password.period",
      }),
      description: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.enable.force.change.password.period.description",
      }),
      key: "virtualization.passwordStrategy.enable.force.change.password.period",
      mergeKey:
        "passwordStrategy.enable.force.change.password.period||passwordStrategy.force.change.password.period||passwordStrategy.enable.historical.password.compare||passwordStrategy.historical.password.num",
      categoryType: "Basic",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.enable.force.change.password.period.alert",
      }),
      formItem: {
        translateValue: "translateLoginPasswordUpdateStrategy",
        inputType: "LoginPasswordUpdateStrategy",
        unitList: [],
        selectList: [],
      },
    },
    {
      key: "virtualization.passwordStrategy.force.change.password.period",
      mergeKey:
        "passwordStrategy.enable.force.change.password.period||passwordStrategy.force.change.password.period||passwordStrategy.enable.historical.password.compare||passwordStrategy.historical.password.num",
      categoryType: "Basic",
      name: "平台登录密码更新策略",
      description:
        "默认为关闭，用于设置是否开启按周期修改密码功能。若开启，则密码使用时间达到所设置的密码更新周期后，重新登录将提示修改密码，默认为90天。在重新设置密码时，新密码不能与之前已使用过的历史密码重复，不重复次数可配置，默认为5，例如：若为3，则新密码不能与之前3次已使用过的历史密码重复。",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage:
        "开启后：密码更新周期取值范围(0，999]的整数。密码不重复次数取值范围[3，32]的整数。",
      formItem: {
        validatorName: "validPasswordStrategyPeriod",
        translateValue: "translateLoginPasswordUpdateStrategy",
        inputType: "LoginPasswordUpdateStrategy",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "virtualization.day",
              defaultMessage: "days",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "virtualization.passwordStrategy.enable.historical.password.compare",
      mergeKey:
        "passwordStrategy.enable.force.change.password.period||passwordStrategy.force.change.password.period||passwordStrategy.enable.historical.password.compare||passwordStrategy.historical.password.num",
      categoryType: "Basic",
      name: "平台登录密码更新策略",
      description:
        "默认为关闭，用于设置是否开启按周期修改密码功能。若开启，则密码使用时间达到所设置的密码更新周期后，重新登录将提示修改密码，默认为90天。在重新设置密码时，新密码不能与之前已使用过的历史密码重复，不重复次数可配置，默认为5，例如：若为3，则新密码不能与之前3次已使用过的历史密码重复。",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage:
        "开启后：密码更新周期取值范围(0，999]的整数。密码不重复次数取值范围[3，32]的整数。",
      formItem: {
        translateValue: "translateLoginPasswordUpdateStrategy",
        inputType: "LoginPasswordUpdateStrategy",
        unitList: [],
        selectList: [],
      },
    },
    {
      key: "virtualization.passwordStrategy.historical.password.num",
      mergeKey:
        "passwordStrategy.enable.force.change.password.period||passwordStrategy.force.change.password.period||passwordStrategy.enable.historical.password.compare||passwordStrategy.historical.password.num",
      categoryType: "Basic",
      name: "平台登录密码更新策略",
      description:
        "默认为关闭，用于设置是否开启按周期修改密码功能。若开启，则密码使用时间达到所设置的密码更新周期后，重新登录将提示修改密码，默认为90天。在重新设置密码时，新密码不能与之前已使用过的历史密码重复，不重复次数可配置，默认为5，例如：若为3，则新密码不能与之前3次已使用过的历史密码重复。",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage:
        "开启后：密码更新周期取值范围(0，999]的整数。密码不重复次数取值范围[3，32]的整数。",
      formItem: {
        validatorName: "validPasswordStrategyHistoricalNum",
        translateValue: "translateLoginPasswordUpdateStrategy",
        inputType: "LoginPasswordUpdateStrategy",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "times",
              defaultMessage: " times",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      name: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.enable.lock.login.attempts.maximum",
      }),
      description: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.enable.lock.login.attempts.maximum.description",
      }),
      key: "virtualization.passwordStrategy.enable.lock.login.attempts.maximum",
      mergeKey:
        "passwordStrategy.enable.lock.login.attempts.maximum||passwordStrategy.lock.login.attempts.maximum||passwordStrategy.lock.login.period",
      categoryType: "Basic",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.lock.login.period.alert",
      }),
      formItem: {
        translateValue: "translatePasswordStrategyLockLogin",
        inputType: "PasswordStrategyLockLogin",
        unitList: [],
        selectList: [],
      },
    },
    {
      key: "virtualization.passwordStrategy.lock.login.attempts.maximum",
      mergeKey:
        "passwordStrategy.enable.lock.login.attempts.maximum||passwordStrategy.lock.login.attempts.maximum||passwordStrategy.lock.login.period",
      categoryType: "Basic",
      name: intl.formatMessage({
        id: "globalConfig.passwordStrategy.lock.login.attempts.maximum",
        defaultMessage: "Max Login Attempts",
      }),
      description:
        "默认为false，用于设置是否启用连续登录失败锁定用户。若为true，表示连续登录失败数次，账户将被锁定一段时间。连续登录失败次数上限默认为6，锁定时长默认为10分钟。",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage:
        "开启后：连续登录失败次数上限取值范围[6，10]的整数；连续登录失败锁定用户时长取值范围(0,1440]的整数。",
      formItem: {
        validatorName: "validPasswordStrategyLockLoginTimes",
        translateValue: "translatePasswordStrategyLockLogin",
        inputType: "PasswordStrategyLockLogin",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "times",
              defaultMessage: " times",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      key: "virtualization.passwordStrategy.lock.login.period",
      mergeKey:
        "passwordStrategy.enable.lock.login.attempts.maximum||passwordStrategy.lock.login.attempts.maximum||passwordStrategy.lock.login.period",
      categoryType: "Basic",
      name: intl.formatMessage({
        id: "globalConfig.passwordStrategy.lock.login.period",
        defaultMessage: "Lockout Duration",
      }),
      description:
        "默认为false，用于设置是否启用连续登录失败锁定用户。若为true，表示连续登录失败数次，账户将被锁定一段时间。连续登录失败次数上限默认为6，锁定时长默认为10分钟。",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.lock.login.period.alert",
      }),
      formItem: {
        validatorName: "validPasswordStrategyLockLoginMinutes",
        translateValue: "translatePasswordStrategyLockLogin",
        inputType: "PasswordStrategyLockLogin",
        unitList: [
          {
            value: "",
            displayName: intl.formatMessage({
              id: "virtualization.minute",
              defaultMessage: "minutes",
            }),
          },
        ],
        selectList: [],
      },
    },
    {
      name: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.password.strength.check.config",
      }),
      description: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.password.strength.check.config.description",
      }),
      key: "virtualization.passwordStrategy.password.strength.check.config",
      categoryType: "Basic",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      alertMessage: intl.formatMessage({
        id: "virtualization.globalConfig.passwordStrategy.password.strength.check.config.alert",
      }),
      formItem: {
        translateValue: "translatePasswordStrategyCheckConfig",
        inputType: "PasswordStrategyCheckConfig",
        unitList: [],
        selectList: [],
      },
    },
    {
      name: intl.formatMessage({
        id: "virtualization.globalConfig.twofa.twofa.enable",
      }),
      description: intl.formatMessage({
        id: "virtualization.globalConfig.twofa.twofa.enable.description",
      }),
      key: "virtualization.twofa.twofa.enable",
      license: "Community",
      categoryType: "Basic",
      firstCategory: intl.formatMessage({
        id: "virtualization.platform.strategy",
      }),
      firstCategoryKey: "platform.strategy",
      secondCategory: intl.formatMessage({
        id: "virtualization.cloud.platform.login.policy",
      }),
      secondCategoryKey: "cloud.platform.login.policy",
      formItem: { inputType: "Switch", unitList: [], selectList: [] },
    },
  ];

  const { allGlobalConfig, globalConfigValueMap } =
    useVirtualizationGlobalConfig(globalConfigList);

  return {
    allGlobalConfig,
    globalConfigValueMap,
  };
};
