import { RadioGroup } from "@zstack/design";
import { Form, Input } from "@zstack/zsphere-components";
import { ZSVForm, TextArea } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { AccountType } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import useGlobalConfigValidatePassword from "../../action/useGlobalConfigValidatePassword";
import RoleSelect from "../../components/role-select";
import UserGroupSelect from "../../components/userGroup-select";

import styles from "./style.module.less";

const { Card } = ZSVForm;
const { Item } = Form;

interface IBasicConfigProps {
  isCreate?: boolean;
  form: any;
}

const BasicConfig: React.FC<IBasicConfigProps> = ({ isCreate, form }) => {
  const intl = useIntl();
  const { isRequired, commonNameRules, commonDescriptionRules } =
    useValidator(intl);

  const globalConfigValidatePassword = useGlobalConfigValidatePassword();

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Item
        label={intl.formatMessage({ id: "username", defaultMessage: "Username" })}
        name="name"
        rules={commonNameRules}
      >
        <Input className={styles["width-320"]} />
      </Item>

      <Item
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
        name="description"
        rules={commonDescriptionRules}
      >
        <TextArea
          className={styles["width-320"]}
          rows={4}
          maxLength={256}
          isShowLimit
          limit={256}
        />
      </Item>

      {isCreate ? (
        <Item
          label={intl.formatMessage({ id: "type", defaultMessage: "Type" })}
          name="type"
        >
          <RadioGroup
            options={[
              {
                value: AccountType.Normal,
                label: intl.formatMessage({
                  id: "normal.user",
                  defaultMessage: "Regular User",
                }),
              },
              {
                value: AccountType.SystemAdmin,
                label: intl.formatMessage({
                  id: "admin.user",
                  defaultMessage: "Admin User",
                }),
              },
            ]}
          />
        </Item>
      ) : (
        <Item
          label={intl.formatMessage({ id: "type", defaultMessage: "Type" })}
          name="type"
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "create.account.user.type.tooltip",
                defaultMessage: "User Type",
              })}
            </ReactMarkdown>
          }
        >
          {form.getFieldValue("type") === AccountType.SystemAdmin
            ? intl.formatMessage({
                id: "admin.user",
                defaultMessage: "Admin User",
              })
            : intl.formatMessage({
                id: "normal.user",
                defaultMessage: "Regular User",
              })}
        </Item>
      )}

      {isCreate && (
        <>
          <Form.Item
            name="password"
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            rules={[
              isRequired(),
              {
                validator: globalConfigValidatePassword,
              },
            ]}
          >
            <Input.Password className={styles["width-320"]} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={intl.formatMessage({
              id: "confirm.password",
              defaultMessage: "Confirm Password",
            })}
            dependencies={["password"]}
            rules={[
              isRequired(),
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    intl.formatMessage({
                      id: "subAccountManagement.field.confirmPassword.validator.format",
                      defaultMessage:
                        "Passwords do not match. Enter passwords again.",
                    }),
                  );
                },
              }),
            ]}
          >
            <Input.Password className={styles["width-320"]} />
          </Form.Item>
        </>
      )}

      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
        {({ getFieldValue }) => {
          const isNormalAccount =
            getFieldValue("type") !== AccountType.SystemAdmin;
          return (
            <>
              {/* 选择角色 */}
              <RoleSelect
                isCreate={isCreate}
                multiple={isNormalAccount}
                form={form}
              />

              {isNormalAccount ? (
                <>
                  {/* 选择用户组 */}
                  <UserGroupSelect
                    form={form}
                    tooltip={intl.formatMessage({
                      id: "create.account.user.group.tooltip",
                      defaultMessage: `### User Group

Join user groups. After joining, the user will inherit all roles and shared resources from the user group.

- A user can join one or more user groups.
- When a user joins multiple user groups, the user will have the roles and shared resources inherited from all those groups.`,
                    })}
                  />
                </>
              ) : null}
            </>
          );
        }}
      </Form.Item>
    </Card>
  );
};

export default BasicConfig;
