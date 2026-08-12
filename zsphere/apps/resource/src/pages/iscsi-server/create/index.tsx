import { gql, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
} from "@zstack/design";
import {
  InputField,
  InputPasswordField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { queryClusterList } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type {
  Condition,
  IActionWrapperProps,
  IQuery,
} from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Zone as IZone,
  PrimaryStorageVO as IPrimaryStorage,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";
import { cloneDeep } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createIscsiServerSchema, type IscsiServerFormValues } from "./schema";

import style from "./style.module.less";

const _addIscsiServer = gql`
  mutation addIscsiServer($input: AddIscsiServerInput!) {
    addIscsiServer(input: $input) {
      actionId
    }
  }
`;

interface ICommon {
  name: string; // 名称
  ip: string;
  port: string;
  chapUserName?: string; // CHAP用户名
  chapUserPassword?: string; // CHAP密码
  clusterUuid?: string;
}

type IInitalValues = ICommon;

const initialValues: IInitalValues = {
  name: "",
  ip: "",
  port: "3260",
  chapUserName: "",
  chapUserPassword: "",
  clusterUuid: "",
};

const AddIscsiServer: React.FC<
  IActionWrapperProps<
    (IPrimaryStorage | ICluster | IZone) & { __typename: string }
  >
> = ({
  source,
  visible,
  setVisible,
  selectedList,
  setSelectedList: _setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const formSchema = useMemo(() => createIscsiServerSchema(intl), [intl]);
  const form = useForm<IscsiServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues as unknown as IscsiServerFormValues,
  });
  const dialogForm = useDialogHookFormAdapter(
    form,
    initialValues as unknown as IscsiServerFormValues,
  );

  const { zone } = useMemo(() => {
    const resource = selectedList?.[0] ?? source ?? {};
    let _zone: any = {};

    if (resource?.__typename === "Zone") {
      _zone = {
        uuid: resource.uuid!,
        name: resource.name!,
      };
    }

    return {
      zone: _zone,
    };
  }, [source?.uuid, selectedList]);

  const clusterDefaultQuery: IQuery = useMemo(() => {
    const conditions: Condition[] = [
      { key: "hypervisorType", op: Op.in, values: ["KVM", "baremetal2"] },
      { key: "state", op: Op.eq, value: "Enabled" },
    ];

    if (zone) {
      conditions.push({ key: "zoneUuid", op: Op.eq, value: zone?.uuid });
    }

    return {
      conditions,
    };
  }, [zone]);

  const { loading, data } = useQuery(queryClusterList, {
    variables: clusterDefaultQuery,
  });

  const clusterListMemo = useMemo<ICluster[]>(
    () => data?.clusterList?.list ?? [],
    [data],
  );

  const clusterOptions = useMemo(
    () =>
      clusterListMemo?.map((item) => ({
        label: item.name,
        value: item.uuid,
      })) ?? [],
    [clusterListMemo],
  );

  useEffect(() => {
    if (visible) {
      form.reset(initialValues as unknown as IscsiServerFormValues);
    }
  }, [form, visible]);

  const onOk = async (values: Record<string, unknown>) => {
    const params = cloneDeep(values);
    const {
      name,
      ip,
      port = 3260,
      chapUserName,
      chapUserPassword,
      clusterUuid,
    } = params;

    const param = Object.create(null);
    param.name = name;
    param.ip = ip;
    param.port = Number(port);
    if (chapUserName) {
      param.chapUserName = chapUserName;
    }
    if (chapUserPassword) {
      param.chapUserPassword = chapUserPassword;
    }
    if (clusterUuid) {
      param.clusterUuid = clusterUuid;
    }

    doAction({
      mutation: _addIscsiServer,
      payload: param,
      name: intl.formatMessage({
        id: "add.iSCSIStorage",
        defaultMessage: "Add iSCSI Storage",
      }),
      total: 1,
      type: "IscsiServer",
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <>
      <DialogForm
        form={dialogForm}
        visible={visible}
        setVisible={setVisible}
        onOk={onOk}
        title={intl.formatMessage({
          id: "add.iSCSIStorage",
          defaultMessage: "Add iSCSI Storage",
        })}
      >
        <Form {...form}>
          <FieldStack>
            <InputField
              form={form}
              name="name"
              label={intl.formatMessage({
                id: "name",
                defaultMessage: "Name",
              })}
              required
              size="m"
            />
            <InputField
              form={form}
              name="ip"
              label={intl.formatMessage({
                id: "ip",
                defaultMessage: "IP Address",
              })}
              required
              className={style["width-320"]}
            />
            <InputField
              form={form}
              name="port"
              label={intl.formatMessage({
                id: "port",
                defaultMessage: "Port",
              })}
              required
              className={style["width-80"]}
            />
            <FormField
              control={form.control}
              name="clusterUuid"
              render={({ field }) => (
                <FormItem className="flex flex-row gap-2">
                  <FormLabel required className="mt-[5px] flex">
                    {intl.formatMessage({
                      id: "associatedCluster",
                      defaultMessage: "Cluster",
                    })}
                  </FormLabel>
                  <div className="flex flex-col">
                    <FormControl>
                      <Select
                        allowClear
                        disabled={loading}
                        className="w-80"
                        options={clusterOptions}
                        value={loading ? undefined : field.value}
                        onClear={() => field.onChange("")}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <InputField
              form={form}
              name="chapUserName"
              label={intl.formatMessage({
                id: "chpaUserName",
                defaultMessage: "CHAP Username",
              })}
              className={style["width-320"]}
            />
            <InputPasswordField
              form={form}
              name="chapUserPassword"
              label={intl.formatMessage({
                id: "chpaPassword",
                defaultMessage: "CHAP Password",
              })}
              className={style["width-320"]}
            />
          </FieldStack>
        </Form>
      </DialogForm>
    </>
  );
};

export default AddIscsiServer;
