import { gql, useLazyQuery } from "@apollo/client";
import { DatePicker } from "@zstack/design";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useIntl } from "react-intl";

const RESERVED_MINUTES = 10;

export interface IProps {
  value?: Dayjs;
  onChange?: (value: Dayjs | null) => void;
}

const getCurrentTime = gql`
  query getCurrentTime {
    getCurrentTime {
      currentTime {
        MillionSeconds
      }
      timezone
      offset
    }
  }
`;

export default function StartTime(props: IProps) {
  const intl = useIntl();

  const [query, { data }] = useLazyQuery(getCurrentTime, {
    fetchPolicy: "no-cache",
  });

  // 挂载时查询一次服务器时间
  useEffect(() => {
    query();
  }, [query]);

  // 基于服务器时间计算禁用规则（接收 Date 对象）
  const disabledDate = (date: Date): boolean => {
    const currentTime = data?.getCurrentTime?.currentTime?.MillionSeconds;
    const target = dayjs(date);
    if (!currentTime) {
      return target.isBefore(dayjs().startOf("day"));
    }
    const minStartTime = dayjs(currentTime).add(RESERVED_MINUTES, "minutes");
    return target.isBefore(minStartTime.startOf("day"));
  };

  const disabledTime = (date: Date) => {
    const currentTime = data?.getCurrentTime?.currentTime?.MillionSeconds;
    if (!currentTime || !date) {
      return {};
    }
    const minStartTime = dayjs(currentTime).add(RESERVED_MINUTES, "minutes");
    const current = dayjs(date);

    if (current.isAfter(minStartTime, "day")) {
      return {};
    }
    if (current.isBefore(minStartTime, "day")) {
      return {
        disabledHours: () => Array.from({ length: 24 }, (_, i) => i),
        disabledMinutes: () => Array.from({ length: 60 }, (_, i) => i),
        disabledSeconds: () => Array.from({ length: 60 }, (_, i) => i),
      };
    }
    const disabledHours = Array.from(
      { length: minStartTime.hour() },
      (_, i) => i,
    );
    const disabledMinutes = Array.from(
      { length: minStartTime.minute() },
      (_, i) => i,
    );
    return {
      disabledHours: () => disabledHours,
      disabledMinutes: () => disabledMinutes,
      disabledSeconds: () => [],
    };
  };

  return (
    <DatePicker
      width={320}
      value={props.value}
      onChange={(val) => props.onChange?.((val as Dayjs | undefined) ?? null)}
      createValue={() => dayjs()}
      showTime
      showSecond={false}
      showNow={false}
      format="YYYY-MM-DD HH:mm"
      placeholder={intl.formatMessage({
        id: "please.choose.time",
        defaultMessage: "Select a time.",
      })}
      disabledDate={disabledDate}
      disabledTime={disabledTime}
      modal
      zIndex={1200}
    />
  );
}
