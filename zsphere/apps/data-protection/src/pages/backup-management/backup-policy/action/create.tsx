import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { parseNumber } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import React, { useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { priorityValueMap } from "zsv_data_protection_shared/backup-management/backup-policy/mf-index";

import { translateRetentionDays } from "../../backup-policy/utils";
import { formatCron } from "../utils";
import BackupConfig from "./components/BackupConfig";
import BasicConfig from "./components/BasicConfig";
import StepForm from "./components/StepForm";

import style from "./style.module.less";

const createResourceBackupJob = gql`
  mutation createResourceBackupJob($input: CreateResourceBackupJobInput!) {
    createResourceBackupJob(input: $input) {
      actionId
    }
  }
`;

const initialValues = {
  incrementalPeriodType: "week",
  fullPeriodType: "month",
  incrementalMonthInterval: 1,
  fullMonthInterval: 1,
  incrementalHourInterval: 1,
  incrementalMinuteInterval: 15,
  incrementalExecuteTimeList: [undefined],
  entityType: "vm",
  mode: "default",
  localRetentionPolicy: "byCount",
  localRetentionTime: { number: 1, unit: "d" },
  localIncCount: 1,
  localFullCount: 1,
  remoteRetentionPolicy: "forever",
  remoteRetentionTime: { number: 1, unit: "d" },
  remoteIncCount: 1,
  remoteFullCount: 1,
  downloadBandwidth: { unit: "M" },
  uploadBandwidth: { unit: "M" },
  diskRead: { unit: "M" },
  diskWrite: { unit: "M" },
};

interface ContentProps {
  title: string;
  setVisible: (value: boolean) => void;
  onFooterChange: (footer: React.ReactNode) => void;
}

function Content({ title, setVisible, onFooterChange }: ContentProps) {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const sectionRef = useRef<any>(null);

  const handleSubmit = useCallback(() => {
    const values = form.getFieldsValue();
    const startTimeInnumber = Math.floor(
      Number(dayjs(values.startTime).second(0)) / 1000,
    );

    const payload: any = {
      name: values.name,
      description: values.description,
      type: values.entityType === "vm" ? "vmBackup" : "databaseBackup",
      parameters: {
        backupStorageUuids: values.localBackupStorage
          .map((item: any) => item.uuid)
          .join(","),
        remoteBackupStorageUuid: values.syncRemote
          ? values.remoteBackupStorage?.uuid
          : undefined,
        retentionType:
          values.localRetentionPolicy === "byCount" ? "Count" : "Days",
        retentionValue:
          values.localRetentionPolicy === "byCount"
            ? String(values.localIncCount)
            : translateRetentionDays(values.localRetentionTime),
        fullBackupRetentionValue:
          values.entityType === "vm" &&
          values.localRetentionPolicy === "byCount"
            ? String(values.localFullCount)
            : undefined,
      },
      priorities:
        values.priority &&
        Object.entries(values.priority).map(([rootVolumeUuid, priority]) => ({
          rootVolumeUuid,
          priority: priorityValueMap[priority as string],
        })),
      targetResourceUuids:
        values.entityType === "vm"
          ? values.vm.map((item: any) => item.rootVolumeUuid)
          : ["7ae6456c0b01324dae6d4bef358a5772"],
      triggerNow: false,
    };

    switch (values.incrementalPeriodType) {
      case "month":
      case "week":
        payload.triggerList = [
          {
            schedulerType: "cron",
            startTime: startTimeInnumber,
            cron: formatCron({
              executeTime: values.incrementalExecuteTime,
              startTime: values.startTime,
              monthInterval: values.incrementalMonthInterval,
              periodByMonth: values.incrementalPeriodByMonth,
              periodByWeek: values.incrementalPeriodByWeek,
            }),
          },
        ];
        break;
      case "day":
        payload.triggerList = values.incrementalExecuteTimeList.map(
          (item: Dayjs) => ({
            schedulerType: "cron",
            startTime: startTimeInnumber,
            cron: formatCron({
              executeTime: item,
              startTime: values.startTime,
            }),
          }),
        );
        break;
      case "hour":
        payload.triggerList = [
          {
            schedulerType: "simple",
            startTime: startTimeInnumber,
            schedulerInterval: values.incrementalHourInterval * 3600,
          },
        ];
        break;
      case "minute":
        payload.triggerList = [
          {
            schedulerType: "simple",
            startTime: startTimeInnumber,
            schedulerInterval: values.incrementalMinuteInterval * 60,
          },
        ];
        break;
    }

    if (values.entityType === "vm" && values.mode === "custom") {
      payload.fullTriggerList = [
        {
          schedulerType: "cron",
          startTime: startTimeInnumber,
          cron: formatCron({
            executeTime: values.fullExecuteTime,
            startTime: values.startTime,
            monthInterval: values.fullMonthInterval,
            periodByMonth: values.fullPeriodByMonth,
            periodByWeek: values.fullPeriodByWeek,
          }),
        },
      ];
    }

    if (values.syncRemote && values.remoteRetentionPolicy !== "forever") {
      payload.parameters.remoteRetentionType =
        values.remoteRetentionPolicy === "byCount" ? "Count" : "Days";
      payload.parameters.remoteRetentionValue =
        values.remoteRetentionPolicy === "byCount"
          ? String(values.remoteIncCount)
          : translateRetentionDays(values.remoteRetentionTime);
      payload.parameters.remoteFullBackupRetentionValue =
        values.entityType === "vm" && values.remoteRetentionPolicy === "byCount"
          ? String(values.remoteFullCount)
          : undefined;
    }

    if (form.getFieldValue("qos")) {
      if (values.downloadBandwidth?.number) {
        payload.parameters.networkReadBandwidth = String(
          parseNumber(
            values.downloadBandwidth.number,
            values.downloadBandwidth.unit,
          ),
        );
      }
      if (values.uploadBandwidth?.number) {
        payload.parameters.networkWriteBandwidth = String(
          parseNumber(
            values.uploadBandwidth.number,
            values.uploadBandwidth.unit,
          ),
        );
      }
      if (values.diskRead?.number) {
        payload.parameters.volumeReadBandwidth = String(
          parseNumber(values.diskRead.number, values.diskRead.unit),
        );
      }
      if (values.diskWrite?.number) {
        payload.parameters.volumeWriteBandwidth = String(
          parseNumber(values.diskWrite.number, values.diskWrite.unit),
        );
      }
    }

    doAction({
      mutation: createResourceBackupJob,
      payload,
      name: title,
      total: 1,
      type: "SchedulerJobGroup",
    });
  }, [form, doAction, title]);

  const handleValuesChange = (changeValues: any) => {
    if ("zoneUuid" in changeValues) {
      form.setFieldsValue({
        localBackupStorage: [],
        syncRemote: false,
        vm: [],
      });
    }
  };

  return (
    <StepForm
      form={form}
      onCancel={() => setVisible(false)}
      onOk={() => {
        handleSubmit();
        setVisible(false);
      }}
      onError={(err) => {
        sectionRef.current?.jumpToError(err);
      }}
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
      onFooterChange={onFooterChange}
      steps={[
        {
          title: intl.formatMessage({
            id: "basic.config",
            defaultMessage: "Basic Configuration",
          }),
          content: <BasicConfig form={form} className={style.modalForm} />,
        },
        {
          title: intl.formatMessage({
            id: "backup.config",
            defaultMessage: "Backup Configuration",
          }),
          content: (
            <BackupConfig sectionRef={sectionRef} className={style.modalForm} />
          ),
        },
      ]}
    />
  );
}

export default function Create({
  visible,
  setVisible,
}: IActionWrapperProps<SchedulerJobGroup>) {
  const intl = useIntl();
  const [footer, setFooter] = useState<React.ReactNode>(<></>);

  const title = intl.formatMessage({
    id: "backup.policy.create.title",
    defaultMessage: "New Backup Plan",
  });

  return (
    <DialogBase
      widthClassName="w-[800px]"
      visible={visible}
      setVisible={setVisible}
      title={title}
      footer={footer}
      bodyClassName="p-0"
    >
      <Content
        title={title}
        setVisible={setVisible}
        onFooterChange={setFooter}
      />
    </DialogBase>
  );
}
