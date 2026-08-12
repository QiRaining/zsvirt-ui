import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import { uniq, compact, difference } from "lodash-es";

const ADMIN_UUID = "36c27e8ff05c4780bf6d2fa65700f22e";

export const verifyMultipleOwnerTag = (selectedList: ITag[]): boolean => {
  const ownerUuidList = uniq(compact(selectedList).map((it) => it.owner?.uuid));
  return difference(ownerUuidList, [ADMIN_UUID]).length < 2;
};
