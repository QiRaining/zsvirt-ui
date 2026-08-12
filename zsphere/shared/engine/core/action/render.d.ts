import { buildOption } from "./build";
export declare function renderActionOption(
  option: ReturnType<typeof buildOption>,
  sheet: string,
  intl: any,
): {
  list: any[];
  viewMap: any;
};
export declare function genActionFromRemote(
  resourceKey: string,
  intl: any,
): Promise<{
  list: any[];
  viewMap: any;
}>;
