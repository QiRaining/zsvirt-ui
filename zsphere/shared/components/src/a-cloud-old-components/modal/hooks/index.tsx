import { gql } from "@apollo/client";
import { usePersistFn } from "ahooks";
import hash from "hash.js";
import { useState } from "react";
import { useIntl } from "react-intl";

interface IProps {
  validate: () => any;
  validatePassword?: (password: string) => Promise<boolean>;
}

export const useValidatePassword = ({ validate, validatePassword }: IProps) => {
  const intl = useIntl();
  const userInfo = JSON.parse(localStorage.getItem("currentUser") as string);
  const loginType = JSON.parse(localStorage.getItem("loginType") as string);
  const userType = JSON.parse(localStorage.getItem("usertype") as string);

  const [validateModalVisible, setValidateModalVisible] =
    useState<boolean>(false);

  const transLoginType = (type: string) => {
    if (type === "IAM1") {
      return "account";
    }
    if (type === "IAM2" && userType === "local") {
      return "IAM2";
    }
    if (type === "IAM2" && userType !== "local") {
      return "ldap";
    }
    return "";
  };

  let validatePasswordAction: any;
  if (!validatePassword)
    validatePasswordAction = async (password: string) => {
      const client = window.g_main.apolloClient;
      const param = {
        query: gql`
          query validatePassword(
            $loginName: String!
            $password: String!
            $loginType: String!
          ) {
            validatePassword(
              loginName: $loginName
              password: $password
              loginType: $loginType
            ) {
              deleteAble
            }
          }
        `,
        variables: {
          loginName: userInfo?.username,
          password:
            transLoginType(loginType) === "ldap"
              ? password
              : hash.sha512().update(password).digest("hex"),
          loginType: transLoginType(loginType),
        },
      };
      const { data: resp } = await client.query(param);
      return resp?.validatePassword?.deleteAble;
    };
  else validatePasswordAction = validatePassword;

  //* **********
  const onConfirmOk = usePersistFn(async (values: any) => {
    if (!values.password)
      throw intl.formatMessage({
        id: "pleaseInputPassword",
        defaultMessage: "Enter Password",
      });
    const result = await validatePasswordAction(values.password);
    if (result) {
      setValidateModalVisible(false);

      await validate();
    } else {
      throw intl.formatMessage({
        id: "passwordErrorPleaseAgainInput",
        defaultMessage: "Wrong password. Please try again.",
      });
    }
  });

  return {
    validateModalVisible,
    setValidateModalVisible,
    onConfirmOk,
    username: userInfo?.username,
  };
};
