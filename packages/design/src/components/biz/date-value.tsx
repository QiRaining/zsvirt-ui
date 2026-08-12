import { useTime } from "@zstack/hooks";

import { FieldValue } from "./field";

interface DateProps {
  children: string;
}

export const DateValue = ({ children }: DateProps) => {
  const { getServerTime } = useTime();
  return (
    <FieldValue>
      {getServerTime(children).format("YYYY-MM-DD HH:mm:ss")}
    </FieldValue>
  );
};
