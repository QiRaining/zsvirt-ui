import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  SnapshotStrategy,
  CreateSnapshotStrategyPayload,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import dayjs from "dayjs";
import { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import type { IForm } from "../components/form";
import SnapshotStrategyForm from "../components/form";
import { formatCron } from "../util";

const createSnapshotStrategy = gql`
  mutation createSnapshotStrategy($input: CreateSnapshotStrategyInput!) {
    createSnapshotStrategy(input: $input) {
      actionId
    }
  }
`;

const initialValues = {
  periodType: "week" as const,
  periodByWeek: [1],
  periodByMonth: [1],
  monthInterval: 1,
  endTimeType: "never" as const,
  snapshotCount: 5,
};

export default function Create({
  visible,
  setVisible,
}: IActionWrapperProps<SnapshotStrategy>) {
  const intl = useIntl();
  const [form] = Form.useForm<IForm>();
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "snapshot.strategy.create.title",
    defaultMessage: "New Snapshot Policy",
  });

  const handleModalVisible = usePersistFn(() => {
    form.resetFields();
    // ZSV-5443
    // 默认开始时间和执行时间延后 1 分钟,
    // 由于秒数置零, 只加 1 分钟实际不足 1 分钟, 这里取 2 分钟
    const now = dayjs().add(2, "minute");
    form.setFieldsValue({ executeTime: dayjs(now).second(0) });
    form.setFieldsValue({ startTime: dayjs(now).second(0) });
  });

  useEffect(() => {
    if (visible) {
      handleModalVisible();
    }
  }, [visible, handleModalVisible]);

  const handleSubmit = useCallback(
    (data: IForm) => {
      const payload: CreateSnapshotStrategyPayload = {
        name: data.name,
        description: data.description,
        rootVolumeUuids: data.attachedVm?.map((vm) => vm.rootVolumeUuid!),
        snapshotGroupMaxNumber: data.snapshotCount,
        cron: formatCron({
          executeTime: data.executeTime,
          startTime: data.startTime,
          monthInterval: data.monthInterval,
          periodByMonth: data.periodByMonth,
          periodByWeek: data.periodByWeek,
        }),
        startTime: Math.floor(Number(dayjs(data.startTime).second(0)) / 1000),
        endTime:
          data.endTime &&
          Math.floor(Number(dayjs(data.endTime).second(0)) / 1000),
      };
      doAction({
        mutation: createSnapshotStrategy,
        payload,
        name: title,
        total: 1,
        type: "SnapshotStrategy",
      });
    },
    [doAction, title],
  );

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={handleSubmit as any}
      title={title}
    >
      <SnapshotStrategyForm
        form={form}
        initialValues={initialValues}
        type="create"
      />
    </DialogForm>
  );
}
