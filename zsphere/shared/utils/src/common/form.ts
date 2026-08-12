import { keys, isEqual } from "lodash-es";

/**
 * 获取表单实际修改的值
 * @param initialValues 初始值
 * @param currentValues 当前值
 */
export interface IFormValues {
  [key: string]: any;
}

export const getModifedValues = (
  initialValues: IFormValues,
  currentValues: IFormValues,
) => {
  const modifedValues: IFormValues = {};

  keys(currentValues).forEach((key) => {
    if (!isEqual(initialValues[key], currentValues[key])) {
      modifedValues[key] = currentValues[key];
    }
  });

  return modifedValues;
};
