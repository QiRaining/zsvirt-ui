import { gql } from "@apollo/client";
import PhysicalNicList from "@zstack/virtualization-resource/src/pages/physical-nic/list";
import { Form, ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Bond as IBond,
  PhysicalNic as IPhysicalNic,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const addNic = gql`
  mutation addNic($input: AddNicInput!) {
    addNic(input: $input) {
      actionId
    }
  }
`;

const UpdateModal: React.FC<IActionWrapperProps<IBond>> = ({
  refetch,
  visible,
  setVisible,
  source,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [_form] = Form.useForm();
  const [value, onChange] = useState<IPhysicalNic[]>([]);
  const bond = source?.__typename === "Bond" ? source : selectedList?.[0];
  useEffect(() => {
    if (visible) {
      onChange([]);
    }
  }, [visible]);

  const defaultQuery = useMemo(() => {
    if (!bond) {
      return;
    }
    const _baseCondition = [
      {
        key: "hostUuids",
        values: bond.hostUuid ? [bond.hostUuid] : [],
        op: Op.in,
      },
      {
        key: "speed",
        value: bond.slaves?.[0]?.speed?.toString() ?? "",
      },
    ];
  }, [bond]);

  const onOk = async (values: IPhysicalNic[]) => {
    const uuid = bond.uuid;
    const mode = bond.mode;
    const xmitHashPolicy = bond.xmitHashPolicy;
    const slaveUuids: string[] = [];
    bond?.slaves?.forEach((item: IPhysicalNic) => {
      slaveUuids.push(item.uuid ?? "");
    });
    for (const val of values ?? []) {
      slaveUuids.push(val.uuid ?? "");
    }
    const payload = bond?.mode?.includes("active-backup")
      ? { uuid, slaveUuids, mode, hostUuid: bond.hostUuid }
      : { uuid, slaveUuids, mode, xmitHashPolicy, hostUuid: bond.hostUuid };
    doAction({
      mutation: addNic,
      payload,
      name: intl.formatMessage({
        id: "add.networkInterface",
        defaultMessage: "Add Physical Port",
      }),
      total: 1,
      type: "Bond",
      onFinish: () => {
        setVisible(false);
        refetch?.();
      },
    });
  };
  const limit = useMemo(() => {
    return 8 - (bond?.slaves?.length ?? 0);
  }, [bond]);

  const rowSelection = useMemo(() => {
    return {
      getCheckboxProps: (record: IPhysicalNic, selected: IPhysicalNic[]) => {
        return {
          disabled:
            selected?.length >= limit &&
            selected?.findIndex((nic) => nic.uuid === record?.uuid) === -1,
        };
      },
    };
  }, [limit]);

  return (
    <ModalSelect
      selectType="checkbox"
      transformKey="interfaceName"
      title={intl.formatMessage({
        id: "add.networkInterface",
        defaultMessage: "Add Physical Port",
      })}
      resourceName={bond?.bondingName}
      primaryKey="hostUuid"
      maxSelectedCount={limit}
      showSelect={false}
      label={intl.formatMessage({
        id: "add.host.and.physicalNic",
        defaultMessage: "Add Host and Physical Port",
      })}
      visible={visible}
      setVisible={setVisible}
      onChange={onChange}
      value={value}
      onOk={onOk}
      alertType="info"
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "add.networkInterface.modal.alert.info",
            defaultMessage: `1.  Only ports that are not currently part of a bond can be added.
2.  You can only select ports that operate at the same speed as the ports already in the bond.`,
          })}
        </ReactMarkdown>
      }
    >
      <PhysicalNicList
        view="select.bond"
        defaultQuery={defaultQuery}
        rowSelection={rowSelection}
      />
    </ModalSelect>
  );
};

export default UpdateModal;
