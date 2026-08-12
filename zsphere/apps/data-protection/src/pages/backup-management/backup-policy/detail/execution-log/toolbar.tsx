import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  RangePicker,
  Select,
  type SelectOptions,
} from "@zstack/design";
import { Op } from "@zstack/zsphere-types";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createBackupPolicyExecutionLogToolbarSchema,
  type BackupPolicyExecutionLogToolbarValues,
} from "./schema";

import style from "./style.module.less";

export const initialCondition = {
  duration: "7",
};

export interface IProps {
  setCondition?: (value: any[]) => void;
}

export default function Toolbar({ setCondition }: IProps) {
  const intl = useIntl();
  const form = useForm<BackupPolicyExecutionLogToolbarValues>({
    resolver: zodResolver(createBackupPolicyExecutionLogToolbarSchema()),
    defaultValues: initialCondition,
    mode: "onBlur",
  });
  const duration = form.watch("duration");
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  const updateCondition = (beginTime?: dayjs.Dayjs, endTime?: dayjs.Dayjs) => {
    const condition: any[] = [];
    if (beginTime) {
      condition.push({
        key: "startTime",
        op: Op.gte,
        value: beginTime.format("YYYY-MM-DD HH:mm:ss"),
      });
    }
    if (endTime) {
      condition.push({
        key: "startTime",
        op: Op.lte,
        value: endTime.format("YYYY-MM-DD HH:mm:ss"),
      });
    }
    setCondition?.(condition);
  };

  const handleDurationChange = (
    value: BackupPolicyExecutionLogToolbarValues["duration"],
  ) => {
    const now = dayjs();
    if (value === "-1") {
      updateCondition(dayjs(now).add(-30, "days"), now);
      return;
    }
    updateCondition(now.add(-Number(value), "days"));
  };

  const options = useMemo<SelectOptions[]>(
    () => [
      {
        value: "3",
        label: intl.formatMessage({
          id: "last3Days",
          defaultMessage: "Last 3 days",
        }),
      },
      {
        value: "7",
        label: intl.formatMessage({
          id: "last7Days",
          defaultMessage: "Last 7 days",
        }),
      },
      {
        value: "30",
        label: intl.formatMessage({
          id: "last30Days",
          defaultMessage: "Last 30 days",
        }),
      },
      {
        value: "-1",
        label: intl.formatMessage({ id: "custom", defaultMessage: "Custom" }),
      },
    ],
    [intl],
  );

  return (
    <Form {...form}>
      <div className={style.toolbar}>
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  className="w-40"
                  options={options}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleDurationChange(
                      value as BackupPolicyExecutionLogToolbarValues["duration"],
                    );
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {duration === "-1" && (
          <RangePicker
            selected={selectedRange}
            onSelect={setSelectedRange}
            onConfirm={() => {
              if (selectedRange?.from && selectedRange?.to) {
                const from = dayjs(selectedRange.from).startOf("minute");
                const to = dayjs(selectedRange.to).startOf("minute");
                updateCondition(from, to);
              }
            }}
          />
        )}
      </div>
    </Form>
  );
}
