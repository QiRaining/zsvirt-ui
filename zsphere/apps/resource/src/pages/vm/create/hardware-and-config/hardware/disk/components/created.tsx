import DataVolumeList from "@zstack/virtualization-resource/src/pages/volume/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import { Op, VolumeQueryType } from "@zstack/zsphere-types";
import { keys, get } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

interface IProps {
  index: number;
  source?: any;
  formValues: any;
}

const { Item } = Form;

const STYLE_WIDTH_200 = { width: 200 } as const;

const CreatedDisk: React.FC<IProps> = ({ index, source, formValues }) => {
  const intl = useIntl();

  const values = useMemo(() => {
    return formValues;
  }, [formValues]);

  const runPath = values.runPath;
  const count = values.count;

  const countCondition = useMemo(() => {
    return Number(count) > 1
      ? [
          {
            key: "__shareable__",
            op: Op.in,
            values: ["true"],
          },
        ]
      : [];
  }, [count]);

  const selectedVolumeUuids =
    keys(values)
      .filter((key) => key.indexOf("createDisk-") > -1 && values?.[key]?.length)
      .map((key) => values?.[key]?.[0]?.uuid) ?? [];

  const _DefaultQuery = {
    VmInstance: {
      type: VolumeQueryType.GET_VM_ATTACHABLE_NOT_SNAPSHOT_DATA_VOLUME,
      extraConditions: [
        { key: "vmInstanceUuid", op: Op.eq, value: source?.uuid },
      ],
      conditions: [
        {
          key: "status",
          op: Op.ne,
          value: "Deleted",
        },
        {
          key: "uuid",
          op: Op.notIn,
          values: selectedVolumeUuids,
        },
      ],
    },
    Cluster: {
      type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
      conditions: [
        {
          key: "status",
          op: Op.ne,
          value: "Deleted",
        },
        {
          key: "type",
          op: Op.eq,
          value: "Data",
        },
        {
          key: "primaryStorage.cluster.uuid",
          op: Op.eq,
          value: source?.uuid,
        },
        {
          key: "uuid",
          op: Op.notIn,
          values: selectedVolumeUuids,
        },
        {
          key: "__attachedVm__",
          value: "false",
          op: Op.eq,
        },
      ],
    },
    PrimaryStorageVO: {
      type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
      conditions: [
        {
          key: "status",
          op: Op.ne,
          value: "Deleted",
        },
        {
          key: "type",
          op: Op.eq,
          value: "Data",
        },
        {
          key: "primaryStorageUuid",
          op: Op.eq,
          value: source?.uuid,
        },
        {
          key: "uuid",
          op: Op.notIn,
          values: selectedVolumeUuids,
        },
        {
          key: "__attachedVm__",
          value: "false",
          op: Op.eq,
        },
      ],
    },
    Zone: {
      type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
      conditions: [
        {
          key: "status",
          op: Op.ne,
          value: "Deleted",
        },
        {
          key: "type",
          op: Op.eq,
          value: "Data",
        },
        {
          key: "primaryStorage.cluster.uuid",
          op: Op.eq,
          value:
            runPath?.[0]?.__typename === "HostVO"
              ? runPath?.[0]?.cluster?.uuid
              : runPath?.[0]?.uuid,
        },
        {
          key: "uuid",
          op: Op.notIn,
          values: selectedVolumeUuids,
        },
        {
          key: "__attachedVm__",
          value: "false",
          op: Op.eq,
        },
      ],
    },
    HostVO: {
      type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
      conditions: [
        {
          key: "status",
          op: Op.ne,
          value: "Deleted",
        },
        {
          key: "type",
          op: Op.eq,
          value: "Data",
        },
        {
          key: "primaryStorage.cluster.uuid",
          op: Op.eq,
          value: source?.cluster?.uuid,
        },
        {
          key: "uuid",
          op: Op.notIn,
          values: selectedVolumeUuids,
        },
        {
          key: "__attachedVm__",
          value: "false",
          op: Op.eq,
        },
      ],
    },
  };

  const resourceType = source.__typename;

  const dataVolumeDefaultQuery = useMemo(() => {
    const result = get(_DefaultQuery, resourceType, {
      type: VolumeQueryType.GET_VOLUME_BY_NOT_SNAPSHOT,
      conditions: [
        {
          key: "status",
          op: Op.ne,
          value: "Deleted",
        },
        {
          key: "type",
          op: Op.eq,
          value: "Data",
        },
        {
          key: "uuid",
          op: Op.notIn,
          values: selectedVolumeUuids,
        },
        {
          key: "__attachedVm__",
          value: "false",
          op: Op.eq,
        },
      ],
    });
    return {
      ...result,
      conditions: [...(result?.conditions || []), ...countCondition],
    };
  }, [_DefaultQuery, countCondition, resourceType, selectedVolumeUuids]);

  return (
    <Item
      label={intl.formatMessage({
        id: "virtualization.create.instance.hardware.created.disk",
        defaultMessage: "Existing Disk",
      })}
      name={`createDisk-${index}`}
      rules={[
        {
          required: true,
          message: intl.formatMessage({
            id: "instance.field.disk.createDisk.validator.required",
            defaultMessage: "Select an existing disk.",
          }),
        },
      ]}
    >
      <ModalSelect
        style={STYLE_WIDTH_200}
        title={intl.formatMessage({
          id: "select.disk",
          defaultMessage: "Select Disk",
        })}
        alertType="info"
        alertMessage={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.create.instance.hardware.created.disk.alert",
              defaultMessage: `The current list is filtered to show disks that meet the following prerequisites:
- Not tied to snapshots: The disk is not associated with any VM snapshots.
- Available for attachment: The disk is either a shared disk or an disk not in use by other VMs.`,
            })}
          </ReactMarkdown>
        }
      >
        <DataVolumeList view="select" defaultQuery={dataVolumeDefaultQuery} />
      </ModalSelect>
    </Item>
  );
};

export default React.memo(CreatedDisk);
