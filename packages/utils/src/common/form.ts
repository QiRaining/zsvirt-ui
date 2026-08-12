import * as _ from "lodash-es";

/**
 * 表单值类型，支持嵌套对象
 */
export type FormValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | FormValues
  | Array<FormValue>;

/**
 * 表单值对象类型
 */
export interface FormValues {
  [key: string]: FormValue;
}

/**
 * 获取表单实际修改的值
 * @param initialValues - 初始值
 * @param currentValues - 当前值
 * @returns 返回已修改的字段及其值
 */
export const getModifedValues = <T extends FormValues>(
  initialValues: T,
  currentValues: T,
): Partial<T> => {
  return Object.entries(currentValues).reduce((acc, [key, value]) => {
    if (!_.isEqual(initialValues[key], value)) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, {} as Partial<T>);
};
