import { useLazyQuery } from "@apollo/client";
import { Spin } from "@zstack/design";
import { Form, Select } from "@zstack/zsphere-components";
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
import { formatResourceName } from "@zstack/zsphere-utils";
import { isEqual, uniq } from "lodash-es";
import React, { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import {
  shareTypeList,
  shareResource,
  revokeResourceSharing,
  updateResourceSharingGroup,
  ownerList,
} from "../../../../gql/shared.gql";
import { useShareTypeMap } from "../components/share-type";
import UserSelect from "../components/user-select";
// import styles from "./style.module.less";

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

  const isMultipleType = useMemo(() => {
    return uniq(typeList).length > 1;
  }, [data]);

  useEffect(() => {
    if (visible && uuids.length === 1 && typeList[0] === ShareType.Group) {
      queryCurrentAccount();
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

      const selectAccount = currentAccountData?.ownerList?.list ?? [];

      form.setFields([
        { name: "shareType", value: target?.value },
        { name: "userList", value: selectAccount },
      ]);
      setFormData({
        ...formData,
        shareType: target?.value,
        userList: selectAccount,
      });
    }
  }, [isMultipleType, shareTypeOptions, currentAccountData]);

  const onSubmit = async (values: any) => {
    if (values.shareType === ShareType.Public) {
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
    if (values.shareType === ShareType.None) {
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
    if (values.shareType === ShareType.Group) {
      doAction({
        mutation: updateResourceSharingGroup,
        payload: {
          resourceUuids: uuids,
          accountUuids: values.userList?.map((cv: any) => cv.uuid) || [],
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
        },
        refetchPolicy: "finish",
        type: "Owner",
      });
    }
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
      onOk={onSubmit}
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
        </Form>
      </Spin>
    </DialogForm>
  );
};

export default Share;
