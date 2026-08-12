export type AuthKey = {
  type: "block" | "action" | "view" | "field";
  authKey: string;
  resource: string;
};

export interface ListItem {
  key: string;
  name: string;
  auth: AuthKey;
  ActionWrapper?: any;
}

export interface ViewConfig {
  extraKeys: string[];
  activeKeys: string[];
}

export interface ActionConfig {
  list: ListItem[];
  viewMap: ViewMap;
}

interface ViewMap {
  [key: string]: ViewConfig;
}
