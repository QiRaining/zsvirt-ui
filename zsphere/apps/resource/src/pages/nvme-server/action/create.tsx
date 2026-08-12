import { gql, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputField,
  RadioGroupField,
  SelectField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { queryClusterList } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type {
  Condition,
  IActionWrapperProps,
  IQuery,
} from "@zstack/zsphere-types";
import { Op, TransportType } from "@zstack/zsphere-types";
import type {
  Zone as IZone,
  PrimaryStorageVO as IPrimaryStorage,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { buildAddNvmeServerPayload } from "./payload";
import {
  createAddNvmeServerSchema,
  type AddNvmeServerFormValues,
} from "./schema";

const addNvmeServer = gql`
  mutation addNvmeServer($input: AddNvmeServerInput!) {
    addNvmeServer(input: $input) {
      actionId
    }
  }
`;

interface ICommon {
  name: string; // 名称
  ip: string;
  port: string;
  transport: TransportType;
  clusterUuid?: string;
}

type IInitalValues = ICommon;

const initialValues: IInitalValues = {
  name: "",
  ip: "",
  transport: TransportType.RDMA,
  port: "4420",
  clusterUuid: "",
};

const AddNvmeStorage: React.FC<
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
      clusterListMemo?.map((item: ICluster) => ({
        label: item.name ?? "",
        value: item.uuid ?? "",
      })) ?? [],
    [clusterListMemo],
  );

  const defaultValues = useMemo<AddNvmeServerFormValues>(
    () => initialValues,
    [],
  );
  const formSchema = useMemo(() => createAddNvmeServerSchema(intl), [intl]);
  const form = useForm<AddNvmeServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: AddNvmeServerFormValues) => {
    doAction({
      mutation: addNvmeServer,
      payload: buildAddNvmeServerPayload(values),
      name: intl.formatMessage({
        id: "add.nvmeStorage",
        defaultMessage: "Add NVMe Storage",
      }),
      total: 1,
      type: "NvmeServer",
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
          id: "add.nvmeStorage",
          defaultMessage: "Add NVMe Storage",
        })}
      >
        <Form {...form}>
          <FieldStack>
            <InputField
              form={form}
              name="name"
              label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
              required
              size="m"
            />

            <RadioGroupField
              form={form}
              name="transport"
              label={intl.formatMessage({
                id: "transport.mode",
                defaultMessage: "Transmission Mode",
              })}
              labelTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "transport.mode.tooltip",
                    defaultMessage: "tod",
                  })}
                </ReactMarkdown>
              }
              options={[
                { value: TransportType.RDMA, label: TransportType.RDMA },
                { value: TransportType.TCP, label: TransportType.TCP },
              ]}
            />

            <InputField
              form={form}
              name="ip"
              label={intl.formatMessage({
                id: "ip",
                defaultMessage: "IP Address",
              })}
              required
              size="m"
            />

            <InputField
              form={form}
              name="port"
              label={intl.formatMessage({
                id: "port",
                defaultMessage: "Port",
              })}
              required
              className="w-20"
            />

            <SelectField
              form={form}
              name="clusterUuid"
              label={intl.formatMessage({
                id: "associatedCluster",
                defaultMessage: "Cluster",
              })}
              required
              allowClear
              disabled={loading}
              options={clusterOptions}
              size="l"
            />
          </FieldStack>
        </Form>
      </DialogForm>
    </>
  );
};

export default AddNvmeStorage;
