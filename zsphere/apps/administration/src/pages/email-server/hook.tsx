import type { EmailServerSetting as IEmailServerSetting } from "@zstack/zsphere-types/graphql";
import React from "react";
export interface EmailServerContext {
  store: EmailServerStore;
  setStore: (v: EmailServerStore) => void;
}

interface EmailServerStore {
  emailServer?: IEmailServerSetting;
}

export const EmailServerContext = React.createContext<EmailServerContext>({
  store: {},
  setStore: () => {},
});
