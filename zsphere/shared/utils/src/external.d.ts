declare module "*.less";
declare module "*.webp";
declare module "*.gql";
declare module "gbk.js" {
  export function encode(string: string): number[];
}
declare module "jsbn" {
  export class BigInteger {
    constructor(value: string | number | BigInteger, base?: number);
    toString(base?: number): string;
    add(other: BigInteger): BigInteger;
    subtract(other: BigInteger): BigInteger;
    multiply(other: BigInteger): BigInteger;
    divide(other: BigInteger): BigInteger;
    mod(other: BigInteger): BigInteger;
    compareTo(other: BigInteger): number;
    [key: string]: any;
  }
}

interface Window {
  base: {
    apollo: any;
  };
}
