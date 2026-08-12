import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Form } from "@zstack/design";
import {
  FieldStack,
  InputPasswordField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type {
  GlobalConfig,
  UpdateAccountPayload,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import hash from "hash.js";
import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { updateAccount } from "../../../../gql/user.gql";
import {
  createChangePasswordSchema,
  type ChangePasswordFormValues,
} from "./schema";

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  errorCode?: string;
}

const globalConfigGql = gql`
  query getGlobalConfig {
    getGlobalConfig(
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

const ChangePasswordModal: React.FC<IProps> = ({
  visible,
  setVisible,
  errorCode,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  // 分开订阅，避免订阅整个 store
  const apolloClient = usePlatformStore((state) => state.apolloClient);
  const currentUser = usePlatformStore((state) => state.currentUser);

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
      checkNumber: boolean;
      checkSpecialWords: boolean;
    },
  ) => {
    const testUppercase = /^(?:(?=.*[A-Z])).*$/;
    const testLowercase = /^(?:(?=.*[a-z])).*$/;
    const testNumber = /^(?:(?=.*[0-9])).*/;
    const testSpecialWords = /^(?:(?=.*[^A-Za-z0-9])).*/;
    const { checkLowercase, checkNumber, checkSpecialWords, checkUppercase } =
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
        reg: testNumber,
        check: checkNumber,
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
    const { data: passwordConfig } = await apolloClient.query<{
      getGlobalConfig: GlobalConfig;
    }>({
      query: globalConfigGql,
    });
    const { value } = passwordConfig?.getGlobalConfig ?? {};
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
          checkNumber,
          checkSpecialWords,
        } = config;
        await validLength(_value, maximum, minimum);
        await validContent(_value, {
          checkUppercase,
          checkLowercase,
          checkNumber,
          checkSpecialWords,
        });
      } else {
        await validLength(_value);
      }
    } else {
      await validLength(_value);
    }
  });

  const ErrorMessageMap = {
    wrongOriginPassword: intl.formatMessage({
      id: "changePassword.wrongOriginPassword",
      defaultMessage: "The previous password is wrong.",
    }),
    repeatedPassword: intl.formatMessage({
      id: "changePassword.repeatedPassword",
      defaultMessage: "The new password cannot be the same as the previous one.",
    }),
  };

  const [errorMessage, setErrorMessage] = useState<string>("");
  const defaultValues = useMemo<ChangePasswordFormValues>(
    () => ({
      oldPassword: "",
      newPassword: "",
      repeatPassword: "",
    }),
    [],
  );
  const formSchema = useMemo(
    () => createChangePasswordSchema(intl, passwordValidator),
    [intl, passwordValidator],
  );
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const handleError = (e?: { code: string }) => {
    if (!e) {
      return;
    }
    if (e.code === "SYS.1006") {
      setErrorMessage(ErrorMessageMap.wrongOriginPassword);
    } else if (e.code === "LOGIN_CONTROL.1001") {
      setErrorMessage(ErrorMessageMap.repeatedPassword);
    }
  };

  const onOk = (values: ChangePasswordFormValues) => {
    const { oldPassword, newPassword } = values;
    const hashedOldPassword = hash.sha512().update(oldPassword).digest("hex");
    const hashedNewPassword = hash.sha512().update(newPassword).digest("hex");

    doAction<UpdateAccountPayload>({
      mutation: updateAccount,
      name: intl.formatMessage({
        id: "change.password",
        defaultMessage: "Change Password",
      }),
      total: 1,
      payload: {
        uuid: currentUser?.accountUuid as string,
        oldPassword: hashedOldPassword,
        password: hashedNewPassword,
      },
      onProgress: (result) => {
        if (result.error) {
          handleError(result.error?.error);
          setVisible(true);
          return;
        }
        if (errorCode) {
          window.location.reload();
        }
      },
    });
  };

  const alertMessage = useMemo(() => {
    if (errorCode) {
      return intl.formatMessage({
        id: "user.action.change.password.alert.case.expired",
        defaultMessage: "The password has expired. Please change the password and log in again.",
      });
    }
    return intl.formatMessage({
      id: "user.action.change.password.alert",
      defaultMessage: "This setting takes effect the next time you log in.",
    });
  }, [errorCode, intl]);

  const cancelText = useMemo<string>(() => {
    if (errorCode) {
      return intl.formatMessage({
        id: "quit.login",
        defaultMessage: "Quit Login",
      });
    }
    return intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" });
  }, [errorCode, intl]);

  const onCancel = useCallback(() => {
    if (errorCode) {
      navigate("/login");
    }
    setVisible(false);
    setErrorMessage("");
  }, [errorCode, setVisible]);

  return (
    <DialogForm
      onOk={onOk}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      cancelText={cancelText}
      onCancel={onCancel}
      alertType={errorCode ? "warning" : "info"}
      alertMessage={alertMessage}
      title={intl.formatMessage({
        id: "change.password",
        defaultMessage: "Change Password",
      })}
    >
      <Form {...form}>
        <FieldStack>
          <InputPasswordField
            form={form}
            name="oldPassword"
            label={intl.formatMessage({
              id: "user.action.set.password.old.password",
              defaultMessage: "Current Password",
            })}
            required
            size="m"
          />
          <InputPasswordField
            form={form}
            name="newPassword"
            label={intl.formatMessage({
              id: "user.action.set.password.new.password",
              defaultMessage: "New Password",
            })}
            required
            size="m"
          />
          <InputPasswordField
            form={form}
            name="repeatPassword"
            label={intl.formatMessage({
              id: "user.action.set.password.repeat.password",
              defaultMessage: "Confirm Password",
            })}
            required
            size="m"
          />
          {errorMessage && (
            <Alert
              variant="danger"
              style={{ marginTop: "-20px" }}
              display="weak"
            >
              {errorMessage}
            </Alert>
          )}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default ChangePasswordModal;
