import { useIntl } from 'react-intl'

export default () => {
  const intl = useIntl()

  return [
    {
      key: 'accessControl.enable.request.source.ip.address.check',
      templateName: intl.formatMessage({id: 'globalConfig.accessControl.enable.request.source.ip.address.check', defaultMessage: 'IP Allowlist/Blocklist'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.accessControl.enable.request.source.ip.address.check.description', defaultMessage: "Specifies whether to enable IP allowlist or blocklist for logins. Default: false. If set to true, the platform filters IP addresses of login clients based on the configured IP allowlist or blocklist entries."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.accessControl.enable.request.source.ip.address.check.alert', defaultMessage: `If you enable the option, you can enter Operational Management - Access Control - IP Allowlist/Blocklist and configure an IP allowlist or blocklist`}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'encrypt.enable.password.encrypt',
      templateName: intl.formatMessage({id: 'globalConfig.encrypt.enable.password.encrypt', defaultMessage: 'Host Password Encryption Policy'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.encrypt.enable.password.encrypt.description', defaultMessage: "### Host Password Encryption Policy\n\nSpecifies whether and how to encrypt the login password of hosts in the database. Default: None. Options include None and LocalEncryption.\n\n- None: Do not encrypt the login password of hosts.\n- LocalEncryption: Encrypt the login password of hosts by using the encryption feature provided by the platform."}),
      formItem: {
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'LocalEncryption',
            displayName: intl.formatMessage({id: 'template.LocalEncryption', defaultMessage: 'LocalEncryption'})
          },
          {
            value: 'None',
            displayName: intl.formatMessage({id: 'template.None', defaultMessage: 'None'})
          },
        ]
      }
    },
    {
      key: 'identity.enable.unique.session',
      templateName: intl.formatMessage({id: 'globalConfig.identity.enable.unique.session', defaultMessage: 'Restrict Concurrent Connections for Users'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.identity.enable.unique.session.description', defaultMessage: "### Restrict Concurrent Connections for Users\n\nSpecify whether to limit the number of simultaneous connection sessions for each user. Default: false. If enabled, each user can only have one active connection session with the platform. When a new session is established, the previous session will be automatically closed."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'identity.session.timeout',
      templateName: intl.formatMessage({id: 'globalConfig.identity.session.timeout', defaultMessage: 'Session Timeout'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.identity.session.timeout.description', defaultMessage: "### Session Timeout\n\nIf a session times out, you will need to log in again to access the system. Deafult: 2 hours. Units: seconds, minutes, hours, and days."}),
      formItem: {
        validatorName: 'validIdentitySessionTimeout',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatTimeToSec',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 's',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
          {
            value: 'm',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
          {
            value: 'h',
            displayName: intl.formatMessage({id: 'hour', defaultMessage: 'hours'})
          },
          {
            value: 'd',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ldap.skip.all.ssl.certs.check',
      templateName: intl.formatMessage({id: 'globalConfig.ldap.skip.all.ssl.certs.check', defaultMessage: 'SSL Certificate Check Skipping'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ldap.skip.all.ssl.certs.check.description', defaultMessage: "### SSL Certificate Check Skipping\n\nSpecifies whether to skip checking SSL certificate items when the platform is connecting a LDAP server for which the SSL certificate is configured. Default: false. If you set the setting to true, the check is skipped in a connection attempt."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'loginControl.login.control',
      mergeKey: 'loginControl.login.control||loginControl.login.attempts.maximum',
      templateName: intl.formatMessage({id: 'globalConfig.loginControl.login.control', defaultMessage: 'Login Verification Code Settings'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.loginControl.login.control.description', defaultMessage: "### Login Verification Code Settings\n\nSpecify whether to require a verification code after a specified number of consecutive failed login attempts. Default: false. If enabled, you can set the maximum number of continuous login failures that will trigger the verification code requirement. Enter an integer that is equal to or greater than 3. Once triggered, you must enter the correct account name, password, and verification code to successfully log in to the platform."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.loginControl.login.control.alert', defaultMessage: `Require a verification code after a specified number of consecutive failed login attempts. Enter an integer that is equal to or greater than 3.`}),
      formItem: {
        translateValue: 'translateLoginControl',
        inputType: 'LoginControl',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'loginControl.login.attempts.maximum',
      mergeKey: 'loginControl.login.control||loginControl.login.attempts.maximum',
      templateName: intl.formatMessage({id: 'globalConfig.loginControl.login.attempts.maximum', defaultMessage: 'Platform Verification Code Policy'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.loginControl.login.attempts.maximum.description', defaultMessage: "Specifies whether to enable verification by verification code if logins continuously fail. Default: false. If set to true, you can set the maximum number of continuous login failures that trigger verification by verification code. The default maximum value is 6. If the verification is triggered, you must enter the correct account name, password, and verification code before you can log in to the platform."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.loginControl.login.attempts.maximum.alert', defaultMessage: `Require a verification code after a specified number of consecutive failed login attempts. Enter an integer that is equal to or greater than 3.`}),
      formItem: {
        validatorName: 'validThreeTimes',
        translateValue: 'translateLoginControl',
        inputType: 'LoginControl',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'passwordStrategy.enable.force.change.password.period',
      mergeKey: 'passwordStrategy.enable.force.change.password.period||passwordStrategy.force.change.password.period||passwordStrategy.enable.historical.password.compare||passwordStrategy.historical.password.num',
      templateName: intl.formatMessage({id: 'globalConfig.passwordStrategy.enable.force.change.password.period', defaultMessage: 'Login Password Update Cycle'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.passwordStrategy.enable.force.change.password.period.description', defaultMessage: "### Login Password Update Cycle\n\nSpecify whether to enforce regular updates of login passwords. Default: false. If enabled, you can specify the update interval. The default interval is 90 days. When the update period is reached, you will be prompted to change your password upon logging into the platform. You can also set the number of recent passwords that cannot be repeatedly used. For example, if you set this parameter to 3, you will not be able to reuse any of your last three passwords when logging into the platform."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.passwordStrategy.enable.force.change.password.period.alert', defaultMessage: `If enabled, the update interval must be an integer that ranges from 1 to 999 and the non-repeating count of passwords must be an integer that ranges from 3 to 32.`}),
      formItem: {
        translateValue: 'translateLoginPasswordUpdateStrategy',
        inputType: 'LoginPasswordUpdateStrategy',
        unitList: [
        ],
        selectList: [
          {
            value: 'true',
            displayName: intl.formatMessage({id: 'template.true', defaultMessage: 'true'})
          },
          {
            value: 'false',
            displayName: intl.formatMessage({id: 'template.false', defaultMessage: 'false'})
          },
        ]
      }
    },
    {
      key: 'passwordStrategy.force.change.password.period',
      mergeKey: 'passwordStrategy.enable.force.change.password.period||passwordStrategy.force.change.password.period||passwordStrategy.enable.historical.password.compare||passwordStrategy.historical.password.num',
      templateName: intl.formatMessage({id: 'globalConfig.passwordStrategy.force.change.password.period', defaultMessage: 'Platform Login Password Update Policy'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.passwordStrategy.force.change.password.period.description', defaultMessage: "Specifies whether to enable regular update of login password. Default: false. If set to true, you can set the update interval. The default password update interval is 90 days. When the update time comes, you are reminded to modify the password when you login to the platform. You can set the number of recent passwords that cannot be reused. The default number of recent passwords that cannot be reused is 5. If you set this parameter to 3, you cannot reuse the recent three passwords to login to the platform."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.passwordStrategy.force.change.password.period.alert', defaultMessage: `If enabled, the update interval must be an integer that ranges from 1 to 999 and the non-repeating count of passwords must be an integer that ranges from 3 to 32.`}),
      formItem: {
        validatorName: 'validPasswordStrategyPeriod',
        translateValue: 'translateLoginPasswordUpdateStrategy',
        inputType: 'LoginPasswordUpdateStrategy',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'day', defaultMessage: 'days'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'passwordStrategy.enable.historical.password.compare',
      mergeKey: 'passwordStrategy.enable.force.change.password.period||passwordStrategy.force.change.password.period||passwordStrategy.enable.historical.password.compare||passwordStrategy.historical.password.num',
      templateName: intl.formatMessage({id: 'globalConfig.passwordStrategy.enable.historical.password.compare', defaultMessage: 'Platform Login Password Reuse Policy'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.passwordStrategy.enable.historical.password.compare.description', defaultMessage: "Specifies whether to enable regular update of login password. Default: false. If set to true, you can set the update interval. The default password update interval is 90 days. When the update time comes, you are reminded to modify the password when you login to the platform. You can set the number of recent passwords that cannot be reused. The default number of recent passwords that cannot be reused is 5. If you set this parameter to 3, you cannot reuse the recent three passwords to login to the platform."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.passwordStrategy.enable.historical.password.compare.alert', defaultMessage: `If enabled, the update interval must be an integer that ranges from 1 to 999 and the non-repeating count of passwords must be an integer that ranges from 3 to 32.`}),
      formItem: {
        translateValue: 'translateLoginPasswordUpdateStrategy',
        inputType: 'LoginPasswordUpdateStrategy',
        unitList: [
        ],
        selectList: [
          {
            value: 'true',
            displayName: intl.formatMessage({id: 'template.true', defaultMessage: 'true'})
          },
          {
            value: 'false',
            displayName: intl.formatMessage({id: 'template.false', defaultMessage: 'false'})
          },
        ]
      }
    },
    {
      key: 'passwordStrategy.historical.password.num',
      mergeKey: 'passwordStrategy.enable.force.change.password.period||passwordStrategy.force.change.password.period||passwordStrategy.enable.historical.password.compare||passwordStrategy.historical.password.num',
      templateName: intl.formatMessage({id: 'globalConfig.passwordStrategy.historical.password.num', defaultMessage: 'Platform Login Password Reuse Policy'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.passwordStrategy.historical.password.num.description', defaultMessage: "Specifies whether to enable regular update of login password. Default: false. If set to true, you can set the update interval. The default password update interval is 90 days. When the update time comes, you are reminded to modify the password when you login to the platform. You can set the number of recent passwords that cannot be reused. The default number of recent passwords that cannot be reused is 5. If you set this parameter to 3, you cannot reuse the recent three passwords to login to the platform."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.passwordStrategy.historical.password.num.alert', defaultMessage: `If enabled, the update interval must be an integer that ranges from 1 to 999 and the non-repeating count of passwords must be an integer that ranges from 3 to 32.`}),
      formItem: {
        validatorName: 'validPasswordStrategyHistoricalNum',
        translateValue: 'translateLoginPasswordUpdateStrategy',
        inputType: 'LoginPasswordUpdateStrategy',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'passwordStrategy.enable.lock.login.attempts.maximum',
      mergeKey: 'passwordStrategy.enable.lock.login.attempts.maximum||passwordStrategy.lock.login.attempts.maximum||passwordStrategy.lock.login.period',
      templateName: intl.formatMessage({id: 'globalConfig.passwordStrategy.enable.lock.login.attempts.maximum', defaultMessage: 'Failed Login Lockout Settings'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.passwordStrategy.enable.lock.login.attempts.maximum.description', defaultMessage: "### Failed Login Lockout Settings\n\nSpecify whether to lock a user's account after a specified number of consecutive failed login attempts.\nDefault: false. If enabled, you can set the maximum number of failed login attempts that will result in the account being locked. You can also configure the duration for which the account will remain locked. If the number of failed login attempts exceeds the threshold, the user's account will be locked for the specified duration."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.passwordStrategy.enable.lock.login.attempts.maximum.alert', defaultMessage: `The maximum number of failed login attempts is an integer that ranges from 1 to 10. The lockout duration is an integer that ranges from 0 to 1,440.`}),
      formItem: {
        translateValue: 'translatePasswordStrategyLockLogin',
        inputType: 'PasswordStrategyLockLogin',
        unitList: [
        ],
        selectList: [
          {
            value: 'true',
            displayName: intl.formatMessage({id: 'template.true', defaultMessage: 'true'})
          },
          {
            value: 'false',
            displayName: intl.formatMessage({id: 'template.false', defaultMessage: 'false'})
          },
        ]
      }
    },
    {
      key: 'passwordStrategy.lock.login.attempts.maximum',
      mergeKey: 'passwordStrategy.enable.lock.login.attempts.maximum||passwordStrategy.lock.login.attempts.maximum||passwordStrategy.lock.login.period',
      templateName: intl.formatMessage({id: 'globalConfig.passwordStrategy.lock.login.attempts.maximum', defaultMessage: 'Max Login Attempts'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.passwordStrategy.lock.login.attempts.maximum.description', defaultMessage: "Specifies whether to lock the login account if the logins continuously fail. Default: false. If set to true, you can set the maximum number of login failures that cause account lock. You can also set the lock duration. If the number of login failures exceeds the threshold, the login account is locked for the configured duration."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.passwordStrategy.lock.login.attempts.maximum.alert', defaultMessage: `The maximum number of failed login attempts is an integer that ranges from 6 to 10. The lockout duration is an integer that ranges from 0 to 1,440.`}),
      formItem: {
        validatorName: 'validPasswordStrategyLockLoginTimes',
        translateValue: 'translatePasswordStrategyLockLogin',
        inputType: 'PasswordStrategyLockLogin',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'passwordStrategy.lock.login.period',
      mergeKey: 'passwordStrategy.enable.lock.login.attempts.maximum||passwordStrategy.lock.login.attempts.maximum||passwordStrategy.lock.login.period',
      templateName: intl.formatMessage({id: 'globalConfig.passwordStrategy.lock.login.period', defaultMessage: 'Lockout Duration'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.passwordStrategy.lock.login.period.description', defaultMessage: "Specifies whether to lock the login account if the logins continuously fail. Default: false. If set to true, you can set the maximum number of login failures that cause account lock. You can also set the lock duration. If the number of login failures exceeds the threshold, the login account is locked for the configured duration."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.passwordStrategy.lock.login.period.alert', defaultMessage: `The maximum number of failed login attempts is an integer that ranges from 6 to 10. The lockout duration is an integer that ranges from 0 to 1,440.`}),
      formItem: {
        validatorName: 'validPasswordStrategyLockLoginMinutes',
        translateValue: 'translatePasswordStrategyLockLogin',
        inputType: 'PasswordStrategyLockLogin',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'minute', defaultMessage: 'minutes'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'passwordStrategy.password.strength.check.config',
      templateName: intl.formatMessage({id: 'globalConfig.passwordStrategy.password.strength.check.config', defaultMessage: 'Login Password Strength'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.passwordStrategy.password.strength.check.config.description', defaultMessage: "### Login Password Strength\n\nSpecify whether to enforce the user-created login passwords to meet a certain level of complexity and security. Default: false. If enabled, you can specify the required range for password length and enforce the use of a combination of digits, lowercase letters, uppercase letters, and special characters."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.passwordStrategy.password.strength.check.config.alert', defaultMessage: `If enabled, the password length format is m-n, where m and n are integers ranging from 8 to 32.`}),
      formItem: {
        translateValue: 'translatePasswordStrategyCheckConfig',
        inputType: 'PasswordStrategyCheckConfig',
        unitList: [
        ],
        selectList: [
          {
            value: 'true',
            displayName: intl.formatMessage({id: 'template.true', defaultMessage: 'true'})
          },
          {
            value: 'false',
            displayName: intl.formatMessage({id: 'template.false', defaultMessage: 'false'})
          },
        ]
      }
    },
    {
      key: 'twofa.twofa.enable',
      templateName: intl.formatMessage({id: 'globalConfig.twofa.twofa.enable', defaultMessage: 'Two-Factor Authentication'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.twofa.twofa.enable.description', defaultMessage: "### Two-Factor Authentication\n\nSpecify whether to enable two-factor authentication (2FA) for platform logins. Default: false."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'mevoco.vm.console.password.strength.check.config',
      templateName: intl.formatMessage({id: 'globalConfig.mevoco.vm.console.password.strength.check.config', defaultMessage: 'VNC Console Password'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.mevoco.vm.console.password.strength.check.config.description', defaultMessage: "### VNC Console Password\n\nSpecify whether to require a password for VNC console login. Default: false. If enabled, you can specify the length range for the VNC console password. The default range is 6-8 characters. Additionally, you can enforce the use of a combination of digits, letters, and special characters."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.mevoco.vm.console.password.strength.check.config.alert', defaultMessage: `If enabled, the password length format is m-n, where m and n are integers ranging from 6 to 8.`}),
      formItem: {
        translateValue: 'translateVNCConsolePasswordCheckConfig',
        inputType: 'VNCCheckConfig',
        unitList: [
        ],
        selectList: [
          {
            value: 'true',
            displayName: intl.formatMessage({id: 'template.true', defaultMessage: 'true'})
          },
          {
            value: 'false',
            displayName: intl.formatMessage({id: 'template.false', defaultMessage: 'false'})
          },
        ]
      }
    },
    {
      key: 'mevoco.vm.password.strength.check.config',
      templateName: intl.formatMessage({id: 'globalConfig.mevoco.vm.password.strength.check.config', defaultMessage: 'VM Password Strength'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.mevoco.vm.password.strength.check.config.description', defaultMessage: "### VM Password Strength\n\nSpecify whether to require login passwords for virtual machines. Default: false.\n\nNote:\n\n1. The VM password format is m-n, with values ranging from 8 to 32 integers. Default: 8 to 18. The password supports a combination of digits, letters, and special characters.\n2. Before you set a login password for a virtual machine, make sure that cloud-init is installed in the VM system image. We recommend that the version of cloud-init be 0.7.9, 17.1, 19.4, 19.4, or later."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.mevoco.vm.password.strength.check.config.alert', defaultMessage: `If enabled: 1. The VM password format is m-n, with values ranging from 8 to 32 integers. 2. Before you set a login password for a virtual machine, make sure that cloud-init is installed in the VM system image. We recommend that the version of cloud-init be 0.7.9, 17.1, 19.4, 19.4, or later.`}),
      formItem: {
        translateValue: 'translateVmPasswordCheckConfig',
        inputType: 'VmPasswordCheckConfig',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.host.check.interval',
      templateName: intl.formatMessage({id: 'globalConfig.ha.host.check.interval', defaultMessage: 'Abnormal Host Status Update Interval'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.host.check.interval.description', defaultMessage: "### Abnormal Host Status Update Interval\n\nThe interval for the system to check and update the status of abnormal hosts. Default: 5. Unit: second."}),
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.host.check.maxAttempts',
      templateName: intl.formatMessage({id: 'globalConfig.ha.host.check.maxAttempts', defaultMessage: 'Minimum Connection Attempts Required to Determine Host is Disconnected'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.host.check.maxAttempts.description', defaultMessage: "### Minimum Connection Attempts Required to Determine Host is Disconnected\n\nThe maximum times for the system to attempt to connect to a host. If the system fails to connect to the host after the specified times of attempt, the host is determined as disconnected. Default: 12."}),
      formItem: {
        validatorName: 'validZeroTimes',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.host.check.successInterval',
      templateName: intl.formatMessage({id: 'globalConfig.ha.host.check.successInterval', defaultMessage: 'Ping Response Time to Determine Host Connection is Established Successfully'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.host.check.successInterval.description', defaultMessage: "### Ping Response Time to Determine Host Connection is Established Successfully\n\nThe time period for the system to wait the host response after it pings the host. Receiving a response within this period indicates that the system establishes a successful connection with the host. Default: 5. Unit: second."}),
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.host.check.successTimes',
      templateName: intl.formatMessage({id: 'globalConfig.ha.host.check.successTimes', defaultMessage: 'Minimum Successful Connections Required to Determine Host is Re-Connected'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.host.check.successTimes.description', defaultMessage: "### Minimum Successful Connections Required to Determine Host is Re-Connected\n\nThe minimum successful connections that the system has to establish with a disconnected host before the host can be determined as re-connected. Default: 5."}),
      formItem: {
        validatorName: 'validZeroTimes',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.host.check.successRatio',
      templateName: intl.formatMessage({id: 'globalConfig.ha.host.check.successRatio', defaultMessage: 'Minimum Connection Success Rate to Determine Host is Re-Connected'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.host.check.successRatio.description', defaultMessage: "### Minimum Connection Success Rate to Determine Host is Re-Connected\n\nThe minimum rate of successful connections occupied in total connection attempts to determine a disconnected host is successfully re-connected. Default: 50. Unit: %."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.ha.host.check.successRatio.alert', defaultMessage: `Valid values: 1% to 99%.`}),
      formItem: {
        validatorName: 'validHaHostCheckSuccessRatio',
        translateValue: 'translateHaHostCheckSuccessRatio',
        formatFunction: 'formatHaHostCheckSuccessRatio',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'percent', defaultMessage: '%'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.host.selfFencer.interval',
      templateName: intl.formatMessage({id: 'globalConfig.ha.host.selfFencer.interval', defaultMessage: 'Host Self-Inspection Interval'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.host.selfFencer.interval.description', defaultMessage: "The interval that a host inspects its own status. Default: 5. Unit: second."}),
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.host.selfFencer.maxAttempts',
      templateName: intl.formatMessage({id: 'globalConfig.ha.host.selfFencer.maxAttempts', defaultMessage: 'Maximum Host Self-Inspection Attempts'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.host.selfFencer.maxAttempts.description', defaultMessage: "The maximum number of attempts that a host inspects its own status. If the self-inspection of a host fails by the maximum attempts, it is determined that network errors occur with the host. Default: 6."}),
      formItem: {
        validatorName: 'validZeroTimes',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.host.selfFencer.storageChecker.timeout',
      templateName: intl.formatMessage({id: 'globalConfig.ha.host.selfFencer.storageChecker.timeout', defaultMessage: 'Timeout Period for Host Connecting to Data Storage'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.host.selfFencer.storageChecker.timeout.description', defaultMessage: "### Timeout Period for Host Connecting to Data Storage\n\nThe time for hosts to attempt to connect to data storage. If a host fails to connect to a data storage during this period, its connection attempt is determined as timeout. Default: 5. Unit: second."}),
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.neverStopVm.gc.maxRetryIntervalTime',
      templateName: intl.formatMessage({id: 'globalConfig.ha.neverStopVm.gc.maxRetryIntervalTime', defaultMessage: 'Maximum Interval for VM Attempt to HA Start'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.neverStopVm.gc.maxRetryIntervalTime.description', defaultMessage: "### Maximum Interval for VM Attempt to HA Start\n\nThe maximum interval for the system to finish the GC (garbage collection) job and attempt to restart a NeverStop VM according to the HA policy after the virtual machine is stopped unexpectedly. Default: 300. Unit: second."}),
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.neverStopVm.scan.interval',
      templateName: intl.formatMessage({id: 'globalConfig.ha.neverStopVm.scan.interval', defaultMessage: 'HA VM State Scanning Interval'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.neverStopVm.scan.interval.description', defaultMessage: "### HA VM State Scanning Interval\n\nThe interval to scan the status of a NeverStop VM after it fails to HA start. Default: 60. Unit: second."}),
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.neverStopVm.retry.delay',
      templateName: intl.formatMessage({id: 'globalConfig.ha.neverStopVm.retry.delay', defaultMessage: 'VM Retry HA Start Inverval'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.neverStopVm.retry.delay.description', defaultMessage: "### VM Retry HA Start Inverval\n\nThe interval for a Neverstop VM to retry an HA start after the previous HA start attempt fails. Default: 60. Unit: second."}),
      formItem: {
        validatorName: 'validZeroSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.self.fencer.strategy',
      templateName: intl.formatMessage({id: 'globalConfig.ha.self.fencer.strategy', defaultMessage: 'VM HA Policy'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.self.fencer.strategy.description', defaultMessage: "### High Availability Policy\n\n1. The high availability policy of virtual machines. Default: Permissive. Valid values: Permissive and Force.\n\n2. The value Permissive indicates that if a virtual machine is in unknown state, the management node does not migrate the virtual machine and the self fencer process that runs on the host does not stop the virtual machine.\n\n3. The value Force indicates that if the condition that triggers high availability migration is met, the management node migrates the virtual machine to another host."}),
      formItem: {
        translateValue: 'translateSelectValue',
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'Permissive',
            displayName: intl.formatMessage({id: 'template.Permissive', defaultMessage: 'Permissive'})
          },
          {
            value: 'Force',
            displayName: intl.formatMessage({id: 'template.Force', defaultMessage: 'Force'})
          },
        ]
      }
    },
    {
      key: 'host.ping.interval',
      templateName: intl.formatMessage({id: 'globalConfig.host.ping.interval', defaultMessage: 'Host Ping Interval'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.host.ping.interval.description', defaultMessage: "### Host Ping Interval\n\nSpecify the time interval at which the management node checks the connectivity of the host. If the check (ping) is successful, it indicates that the host is in a connected state. Default: 60. Unit: second."}),
      formItem: {
        validatorName: 'validOneSeconds',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'host.ping.maxFailure',
      templateName: intl.formatMessage({id: 'globalConfig.host.ping.maxFailure', defaultMessage: 'Max Failed Attempts for Compute Node Inspection'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.host.ping.maxFailure.description', defaultMessage: "### Max Failed Attempts for Compute Node Inspection\n\nSpecify the maximum number of failed attempts allowed when the management node inspects compute nodes. Default: 3."}),
      formItem: {
        validatorName: 'validZeroTimes',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ci', defaultMessage: 'times'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'kvm.testSshPortOpenTimeout',
      templateName: intl.formatMessage({id: 'globalConfig.kvm.testSshPortOpenTimeout', defaultMessage: 'Host SSH Reconnection Timeout'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.kvm.testSshPortOpenTimeout.description', defaultMessage: "### Host SSH Reconnection Timeout\n\nSpecify the timeout period for SSH reconnection attempts to a host. If the SSH connection is not established within this period, the reconnection attempt is considered failed. Default: 300. Unit: second."}),
      formItem: {
        validatorName: 'validaKVMTestSshPortOpenTimeout',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'kvm.reservedMemory',
      templateName: intl.formatMessage({id: 'globalConfig.kvm.reservedMemory', defaultMessage: 'Reserved Memory of Host'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.kvm.reservedMemory.description', defaultMessage: "The reserved memory size of hosts that apply KVM virtualization. Default: 1 GB. Unit: GB, MB, and KB."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.kvm.reservedMemory.alert', defaultMessage: `If you set this parameter on the details page of a cluster, this global setting does not take effect on the cluster.`}),
      formItem: {
        validatorName: 'validReservedCapacity',
        translateValue: 'translateStorageValueWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 'B',
            displayName: intl.formatMessage({id: 'template.unit.B', defaultMessage: 'B'})
          },
          {
            value: 'K',
            displayName: intl.formatMessage({id: 'template.unit.KB', defaultMessage: 'KB'})
          },
          {
            value: 'M',
            displayName: intl.formatMessage({id: 'template.unit.MB', defaultMessage: 'MB'})
          },
          {
            value: 'G',
            displayName: intl.formatMessage({id: 'template.unit.GB', defaultMessage: 'GB'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'mevoco.overProvisioning.primaryStorage',
      templateName: intl.formatMessage({id: 'globalConfig.mevoco.overProvisioning.primaryStorage', defaultMessage: 'Data Storage Overcommit Ratio'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.mevoco.overProvisioning.primaryStorage.description', defaultMessage: "###  Data Storage Overcommit Ratio\n\nDefault: 1. This parameter is used to control the allocatable space for virtual machines on the data storage. Allocatable capacity of data storage = \\[(Actual capacity - Reserved capacity) × Overcommit ratio ] - (Threshold capacity + Sum of all VM disks + Snapshots + Image cache + Migration cache)"}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.mevoco.overProvisioning.primaryStorage.alert', defaultMessage: `1. An excessively large value may greatly affect storage performance or occupy much storage space, causing system I/O errors.
2. An excessively small value may cause the displayed available storage space to become a minus and the storage usage displayed on the Dashboard and other relevant places to exceed 100%.
3. If you set this parameter on the details page of a primary storage, this System Parameter does not take effect on the primary storage.`}),
      formItem: {
        validatorName: 'validOverProvisioning',
        componentProps: {
  step: 0.01,
  precision: 2
},
        inputType: 'InputWithNumber',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'mevoco.overProvisioning.memory',
      templateName: intl.formatMessage({id: 'globalConfig.mevoco.overProvisioning.memory', defaultMessage: 'Memory Overcommit Ratio'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.mevoco.overProvisioning.memory.description', defaultMessage: "### Memory Overcommit Ratio\n\nDefault: 1. Controls the amount of virtual memory capacity allocated to a virtual machine. The calculation formula: Physical Memory Capacity × Memory Overcommitment Ratio = Allocatable Virtual Memory Capacity."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.mevoco.overProvisioning.memory.alert', defaultMessage: `1. An excessively large value may greatly affect host memory performance, causing system out-of-memory (OOM) errors.
2. An excessively small value may cause the displayed available memory size to become a minus and the memory utilization displayed on the Dashboard and other relevant places to exceed 100%.
3. If you set this parameter on the details page of a cluster, this global setting does not take effect on the cluster.`}),
      formItem: {
        validatorName: 'validOverProvisioning',
        componentProps: {
  step: 0.01,
  precision: 2
},
        inputType: 'InputWithNumber',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'localStoragePrimaryStorage.liveMigrationWithStorage.allow',
      templateName: intl.formatMessage({id: 'globalConfig.localStoragePrimaryStorage.liveMigrationWithStorage.allow', defaultMessage: 'Change Host Online on Local Storage'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.localStoragePrimaryStorage.liveMigrationWithStorage.allow.description', defaultMessage: "### Change Host Online on Local Storage\n\nSpecify whether to enable online changing hosts for virtual machines on a local storage. Default: Enabled. If enabled, virtual machines on a local storage can online change hosts, including Change Host and Change Host and Data Storage."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'host.cpu.overProvisioning.ratio',
      templateName: intl.formatMessage({id: 'globalConfig.host.cpu.overProvisioning.ratio', defaultMessage: 'CPU Overcommit'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.host.cpu.overProvisioning.ratio.description', defaultMessage: "The CPU overcommitment. This parameter is used to control the vCPUs allocated to a VM instance. Default: 10, integer. Formula: Physical CPU threads x CPU overcommit = Allocable number of vCPUs."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.host.cpu.overProvisioning.ratio.alert', defaultMessage: `1. An excessively large value may greatly reduce host performance and cause application stuck.
2. An excessively small value may cause the displayed available CPU cores to become a minus and the CPU utilization displayed on the Dashboard and other relevant places to exceed 100%.
3. If you set this parameter on the details page of a cluster, this global setting does not take effect on the cluster.`}),
      formItem: {
        validatorName: 'validHostCpuOverProvisioningRatio',
        inputType: 'InputWithNumber',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'mevoco.threshold.primaryStorage.physicalCapacity',
      templateName: intl.formatMessage({id: 'globalConfig.mevoco.threshold.primaryStorage.physicalCapacity', defaultMessage: 'Data Storage Utilization Threshold'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.mevoco.threshold.primaryStorage.physicalCapacity.description', defaultMessage: "### Data Storage Utilization Threshold\n\nSpecify a threshold for data storage utilization to prevent overuse of storage space.This is particularly important when storage overcommitment is enabled, as excessive allocation can lead to storage overflow and cause virtual machine storage failures. Default: 0.9.\n\nNote: When the data storage usage reaches the set threshold, the system will prohibit adding new disks. Existing disks are not affected and work as expected."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.mevoco.threshold.primaryStorage.physicalCapacity.alert', defaultMessage: `The value is a floating number that ranges from 0 to 1 (inclusive), with a highest precision of 4.`}),
      formItem: {
        validatorName: 'validPSCapacity',
        componentProps: {
  step: 0.0001,
  precision: 4
},
        inputType: 'InputWithNumber',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.allow.slibing.cross.clusters',
      templateName: intl.formatMessage({id: 'globalConfig.ha.allow.slibing.cross.clusters', defaultMessage: 'VM Cross-Cluster HA '}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.allow.slibing.cross.clusters.description', defaultMessage: "Specifies whether to enable VM migration across clusters to achieve high availability. Default: false. If set to true, hosts across clusters can be detected to achieve VM high availability. Before you enable this feature, make sure that clusters are well connected."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'primaryStorage.reservedCapacity',
      templateName: intl.formatMessage({id: 'globalConfig.primaryStorage.reservedCapacity', defaultMessage: 'Data Storage Reserved Capacity'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.primaryStorage.reservedCapacity.description', defaultMessage: "### Data Storage Reserved Capacity\n\nSpecify a reserved space for data storage. Default: 1GB. Unit: KB, MB, GB, and TB.\n\n- For local storage and distributed storage, note that the system will set this reserved capacity for each storage pool (i.e., the actual effective reserved capacity = the specified reserved capacity value × number of storage pools). Please set a reasonable value to avoid exceeding the total physical data storage capacity.\n- For other storage, the reserved capacity is set to the specified value.\n\nNote: The reserved capacity of data storage does not affect the normal read/write operations of existing disks."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.primaryStorage.reservedCapacity.alert', defaultMessage: `The reserved storage space of a Data Storage ranges from 1 B to 1 TB.`}),
      formItem: {
        validatorName: 'validReservedCapacity',
        translateValue: 'translateStorageValueWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 'B',
            displayName: intl.formatMessage({id: 'template.unit.B', defaultMessage: 'B'})
          },
          {
            value: 'K',
            displayName: intl.formatMessage({id: 'template.unit.KB', defaultMessage: 'KB'})
          },
          {
            value: 'M',
            displayName: intl.formatMessage({id: 'template.unit.MB', defaultMessage: 'MB'})
          },
          {
            value: 'G',
            displayName: intl.formatMessage({id: 'template.unit.GB', defaultMessage: 'GB'})
          },
          {
            value: 'T',
            displayName: intl.formatMessage({id: 'template.unit.TB', defaultMessage: 'TB'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'backupStorage.reservedCapacity',
      templateName: intl.formatMessage({id: 'globalConfig.backupStorage.reservedCapacity', defaultMessage: 'Reserved Capacity for Image Storage'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.backupStorage.reservedCapacity.description', defaultMessage: "### Reserved Capacity for Image Storage\n\nThe reserved storage space for an image storage when it is being used. Default is 1GB, unit is KB/MB/GB/TB."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.backupStorage.reservedCapacity.alert', defaultMessage: `The reserved storage space of a backup storage ranges from 1 B to 1 TB.`}),
      formItem: {
        validatorName: 'validReservedCapacity',
        translateValue: 'translateStorageValueWithUnit',
        formatFunction: 'formatUnitWithUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: 'B',
            displayName: intl.formatMessage({id: 'template.unit.B', defaultMessage: 'B'})
          },
          {
            value: 'K',
            displayName: intl.formatMessage({id: 'template.unit.KB', defaultMessage: 'KB'})
          },
          {
            value: 'M',
            displayName: intl.formatMessage({id: 'template.unit.MB', defaultMessage: 'MB'})
          },
          {
            value: 'G',
            displayName: intl.formatMessage({id: 'template.unit.GB', defaultMessage: 'GB'})
          },
          {
            value: 'T',
            displayName: intl.formatMessage({id: 'template.unit.TB', defaultMessage: 'TB'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'zwatch.scrape.interval',
      templateName: intl.formatMessage({id: 'globalConfig.zwatch.scrape.interval', defaultMessage: 'Monitoring Data Sampling Interval'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.zwatch.scrape.interval.description', defaultMessage: "The interval of sampling monitoring data. Default: 20. Unit: second. The interval must be equal to or greater than 15 seconds."}),
      formItem: {
        validatorName: 'validZwatchScrapeInterval',
        translateValue: 'translateSecondTime',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'second', defaultMessage: ' seconds'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'prometheus.storage.local.retention',
      templateName: intl.formatMessage({id: 'globalConfig.prometheus.storage.local.retention', defaultMessage: 'Monitoring Data Retention Period'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.prometheus.storage.local.retention.description', defaultMessage: "### Monitoring Data Retention Period\n\nSpecify the maximum duration for locally retained monitoring data. Default: 6. Unit: month. Valid values: 1 to 12."}),
      formItem: {
        validatorName: 'validRangeMonth',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'month', defaultMessage: 'months'})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'quota.snapshot.volume.num',
      templateName: intl.formatMessage({id: 'globalConfig.quota.snapshot.volume.num', defaultMessage: 'Volume Snapshot Default Quota for Tenant'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.quota.snapshot.volume.num.description', defaultMessage: "The default quota of disk snapshots for a tenant (sub-account/project). Default: 200."}),
      formItem: {
        validatorName: 'validZeroIndividual',
        translateValue: 'translateSingleUnit',
        formatFunction: 'formatUnitWithNoUnit',
        inputType: 'InputWithUnit',
        unitList: [
          {
            value: '',
            displayName: intl.formatMessage({id: 'count.ge', defaultMessage: ' '})
          },
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'kvm.vm.cpuMode',
      templateName: intl.formatMessage({id: 'globalConfig.kvm.vm.cpuMode', defaultMessage: 'VM CPU Mode'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.kvm.vm.cpuMode.description', defaultMessage: "### Virtual Machine CPU Mode\n\nThis setting allows you to configure whether virtual machines inherit the CPU model and features of their host machine or emulate a different CPU type. This can be useful for meeting specific business requirements.\n\nOptional modes:\n\n1. None (default): The platform emulates a CPU type, which is a subset of the host machine's CPU features.\n2. Compatible: The virtual machine's CPU model is set to match the host machine's CPU model as closely as possible. This mode is recommended for migration scenarios.\n3. Passthrough: The virtual machine's CPU model and features are identical to those of the host machine. This mode provides the most accurate CPU emulation, but may cause issues with nested virtualization or migration between different CPU types.\n4. Custom (specific CPU model): The virtual machine is configured to emulate a specific CPU type. This mode allows you to specify a custom CPU model that is different from the host machine's CPU.\n\nNotes:\n\n1. Passthrough mode supports nested virtualization, but may cause issues with migration between different CPU types or viewing CPU usage rates.\n2. This System Parameter only applies to x86_64 CPU architectures.\n3. If a virtual machine has already been configured with a custom CPU model, this System Parameter will not take effect for that virtual machine.\n4. If a cluster has been configured to specify a virtual machine's CPU model, this System Parameter will not take effect for that cluster.\n5. After modifying the CPU mode, you must restart the virtual machine for the changes to take effect."}),
      formItem: {
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'none',
            displayName: intl.formatMessage({id: 'template.none', defaultMessage: 'none'})
          },
          {
            value: 'host-model',
            displayName: intl.formatMessage({id: 'template.host-model', defaultMessage: 'host-model'})
          },
          {
            value: 'host-passthrough',
            displayName: intl.formatMessage({id: 'template.host-passthrough', defaultMessage: 'host-passthrough'})
          },
        ]
      }
    },
    {
      key: 'mevoco.aio.native',
      templateName: intl.formatMessage({id: 'globalConfig.mevoco.aio.native', defaultMessage: 'Support for Kernel AIO'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.mevoco.aio.native.description', defaultMessage: "Specifies whether to enable kernel AIO. Default: false. If set to true, make sure that VM Cache Mode is set to none. "}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'sharedblock.qcow2.allocation',
      templateName: intl.formatMessage({id: 'globalConfig.sharedblock.qcow2.allocation', defaultMessage: 'Disk Preallocation Policy in SAN Storage'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.sharedblock.qcow2.allocation.description', defaultMessage: "### Disk Preallocation Policy in SAN Storage\n\nDefault: metadata. The preallocation policy for disks in a SAN data storage. Valid values: none and metedata."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.sharedblock.qcow2.allocation.alert', defaultMessage: `metadata: Space is preallocated for metadata. none: No space is preallocated.`}),
      formItem: {
        inputType: 'Select',
        unitList: [
        ],
        selectList: [
          {
            value: 'none',
            displayName: intl.formatMessage({id: 'template.none', defaultMessage: 'none'})
          },
          {
            value: 'metadata',
            displayName: intl.formatMessage({id: 'template.metadata', defaultMessage: 'metadata'})
          },
        ]
      }
    },
    {
      key: 'vm.emulateHyperV',
      templateName: intl.formatMessage({id: 'globalConfig.vm.emulateHyperV', defaultMessage: 'VM Hyper-V'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.vm.emulateHyperV.description', defaultMessage: "### VM Hyper-V\n\nDefault: disabled. Specifies whether to enable Hyper-V emulation for a VM."}),
      templateAlertMessage: intl.formatMessage({id: 'globalConfig.vm.emulateHyperV.alert', defaultMessage: `If you set this parameter on the details page of a cluster, this System Parameter does not take effect on the cluster.`}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'kvm.enable.host.tcp.connection.check',
      templateName: intl.formatMessage({id: 'globalConfig.kvm.enable.host.tcp.connection.check', defaultMessage: 'Quick Host Connection Status Detection'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.kvm.enable.host.tcp.connection.check.description', defaultMessage: "### Quick Host Connection Status Detection\n\nSpecify whether to enable or disable the quick detection of host connection status. Default: disabled. If enabled, the system will reduce the time interval between connection status checks."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'ha.enable',
      templateName: intl.formatMessage({id: 'globalConfig.ha.enable', defaultMessage: 'VM HA'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.ha.enable.description', defaultMessage: "### VM HA\n1. Specifies whether to enable high availability for virtual machines. Default: true.\n\n2. If set to false, the high availability feature is disabled globally for virtual machines. Please proceed with caution."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'mevoco.deleteTempImages',
      templateName: intl.formatMessage({id: 'globalConfig.mevoco.deleteTempImages', defaultMessage: 'Auto Delete Temporary Image'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.mevoco.deleteTempImages.description', defaultMessage: "### Auto Delete Temporary Image\n\nSpecify whether to automatically delete temporary images generated while cloning virtual machines. Default: enabled."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'zwatch.thirdpartyAlert.enable',
      templateName: intl.formatMessage({id: 'globalConfig.zwatch.thirdpartyAlert.enable', defaultMessage: 'Extended Alarm Notification'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.zwatch.thirdpartyAlert.enable.description', defaultMessage: "Specifies whether to enable the extended alarm notification feature. Default: false. If set to true, extended alarm notifications can be displayed on the UI."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
    {
      key: 'kvm.install.host.shutdown.hook',
      templateName: intl.formatMessage({id: 'globalConfig.kvm.install.host.shutdown.hook', defaultMessage: 'HA Time Optimization in Shutdown Hosts'}),
      templateDescription: intl.formatMessage({id: 'globalConfig.kvm.install.host.shutdown.hook.description', defaultMessage: "### HA Time Optimization in Shutdown Hosts\n\nSpecifies whether to automatically power off VMs and disable sanlock on hosts when performing shutdown or reboot operations. Default value: true.\n\n  - Scenario: Applies to high availability scenarios.\n  - Note: After you change this parameter, you need to reconnect the host to take effect."}),
      formItem: {
        inputType: 'Switch',
        unitList: [
        ],
        selectList: [
        ]
      }
    },
  ]
}

