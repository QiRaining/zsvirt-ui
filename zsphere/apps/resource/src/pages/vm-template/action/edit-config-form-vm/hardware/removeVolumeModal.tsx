import { gql, useQuery } from "@apollo/client";
import { DialogP0, DialogP1, DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { Volume as IVolume } from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import { max, get } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

type DeletionPolicy = "Direct" | "Delay" | "Never" | undefined;

export interface IRemoveIVolume extends IVolume {
  removeKey: string;
}

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

interface IProps extends IActionWrapperProps<IRemoveIVolume> {
  setRemoveKey: (key: string) => void;
}

export const DeleteDataVolumeModal: React.FC<IProps> = ({
  _source,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  setRemoveKey,
}) => {
  const intl = useIntl();

  const { data: deletionPolicyData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "volume",
      name: "deletionPolicy",
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const { data: expungeIntervalData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "volume",
      name: "expungeInterval",
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const { data: expungePeriodData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "volume",
      name: "expungePeriod",
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const deletionPolicy = useMemo(() => {
    const _deletionPolicy = deletionPolicyData?.globalConfig;
    const expungeInterval = expungeIntervalData?.globalConfig;
    const expungePeriod = expungePeriodData?.globalConfig;
    const time = formatSecToPeriod(
      Number(
        max([Number(expungeInterval?.value), Number(expungePeriod?.value)]),
      ),
      intl,
    );

    return {
      policy: get(_deletionPolicy, "value") as DeletionPolicy,
      time,
    };
  }, [deletionPolicyData, expungeIntervalData, expungePeriodData, intl]);

  const onOk = () => {
    setRemoveKey(selectedList?.[0]?.removeKey);
    setSelectedList?.([]);
    setVisible(false);
  };

  const bannerMessage = useMemo(() => {
    if (deletionPolicy?.policy === "Direct") {
      return (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "volume.modal.direct.delete.alert.warning",
            defaultMessage: `This action interrupts data reads/writes of associated virtual machines from/to the disk, and makes the disk unavailable. Proceed with caution.`,
          })}
        </ReactMarkdown>
      );
    }
    if (deletionPolicy?.policy === "Delay") {
      return (
        <ReactMarkdown>
          {intl.formatMessage(
            {
              id: "volume.modal.delay.delete.alert.warning",
              defaultMessage: `1. This action interrupts data reads/writes of associated virtual machines from/to the disk. Proceed with caution.

2. This action moves the disk to the recycle bin and completely deletes it after {time}.`,
            },
            {
              time: deletionPolicy?.time,
            },
          )}
        </ReactMarkdown>
      );
    }
    if (deletionPolicy?.policy === "Never") {
      return (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "volume.modal.never.delete.alert.warning",
            defaultMessage: `1. This action interrupts data reads/writes of associated virtual machines from/to the disk. Proceed with caution.

2. This action moves the disk to the recycle bin, but it will not be automatically deleted.`,
          })}
        </ReactMarkdown>
      );
    }

    return (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "volume.modal.delete.alert.warning",
          defaultMessage:
            "This action interrupts data reads/writes of associated virtual machines from/to the disk, and makes the disk unavailable. Proceed with caution.",
        })}
      </ReactMarkdown>
    );
  }, [deletionPolicy, intl]);

  const DialogComponent =
    deletionPolicy?.policy === "Direct" ? DialogP0 : DialogP1;

  return (
    <DialogComponent
      visible={visible}
      setVisible={setVisible}
      bannerMessage={bannerMessage}
      title={
        deletionPolicy?.policy === "Direct"
          ? intl.formatMessage({
              id: "volume.modal.title.confirm.delete.volume.direct",
              defaultMessage: "Expunge Disk?",
            })
          : intl.formatMessage({
              id: "volume.modal.title.confirm.delete.volume.delay",
              defaultMessage: "Move Disk to Recycle Bin?",
            })
      }
      resourceType={intl.formatMessage({
        id: "volume",
        defaultMessage: "Disk",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export const DetachDataVolumeModal: React.FC<IProps> = ({
  _source,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  setRemoveKey,
}) => {
  const intl = useIntl();

  const onOk = () => {
    setRemoveKey(selectedList?.[0]?.removeKey);
    setSelectedList?.([]);
    setVisible(false);
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "volume.modal.delay.detach.alert.warning",
            defaultMessage: `This operation may cause interruptions to disk read-write operations and potentially impact business continuity. Please exercise caution when operating.`,
          })}
        </ReactMarkdown>
      }
      title={intl.formatMessage({
        id: "vm.edit.modal.title.confirm.detach.volume",
        defaultMessage: "Detach Disk?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
      noNeedConfirm
    />
  );
};

export default DeleteDataVolumeModal;
