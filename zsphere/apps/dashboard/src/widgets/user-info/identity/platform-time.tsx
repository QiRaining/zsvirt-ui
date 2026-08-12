import type { FC } from "react";

import useTranslateTime from "../useTranslateTime";

interface IPlatformTimeProps {
  platformTime: number;
}

export const PlatformTime: FC<IPlatformTimeProps> = ({ platformTime }) => {
  const timer = useTranslateTime(platformTime);
  return <span>{timer}</span>;
};
