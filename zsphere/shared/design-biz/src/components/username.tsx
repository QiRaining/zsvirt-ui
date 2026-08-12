"use client";

import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export const Username = () => {
  const intl = useIntl();
  const currentUser = usePlatformStore((state) => state.currentUser);
  const username = useMemo(() => {
    return (
      currentUser.username ||
      intl.formatMessage({
        id: "unknown.user",
        defaultMessage: "Unknown User",
      })
    );
  }, [currentUser.username, intl]);

  return <span>{username}</span>;
};
