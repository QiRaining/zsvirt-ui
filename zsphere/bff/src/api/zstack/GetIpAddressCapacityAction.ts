import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetIpAddressCapacityAction extends QueryAdvance {
  async call(
    params: GetIpAddressCapacityActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetIpAddressCapacityResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetIpAddressCapacityAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/ip-capacity${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetIpAddressCapacityResult>(
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
      httpRequestPromise,
      needRecord,
      apiRecord,
    );
  }
}

export interface GetIpAddressCapacityActionParam {
  zoneUuids?: any[];
  l3NetworkUuids?: any[];
  ipRangeUuids?: any[];
  all?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetIpAddressCapacityResult {
  totalCapacity?: number;
  availableCapacity?: number;
  usedIpAddressNumber?: number;
  ipv4TotalCapacity?: number;
  ipv4AvailableCapacity?: number;
  ipv4UsedIpAddressNumber?: number;
  ipv6TotalCapacity?: number;
  ipv6AvailableCapacity?: number;
  ipv6UsedIpAddressNumber?: number;
  capacityData?: any[];
  resourceType?: string;
}
