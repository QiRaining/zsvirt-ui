import { gql, useQuery } from "@apollo/client";
import { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";

import type { IRandomWordParams } from "../login-access";

function parseGlobalConfigPassword(configString: string) {
  const [check, rangeString] = configString.split(",");
  const range = rangeString.split("-");

  return {
    enabled: Boolean(parseInt(check[0], 10)),
    checkLowercase: Boolean(parseInt(check[1], 10)),
    checkUppercase: Boolean(parseInt(check[2], 10)),
    checkNumber: Boolean(parseInt(check[3], 10)),
    checkSpecialWords: Boolean(parseInt(check[4], 10)),
    minimum: parseInt(range[0], 10),
    maximum: parseInt(range[1], 10),
  };
}

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

export function useQueryConsolePasswordGlobalConfig() {
  const { data } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "mevoco",
      name: "vm.console.password.strength.check.config",
    },
  });

  const configString = data?.globalConfig?.value;
  if (!configString) {
    return null;
  }
  return parseGlobalConfigPassword(configString);
}

export function useConsolePasswordValidator(
  config?: ReturnType<typeof parseGlobalConfigPassword> | null,
) {
  const intl = useIntl();

  const randomConfig: IRandomWordParams = useMemo(() => {
    if (!config?.enabled) {
      return {
        randomFlag: true,
        min: 6,
        max: 8,
        isWindow: false,
      };
    }

    return {
      randomFlag: true,
      min: config.minimum,
      max: config.maximum,
      isWindow: false,
    };
  }, [config]);

  const validator = useCallback(
    (value?: string) => {
      const { checkLowercase, checkNumber, checkSpecialWords, checkUppercase } =
        config ?? {};

      if (!value) {
        return Promise.resolve();
      }

      if (
        checkLowercase &&
        checkNumber &&
        checkSpecialWords &&
        checkUppercase &&
        !/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[-`=[\\\];',./~!@#$%^&*()_+|{}:"<>?]).{6,}$/.test(
          value,
        )
      ) {
        return Promise.reject(
          intl.formatMessage({
            id: "vm.field.password.validator.format",
            defaultMessage: "Specify a combination of digits, letters, and special characters",
          }),
        );
      }

      return Promise.resolve();
    },
    [intl, config],
  );

  return {
    randomConfig,
    validator,
  };
}
