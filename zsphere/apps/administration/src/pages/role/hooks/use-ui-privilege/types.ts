/** A single UI action (e.g., "create VM", "delete") */
export interface PrivilegeAction {
  readonly key: string;
  readonly name: string;
}

/** A single UI view (list page, detail page) */
export interface PrivilegeView {
  readonly key: string;
  readonly name: string;
}

/** Privilege entry for one resource type */
export interface ResourcePrivilege {
  actionKey: string;
  actions: PrivilegeAction[];
  viewKey: string;
  views: PrivilegeView[];
}

/** Complete UI privilege map: resourceType → ResourcePrivilege */
export type UIPrivilegeMap = Record<string, ResourcePrivilege>;

/** Sub-action group (e.g., "GPU设备" containing enable/disable) */
export interface SubActionGroup {
  readonly name: string;
  readonly keys: readonly string[];
}

/** Sub-action config: resourceType → { groupKey → SubActionGroup } */
export type SubActionConfig = Record<string, Record<string, SubActionGroup>>;

/** Action config: resourceType → { actionKey → displayName } */
export type ActionConfig = Record<string, Record<string, string>>;

/** Role filter configuration */
export interface RoleFilterConfig {
  readonly allowedActions: Record<string, string[]>;
  readonly filteredActionKeys: string[];
  readonly filteredMenuKeys: string[];
}

/** Options for building a privilege map */
export interface BuildPrivilegeOptions {
  roleUuid: string;
  isSodOrViewer: boolean;
}
