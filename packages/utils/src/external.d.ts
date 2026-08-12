declare module "*.less";
declare module "*.svg";
declare module "*.gql";
declare module "gbk.js" {
  export function encode(string: string): number[];
}

interface Window {
  base: {
    apollo: any;
  };
}
