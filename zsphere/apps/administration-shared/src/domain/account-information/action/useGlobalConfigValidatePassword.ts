import { gql } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { usePersistFn } from "ahooks";
import { useIntl } from "react-intl";

const useGlobalConfigValidatePassword = () => {
  const intl = useIntl() as any;
  const { apolloClient } = usePlatformStore() as any;

  const globalConfigGql = gql`
    query globalConfig {
      globalConfig(
        category: "passwordStrategy"
        name: "password.strength.check.config"
      ) {
        name
        category
        value
        uuid
      }
    }
  `;

  const validLength = async (
    value: string,
    max: number = 18,
    min: number = 6,
  ) => {
    const len = value.length;
    if (len > max || len < min) {
      throw new Error(
        intl.formatMessage(
          {
            id: "user.action.set.password.validator.format.length",
            defaultMessage: "Password length: {min}-{max}.",
          },
          { min, max },
        ),
      );
    }
    return;
  };

  const validContent = async (
    value: string,
    config: {
      checkUppercase: boolean;
      checkLowercase: boolean;
      checknumber: boolean;
      checkSpecialWords: boolean;
    },
  ) => {
    const testUppercase = /^(?:(?=.*[A-Z])).*$/;
    const testLowercase = /^(?:(?=.*[a-z])).*$/;
    const testnumber = /^(?:(?=.*[0-9])).*/;
    const testSpecialWords = /^(?:(?=.*[^A-Za-z0-9])).*/;
    const { checkLowercase, checknumber, checkSpecialWords, checkUppercase } =
      config;
    const testList = [
      {
        reg: testLowercase,
        check: checkLowercase,
        message: intl.formatMessage({
          id: "lowercase",
          defaultMessage: "Lowercase",
        }),
      },
      {
        reg: testUppercase,
        check: checkUppercase,
        message: intl.formatMessage({
          id: "uppercase",
          defaultMessage: "Uppercase",
        }),
      },
      {
        reg: testnumber,
        check: checknumber,
        message: intl.formatMessage({ id: "number", defaultMessage: "Number" }),
      },
      {
        reg: testSpecialWords,
        check: checkSpecialWords,
        message: intl.formatMessage({
          id: "specialWords",
          defaultMessage: "Special Characters",
        }),
      },
    ];
    const valid = testList.every((cv) => {
      if (cv.check) {
        return cv.reg.test(value);
      }
      return true;
    });
    if (valid) {
      return;
    }
    throw new Error(
      intl.formatMessage(
        {
          id: "user.action.set.password.validator.format",
          defaultMessage: "The password must contain {format}.",
        },
        {
          format: testList
            .filter((cv) => cv.check)
            .map((cv) => cv.message)
            .join(","),
        },
      ),
    );
  };

  const passwordValidator = usePersistFn(async (_rules, _value) => {
    const { data: passwordConfig } =
      (await apolloClient?.query({
        query: globalConfigGql,
      })) ?? {};
    const value = passwordConfig?.globalConfig.value;
    if (value) {
      let config: any = { enabled: false };
      try {
        config = JSON.parse(value);
      } catch (error) {
        console.log("解析全局配置失败:", error);
      }
      if (config.enabled) {
        const {
          minimum,
          maximum,
          checkUppercase,
          checkLowercase,
          checknumber,
          checkSpecialWords,
        } = config;
        await validLength(_value, maximum, minimum);
        await validContent(_value, {
          checkUppercase,
          checkLowercase,
          checknumber,
          checkSpecialWords,
        });
      } else {
        await validLength(_value);
      }
    } else {
      await validLength(_value);
    }
  });

  return passwordValidator;
};

export default useGlobalConfigValidatePassword;
