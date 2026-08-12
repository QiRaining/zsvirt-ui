import { VmNic } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";

/**
 * 排序 VmNic 列表，将默认网络的网卡排在最前面
 * @param vmNics 网卡列表
 * @param defaultL3NetworkUuid 默认三层网络 UUID
 */
export function sortVmNics(vmNics: VmNic[], defaultL3NetworkUuid?: string) {
  const list = _.sortBy(vmNics, "deviceId");
  if (defaultL3NetworkUuid) {
    const defaultNics = _.remove(
      list,
      (nic) => nic.l3NetworkUuid === defaultL3NetworkUuid,
    );
    return defaultNics.concat(list);
  }
  return list;
}
