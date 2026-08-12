import type { IQuery } from "@zstack/zsphere-types";

import type { Item } from "./type";

interface BuildModalSelectDefaultQueryParams<T extends Item> {
  defaultQuery?: IQuery;
}

export function buildModalSelectDefaultQuery<T extends Item>({
  defaultQuery,
}: BuildModalSelectDefaultQueryParams<T>): IQuery {
  return defaultQuery ?? {};
}
