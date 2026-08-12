import type { ReactElement } from "react";

type StoreValue = any;
type RuleType =
  | "string"
  | "number"
  | "boolean"
  | "method"
  | "regexp"
  | "integer"
  | "float"
  | "object"
  | "enum"
  | "date"
  | "url"
  | "hex"
  | "email";
type InternalNamePath = (string | number)[];
type NamePath = string | number | InternalNamePath;
type RecursivePartial<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object
          ? RecursivePartial<T[P]>
          : T[P];
    }
  : any;
type ValidateFields<Values = any> = (nameList?: NamePath[]) => Promise<Values>;
type AggregationRule = BaseRule & Partial<ValidatorRule>;
type RuleRender = (form: FormInstance) => RuleObject;

interface InternalFieldData extends Meta {
  value: StoreValue;
}

interface ValidatorRule {
  message?: string | ReactElement;
  validator: (
    rule: RuleObject,
    value: StoreValue,
    callback: (error?: string) => void,
  ) => Promise<void | any> | void;
}

interface FieldData extends Partial<Omit<InternalFieldData, "name">> {
  name: NamePath;
}

interface Meta {
  touched: boolean;
  validating: boolean;
  errors: string[];
  name: InternalNamePath;
}

interface FieldError {
  name: InternalNamePath;
  errors: string[];
}

interface BaseRule {
  enum?: StoreValue[];
  len?: number;
  max?: number;
  message?: string | ReactElement;
  min?: number;
  pattern?: RegExp;
  required?: boolean;
  transform?: (value: StoreValue) => StoreValue;
  type?: RuleType;
  whitespace?: boolean;
  validateTrigger?: string | string[];
}

interface FormInstance<Values = any> {
  getFieldValue: (name: NamePath) => StoreValue;
  getFieldsValue(): Values;
  getFieldsValue(
    nameList: NamePath[] | true,
    filterFunc?: (meta: Meta) => boolean,
  ): any;
  getFieldError: (name: NamePath) => string[];
  getFieldsError: (nameList?: NamePath[]) => FieldError[];
  isFieldsTouched(nameList?: NamePath[], allFieldsTouched?: boolean): boolean;
  isFieldsTouched(allFieldsTouched?: boolean): boolean;
  isFieldTouched: (name: NamePath) => boolean;
  isFieldValidating: (name: NamePath) => boolean;
  isFieldsValidating: (nameList: NamePath[]) => boolean;
  resetFields: (fields?: NamePath[]) => void;
  setFields: (fields: FieldData[]) => void;
  setFieldsValue: (value: RecursivePartial<Values>) => void;
  validateFields: ValidateFields<Values>;
  submit: () => void;
}

interface ArrayRule extends Omit<AggregationRule, "type"> {
  type: "array";
  defaultField?: RuleObject;
}

export type RuleObject = AggregationRule | ArrayRule;
export type Rule = RuleObject | RuleRender;

export enum IIsRequiredType {
  input = "input",
  select = "select",
  inputWithUnit = "inputWithUnit",
}
