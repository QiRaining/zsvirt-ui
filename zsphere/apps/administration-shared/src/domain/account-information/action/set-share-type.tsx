import { gql, useLazyQuery } from "@apollo/client";
import { Button, DialogFooter, Spin } from "@zstack/design";
import { Switch, Form, Select } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  AccountType,
  Op,
  OwnerQueryType,
  ShareType,
} from "@zstack/zsphere-types";
import type {
  AccountVO as IAccount,
  UserGroup as IUserGroup,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import cls from "classnames";
import { isEqual, uniq } from "lodash-es";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useIntl } from "react-intl";

import {
  shareTypeList,
  shareResource,
  revokeResourceSharing,
  ownerList,
} from "../../../../gql/shared.gql";
import { useShareTypeMap } from "../components/share-type";
import UserSelect from "../components/user-select";
import UserGroupSelect from "../components/userGroup-select";
// import styles from "./style.module.less";

const STYLE_ERROR_FIELD = { marginTop: -8, paddingLeft: 168 } as const;

interface IErrorFieldProps {
  value?: React.ReactNode;
  className?: string;
}

const ErrorField = ({ value, className }: IErrorFieldProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      divRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [value]);

  if (!value) {
    return null;
  }
  return (
    <div
      ref={divRef}
      style={STYLE_ERROR_FIELD}
      className={cls(
        "ant-form-item-explain ant-form-item-explain-error",
        className,
      )}
    >
      {value}
    </div>
  );
};

const zsvShareResource = gql`
  mutation zsvShareResource($input: ZsvShareResourceToGroupInput!) {
    zsvShareResource(input: $input) {
      actionId
    }
  }
`;

const Share: React.FC<
  IActionWrapperProps<{
    uuid: string;
    [prop: string]: any;
  }>
> = ({
  visible,
  setVisible,
  selectedList,
  refetch,
  setSelectedList,
  ...extraProps
}: any) => {
  const intl = useIntl();
  const shareTypeMap = useShareTypeMap();
  const [form] = Form.useForm();
  const doAction = useAction();

  const uuids = useMemo(() => {
    return selectedList.map((cv: any) => cv.uuid);
  }, [selectedList]);

  const [queryType, { loading, data, refetch: refetchQueryType }] =
    useLazyQuery<{ shareTypeList: ShareType[] }, { uuids: string[] }>(
      shareTypeList,
    );
  const { shareTypeList: typeList = [] } = data || {};

  const [queryCurrentAccount, { data: currentAccountData }] = useLazyQuery(
    ownerList,
    {
      variables: {
        conditions: [
          {
            key: "resourceUuid",
            op: Op.eq,
            value: selectedList[0]?.uuid,
          },
        ],
        type: OwnerQueryType.Account,
      },
    },
  );

  const [queryCurrentAccountGroup, { data: currentAccountGroupData }] =
    useLazyQuery(ownerList, {
      variables: {
        conditions: [
          {
            key: "resourceUuid",
            op: Op.eq,
            value: selectedList[0]?.uuid,
          },
        ],
        type: OwnerQueryType.AccountGroup,
      },
    });

  const isMultipleType = useMemo(() => {
    return uniq(typeList).length > 1;
  }, [data]);

  useEffect(() => {
    if (visible && uuids.length === 1 && typeList[0] === ShareType.Group) {
      queryCurrentAccount();
      queryCurrentAccountGroup();
    }
  }, [typeList, uuids?.length, visible]);

  const shareTypeOptions = useMemo(() => {
    // 过滤类型
    const options = Object.keys(shareTypeMap)
      .map((cv) => ({
        key: cv,
        value: cv,
        label: shareTypeMap[cv as ShareType],
      }))
      .filter((cv) => cv.key !== extraProps?.filterShareType);
    return options;
  }, [data]);

  const initialValues = useMemo(() => {
    return isMultipleType
      ? {}
      : {
          shareType: ShareType.Public,
        };
  }, [isMultipleType]);

  const [formData, setFormData] = useState<any>(initialValues);

  useEffect(() => {
    // 多种默认为空
    if (isMultipleType) {
      form.setFields([{ name: "shareType", value: "" }]);
      setFormData({ ...formData, shareType: "" });
    } else {
      const target =
        shareTypeOptions.find((cv) => cv.key === typeList?.[0]) ||
        shareTypeOptions?.[0];

      const selectAccount = currentAccountData?.ownerList?.list || [];
      const selectUserGroup = currentAccountGroupData?.ownerList?.list || [];

      form.setFields([
        { name: "shareType", value: target?.value },
        { name: "specificUser", value: selectAccount.length > 0 },
        { name: "specificUserGroup", value: selectUserGroup.length > 0 },
        { name: "userList", value: selectAccount },
        { name: "userGroupList", value: selectUserGroup },
      ]);
      setFormData({
        ...formData,
        shareType: target?.value,
        userList: selectAccount,
        userGroupList: selectUserGroup,
      });
    }
  }, [
    isMultipleType,
    shareTypeOptions,
    currentAccountData,
    currentAccountGroupData,
  ]);

  const onSubmit = async () => {
    const {
      shareType,
      userList = [],
      userGroupList: _userGroupList = [],
      specificUser,
      specificUserGroup,
    } = form.getFieldsValue();

    if (shareType === ShareType.Group && !specificUser && !specificUserGroup) {
      form.setFieldsValue({
        errorField: intl.formatMessage({
          id: "shareType.resource.required.error.fail",
          defaultMessage: "Select a user or user group to share with.",
        }),
      });
      return;
    }
    if (shareType === ShareType.Public) {
      setVisible(false);
      doAction({
        mutation: shareResource,
        payload: {
          resourceUuids: uuids,
          toPublic: true,
        },
        name: intl.formatMessage({
          id: "public.share",
          defaultMessage: "Share globally",
        }),
        total: 1,
        onFinish: () => {
          refetch?.();
          refetchQueryType?.();
          setSelectedList?.([]);
        },
        refetchPolicy: "finish",
        type: "Owner",
      });
    }
    if (shareType === ShareType.None) {
      setVisible(false);
      doAction({
        mutation: revokeResourceSharing,
        payload: {
          resourceUuids: uuids,
          all: true,
        },
        name: intl.formatMessage({ id: "no.share", defaultMessage: "Not Share" }),
        total: 1,
        onFinish: () => {
          refetch?.();
          refetchQueryType?.();
          setSelectedList?.([]);
        },
        refetchPolicy: "finish",
        type: "Owner",
      });
    }
    form.validateFields().then(() => {
      setVisible(false);
      if (
        shareType === ShareType.Group &&
        (userList.length || _userGroupList.length) &&
        (specificUser || specificUserGroup)
      ) {
        doAction({
          mutation: zsvShareResource,
          payload: {
            resourceUuids: uuids,
            accountUuids: userList.map((it: IAccount) => it.uuid),
            userGroupUuids: _userGroupList.map((it: IUserGroup) => it.uuid),
            prevShareType: formData?.shareType || "",
          },
          name: intl.formatMessage({
            id: "assign.share",
            defaultMessage: "Share With Users/User Groups",
          }),
          total: 1,
          onFinish: () => {
            refetch?.();
            refetchQueryType?.();
            setSelectedList?.([]);
            form.resetFields();
          },
          type: "Owner",
        });
      }
    });
  };

  useEffect(() => {
    if (visible && uuids.length > 0) {
      queryType({
        variables: {
          uuids,
        },
      });
    }
  }, [uuids, visible]);

  useEffect(() => {
    if (!visible && !isEqual(formData, initialValues)) {
      setFormData(initialValues);
    }
  }, [formData, initialValues, visible]);

  const { isRequired } = useValidator(intl);

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "set.share.mode",
        defaultMessage: "Set Sharing Mode",
      })}
      onCancel={() => {
        setVisible(false);
      }}
      form={form}
      visible={visible}
      setVisible={setVisible}
      alertType="warning"
      alertMessage={intl.formatMessage({
        id: "shareType.modal.set.share.type.alert.info.case.single",
        defaultMessage:
          "Resources that are used by original users before a sharing mode modification are not affected until the resources are released.",
      })}
      resourceName={formatResourceName(selectedList, intl)}
      // className={styles.shareTypeModal}
      footer={
        <DialogFooter className="gap-2">
          <Button
            variant="link"
            onClick={() => {
              setVisible(false);
            }}
          >
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </DialogFooter>
      }
    >
      <Spin spinning={loading} fullscreen={false}>
        <Form form={form} initialValues={initialValues}>
          <Form.Item
            label={intl.formatMessage({
              id: "shareType",
              defaultMessage: "Sharing Mode",
            })}
          >
            <div className="flex flex-col gap-1">
              <Form.Item name="shareType" noStyle>
                <Select width="l" options={shareTypeOptions as any} />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item
            shouldUpdate={(prev, curr) => prev.shareType !== curr.shareType}
            noStyle
          >
            {({ getFieldValue }) => {
              const shareType = getFieldValue("shareType");

              if (shareType === ShareType.Group) {
                let specificUser = true;

                if (
                  !getFieldValue("userList")?.length &&
                  getFieldValue("userGroupList")?.length
                ) {
                  specificUser = false;
                }

                form.setFieldsValue({ specificUser });
              }

              if (shareType === ShareType.Group) {
                return (
                  <>
                    <Form.Item
                      name="specificUser"
                      label={intl.formatMessage({
                        id: "share.to.user",
                        defaultMessage: "Share with User",
                      })}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      shouldUpdate={(prev, curr) =>
                        prev.specificUser !== curr.specificUser
                      }
                      noStyle
                    >
                      {() => {
                        const specificUser = getFieldValue("specificUser");
                        if (!specificUser) {
                          form.setFieldsValue({ userList: [] });
                        }
                        if (specificUser) {
                          form.setFieldsValue({ errorField: "" });
                          return (
                            <UserSelect
                              form={form}
                              rules={[
                                isRequired(
                                  IIsRequiredType.select,
                                  intl.formatMessage({
                                    id: "user",
                                    defaultMessage: "User",
                                  }),
                                ),
                              ]}
                              defaultQuery={{
                                conditions: [
                                  {
                                    key: "type",
                                    op: Op.ne,
                                    value: AccountType.SystemAdmin,
                                  },
                                ],
                              }}
                            />
                          );
                        }
                        return null;
                      }}
                    </Form.Item>
                    <Form.Item
                      auth={{
                        resource: "virtualization.userGroup",
                        authKey: "list",
                        type: "view",
                      }}
                      name="specificUserGroup"
                      label={intl.formatMessage({
                        id: "share.to.user.group",
                        defaultMessage: "Share with User Group",
                      })}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      shouldUpdate={(prve, curr) =>
                        prve.specificUserGroup !== curr.specificUserGroup
                      }
                      noStyle
                    >
                      {() => {
                        const specificUserGroup =
                          getFieldValue("specificUserGroup");
                        if (!specificUserGroup) {
                          form.setFieldsValue({ userGroupList: [] });
                        }
                        if (getFieldValue("specificUserGroup")) {
                          form.setFieldsValue({ errorField: "" });
                          return (
                            <UserGroupSelect
                              form={form}
                              rules={[
                                isRequired(
                                  IIsRequiredType.select,
                                  intl.formatMessage({
                                    id: "userGroup",
                                    defaultMessage: "User Group",
                                  }),
                                ),
                              ]}
                              tooltip={intl.formatMessage({
                                id: "share.to.user.group.tooltip",
                                defaultMessage:
                                  "### User Group\n\nShare resources with user groups. After sharing, all users within the user group will have read access to the shared resources.",
                              })}
                            />
                          );
                        }
                        return null;
                      }}
                    </Form.Item>
                    <Form.Item noStyle name="errorField">
                      <ErrorField />
                    </Form.Item>
                  </>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Spin>
    </DialogForm>
  );
};

export default Share;
