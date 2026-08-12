import { useTime } from "@zstack/hooks";
import { usePersistFn } from "ahooks";
import { useState } from "react";

export default function useGetMillionSeconds() {
  const { getCurrentServerTimeMillionSeconds } = useTime();
  const [MillionSeconds, setMillionSeconds] = useState(
    getCurrentServerTimeMillionSeconds,
  );

  const getMillionSeconds = usePersistFn(() => {
    setMillionSeconds(getCurrentServerTimeMillionSeconds());
  });

  return {
    MillionSeconds,
    loading: false,
    getMillionSeconds,
  };
}
