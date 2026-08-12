export interface Item {
  id: string;
  resourceId: string;
  name: string;
  key: string;
  i18nKey?: string;
  showType?: string;
  width: number;
  isSort: number;
  isQuery: number;
  queryType?: string;
  isAdmin: number;
  remark: string;
  order: number;
  resourceKey: string;
  custom: {
    [key in string]: {
      name: string;
      value: number;
    };
  };
}
