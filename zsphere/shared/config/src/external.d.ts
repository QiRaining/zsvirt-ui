declare module "*.less";
declare module "*.webp";
declare module "*.gql";
declare module "gbk.js" {
  export function encode(string: string): number[];
}

interface Window {
  base: {
    apollo: any;
  };
}
