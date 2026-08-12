import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { IpRangeInventory } from "./types";

@Injectable()
export class AddIpv6RangeByNetworkCidrAction extends ActionAdvance {
  async call(
    params: AddIpv6RangeByNetworkCidrActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddIpRangeByNetworkCidrResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddIpv6RangeByNetworkCidrAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l3-networks/${params.l3NetworkUuid}/ipv6-ranges/by-cidr`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AddIpRangeByNetworkCidrResult>(
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

export interface AddIpv6RangeByNetworkCidrActionParam {
  name: string;
  description?: string;
  l3NetworkUuid: string;
  networkCidr: string;
  addressMode: string;
  ipRangeType?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddIpRangeByNetworkCidrResult {
  inventory?: IpRangeInventory;
  inventories?: any[];
}
