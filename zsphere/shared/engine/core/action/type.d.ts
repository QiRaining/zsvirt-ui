export interface Item {
  id: string;
  resourceId: string;
  name: string;
  resource?: string;
  childName?: string;
  key: string;
  i18nKey?: string;
  authName?: string;
  authI18nKey?: string;
  divider: number;
  icon?: string;
  showType?: string;
  tooltip?: string;
  description?: string;
  validator?: string;
  isAdmin: number;
  order: number;
  resourceKey: string;
  custom: {
    [key in string]: {
      name: string;
      value: number;
    };
  };
}
