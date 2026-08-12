import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SchedulerJobGroupType } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { formatStorageToObj, parseNumber } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import dayjs from "dayjs";
import { useEffect, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { parseTrigger } from "../detail/overview/backup-strategy";
import { formatCron, translateRetentionDays } from "../utils";
import BackupConfig from "./components/BackupConfig";

import style from "./style.module.less";

const updateResourceBackupJobStrategy = gql`
  mutation updateResourceBackupJobStrategy(
    $input: UpdateResourceBackupJobStrategyInput!
  ) {
    updateResourceBackupJobStrategy(input: $input) {
      actionId
    }
  }
`;

export default function EditBackupPolicy({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SchedulerJobGroup>) {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const current = selectedList?.[0];
  const {
    retentionPolicy,
    remoteRetentionPolicy,
    backupQosStruct,
    remoteBackupStorageUuid,
  } = useMemo(() => JSON.parse(current?.jobData || "{}"), [current]);
  const [
    incrementalCronParam,
    fullCronParam,
    startTime,
    fullBackupTriggerUuid,
  ] = useMemo(() => parseTrigger(current), [current]);

  const title = intl.formatMessage({
    id: "backup.policy.editBackupStrategy.title",
    defaultMessage: "Modify Backup Policy",
  });

  const handleModalVisible = usePersistFn(() => {
    let incrementalPeriodType: string | undefined;
    if (incrementalCronParam?.periodByMonth) {
      incrementalPeriodType = "month";
    } else if (incrementalCronParam?.periodByWeek) {
      incrementalPeriodType = "week";
    } else if (incrementalCronParam?.executeTimeList) {
      incrementalPeriodType = "day";
    } else if (incrementalCronParam?.hourInterval) {
      incrementalPeriodType = "hour";
    } else if (incrementalCronParam?.minuteInterval) {
      incrementalPeriodType = "minute";
    }
    let remoteRetentionPolicyType: string | undefined;
    if (!remoteRetentionPolicy) {
      remoteRetentionPolicyType = "forever";
    } else if (remoteRetentionPolicy.retentionType === "Days") {
      remoteRetentionPolicyType = "byTime";
    } else {
      remoteRetentionPolicyType = "byCount";
    }
    const localRetentionPolicyType =
      retentionPolicy &&
      (retentionPolicy.retentionType === "Days" ? "byTime" : "byCount");
    const qos =
      !!backupQosStruct &&
      (backupQosStruct.networkReadBandwidth ||
        backupQosStruct.networkWriteBandwidth ||
        backupQosStruct.volumeReadBandwidth ||
        backupQosStruct.volumeWriteBandwidth);
    form.resetFields();
    form.setFieldsValue({
      entityType:
        current.jobType === SchedulerJobGroupType.databaseBackup ? "db" : "vm",
      syncRemote: !!remoteBackupStorageUuid,
      mode: fullBackupTriggerUuid ? "custom" : "default",
      incrementalPeriodType,
      incrementalExecuteTime: incrementalCronParam?.executeTime,
      incrementalExecuteTimeList: incrementalCronParam?.executeTimeList ?? [
        undefined,
      ],
      incrementalMinuteInterval: incrementalCronParam?.minuteInterval ?? 15,
      incrementalHourInterval: incrementalCronParam?.hourInterval ?? 1,
      incrementalMonthInterval: incrementalCronParam?.monthInterval ?? 1,
      incrementalPeriodByMonth: incrementalCronParam?.periodByMonth,
      incrementalPeriodByWeek: incrementalCronParam?.periodByWeek,
      fullPeriodType: fullCronParam?.periodByWeek ? "week" : "month",
      fullExecuteTime: fullCronParam?.executeTime,
      fullMonthInterval: fullCronParam?.monthInterval ?? 1,
      fullPeriodByMonth: fullCronParam?.periodByMonth,
      fullPeriodByWeek: fullCronParam?.periodByWeek,
      startTime,
      localRetentionPolicy: localRetentionPolicyType,
      remoteRetentionPolicy: remoteRetentionPolicyType,
      localIncCount:
        localRetentionPolicyType === "byCount"
          ? retentionPolicy.retentionValue
          : 1,
      remoteIncCount:
        remoteRetentionPolicyType === "byCount"
          ? remoteRetentionPolicy.retentionValue
          : 1,
      localFullCount: retentionPolicy?.fullBackupRetentionValue || 1,
      remoteFullCount: remoteRetentionPolicy?.fullBackupRetentionValue || 1,
      localRetentionTime:
        localRetentionPolicyType === "byTime"
          ? formatDays(retentionPolicy.retentionValue)
          : { number: 1, unit: "d" },
      remoteRetentionTime:
        remoteRetentionPolicyType === "byTime"
          ? formatDays(remoteRetentionPolicy.retentionValue)
          : { number: 1, unit: "d" },
      qos,
      downloadBandwidth: backupQosStruct?.networkReadBandwidth
        ? formatStorageToObj(backupQosStruct.networkReadBandwidth, 0, "")
        : { unit: "M" },
      uploadBandwidth: backupQosStruct?.networkWriteBandwidth
        ? formatStorageToObj(backupQosStruct.networkWriteBandwidth, 0, "")
        : { unit: "M" },
      diskRead: backupQosStruct?.volumeReadBandwidth
        ? formatStorageToObj(backupQosStruct.volumeReadBandwidth, 0, "")
        : { unit: "M" },
      diskWrite: backupQosStruct?.volumeWriteBandwidth
        ? formatStorageToObj(backupQosStruct.volumeWriteBandwidth, 0, "")
        : { unit: "M" },
    });
  });

  useEffect(() => {
    if (current && visible) {
      handleModalVisible();
    }
  }, [current, visible, handleModalVisible]);

  const handleSubmit = useCallback(
    (data) => {
      const qosEnabled = form.getFieldValue("qos");
      const payload: any = {
        uuid: current?.uuid ?? "",
        parameters: {
          volumeWriteBandwidth:
            qosEnabled && data.diskWrite?.number
              ? String(parseNumber(data.diskWrite.number, data.diskWrite.unit))
              : "",
          retentionType:
            data.localRetentionPolicy === "byCount" ? "Count" : "Days",
          retentionValue:
            data.localRetentionPolicy === "byCount"
              ? String(data.localIncCount)
              : translateRetentionDays(data.localRetentionTime),
          fullBackupRetentionValue:
            form.getFieldValue("entityType") === "vm" &&
            data.localRetentionPolicy === "byCount"
              ? String(data.localFullCount)
              : "",
        },
      };

      if (
        form.getFieldValue("syncRemote") &&
        data.remoteRetentionPolicy !== "forever"
      ) {
        payload.parameters.remoteRetentionType =
          data.remoteRetentionPolicy === "byCount" ? "Count" : "Days";
        payload.parameters.remoteRetentionValue =
          data.remoteRetentionPolicy === "byCount"
            ? String(data.remoteIncCount)
            : translateRetentionDays(data.remoteRetentionTime);
        payload.parameters.remoteFullBackupRetentionValue =
          form.getFieldValue("entityType") === "vm" &&
          data.remoteRetentionPolicy === "byCount"
            ? String(data.remoteFullCount)
            : "";
      } else {
        payload.parameters.remoteRetentionType = "";
        payload.parameters.remoteRetentionValue = "";
        payload.parameters.remoteFullBackupRetentionValue = "";
      }

      const startTimeInnumber = Math.floor(
        Number(dayjs(data.startTime).second(0)) / 1000,
      );

      switch (data.incrementalPeriodType) {
        case "month":
        case "week":
          payload.incrementalTriggers = [
            {
              schedulerType: "cron",
              startTime: startTimeInnumber,
              cron: formatCron({
                executeTime: data.incrementalExecuteTime,
                startTime: data.startTime,
                monthInterval: data.incrementalMonthInterval,
                periodByMonth: data.incrementalPeriodByMonth,
                periodByWeek: data.incrementalPeriodByWeek,
              }),
            },
          ];
          break;
        case "day":
          payload.incrementalTriggers = data.incrementalExecuteTimeList.map(
            (item: Dayjs) => ({
              schedulerType: "cron",
              startTime: startTimeInnumber,
              cron: formatCron({
                executeTime: item,
                startTime: data.startTime,
              }),
            }),
          );
          break;
        case "hour":
          payload.incrementalTriggers = [
            {
              schedulerType: "simple",
              startTime: startTimeInnumber,
              schedulerInterval: data.incrementalHourInterval * 3600,
            },
          ];
          break;
        case "minute":
          payload.incrementalTriggers = [
            {
              schedulerType: "simple",
              startTime: startTimeInnumber,
              schedulerInterval: data.incrementalMinuteInterval * 60,
            },
          ];
          break;
        default:
          payload.incrementalTriggers = [];
          break;
      }

      if (form.getFieldValue("entityType") === "vm" && data.mode === "custom") {
        payload.fullTrigger = {
          schedulerType: "cron",
          startTime: startTimeInnumber,
          cron: formatCron({
            executeTime: data.fullExecuteTime,
            startTime: data.startTime,
            monthInterval: data.fullMonthInterval,
            periodByMonth: data.fullPeriodByMonth,
            periodByWeek: data.fullPeriodByWeek,
          }),
        };
      }

      doAction({
        mutation: updateResourceBackupJobStrategy,
        payload: [payload],
        name: title,
        total: 1,
        type: "SchedulerJobGroup",
      });
    },
    [doAction, current, title, form],
  );

  return (
    <DialogForm
      widthClassName="w-200"
      className={style.backupPolicyModal}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={handleSubmit as any}
      title={title}
      resourceName={current?.name}
    >
      <Form form={form}>
        <BackupConfig className={style.editConfig} />
      </Form>
    </DialogForm>
  );
}

function formatDays(value: number) {
  if (value % 30 === 0) {
    return { number: value / 30, unit: "m" };
  }
  if (value % 7 === 0) {
    return { number: value / 7, unit: "w" };
  }
  return { number: value, unit: "d" };
}
