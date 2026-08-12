import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  CreatePSSystemTagPayload as ICreatePSSystemTagPayload,
  DeletePSSystemTagPayload as IDeletePSSystemTagPayload,
  PrimaryStorageVO as IPrimaryStorage,
  UpdatePSSystemTagPayload as IUpdatePSSystemTagPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createUpdateColdMigrateNetworkSchema,
  type UpdateColdMigrateNetworkFormValues,
} from "./schema";

const createPSTag = gql`
  mutation createPSTag($input: CreatePSSystemTagInput!) {
    createPSTag(input: $input) {
      actionId
    }
  }
`;

const deletePSTag = gql`
  mutation deletePSTag($input: DeletePSSystemTagInput!) {
    deletePSTag(input: $input) {
      actionId
    }
  }
`;

const updatePSTag = gql`
  mutation updatePSTag($input: UpdatePSSystemTagInput!) {
    updatePSTag(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo(() => {
    const value: UpdateColdMigrateNetworkFormValues = {
      coldMigrateNetwork: "",
    };
    if (selectedList?.length) {
      value.coldMigrateNetwork =
        selectedList[0]?.systemTag?.coldMigrateNetwork ?? "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createUpdateColdMigrateNetworkSchema(intl),
    [intl],
  );
  const form = useForm<UpdateColdMigrateNetworkFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const onOk = async (value: UpdateColdMigrateNetworkFormValues) => {
    const oldValue = defaultValues?.coldMigrateNetwork;
    const currentValue = value?.coldMigrateNetwork;
    // 创建
    if (!oldValue && currentValue) {
      const payload: ICreatePSSystemTagPayload = {
        resourceType: "PrimaryStorageVO",
        resourceUuid: selectedList?.[0].uuid,
        tag: `primaryStorage::migrate::network::cidr::${currentValue}`,
      };
      doAction({
        mutation: createPSTag,
        payload,
        name: intl.formatMessage({
          id: "create.coldMigrateNetwork",
          defaultMessage: "Create Cold Migration Network",
        }),
        total: 1,
        onFinish: () => {
          refetch?.();
        },
      });
    }
    // 更新
    if (oldValue && currentValue) {
      const payload: IUpdatePSSystemTagPayload = {
        resourceUuid: selectedList?.[0].uuid,
        oldTag: `primaryStorage::migrate::network::cidr::${defaultValues?.coldMigrateNetwork}`,
        tag: `primaryStorage::migrate::network::cidr::${currentValue}`,
      };

      doAction({
        mutation: updatePSTag,
        payload,
        name: intl.formatMessage({
          id: "update.coldMigrateNetwork",
          defaultMessage: "Modify Cold Migration Network",
        }),
        total: 1,
        onFinish: () => {
          refetch?.();
        },
      });
    }
    // 删除
    if (oldValue && !currentValue) {
      const payload: IDeletePSSystemTagPayload = {
        resourceUuid: selectedList?.[0].uuid,
        oldTag: `primaryStorage::migrate::network::cidr::${defaultValues?.coldMigrateNetwork}`,
      };
      doAction({
        mutation: deletePSTag,
        payload,
        name: intl.formatMessage({
          id: "delete.coldMigrateNetwork",
          defaultMessage: "Delete Cold Migration Network",
        }),
        total: 1,
        onFinish: () => {
          refetch?.();
        },
      });
    }
  };

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const coldMigrateNetworkError =
            form.getFieldState("coldMigrateNetwork").error;
          throw {
            errorFields: [
              {
                name: ["coldMigrateNetwork"],
                errors: coldMigrateNetworkError?.message
                  ? [coldMigrateNetworkError.message]
                  : [],
              },
            ],
          };
        }

        return form.getValues();
      },
      resetFields: () => {
        form.reset(defaultValues);
      },
    }),
    [defaultValues, form],
  );

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "change.coldMigrateNetwork",
        defaultMessage: "Modify Cold Migration Network",
      })}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="coldMigrateNetwork"
          label={intl.formatMessage({
            id: "coldMigrateNetwork",
            defaultMessage: "Cold Migration Network",
          })}
          size="m"
          labelTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "primaryStorage.field.coldMigrateNetwork.tooltip",
                defaultMessage: `### Cold Migration Network
1. A network dedicated to VM cold migrations across  Distributed Storage  primary storage. Ensure the cold network connection between  Distributed Storage  Data Storage if you set this parameter.
2. If you do not set a cold migration network, the system uses the management network for VM cold migrations across Distributed Storage primary storage.`,
              })}
            </ReactMarkdown>
          }
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
