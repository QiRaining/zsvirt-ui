import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { IpRangeInventory } from "./types";

@Injectable()
export class AddIpv6RangeAction extends ActionAdvance {
  async call(
    params: AddIpv6RangeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddIpRangeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddIpv6RangeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l3-networks/${params.l3NetworkUuid}/ipv6-ranges`,
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
    return this.postAction<AddIpRangeResult>(
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

export interface AddIpv6RangeActionParam {
  l3NetworkUuid: string;
  name: string;
  description?: string;
  startIp: string;
  endIp: string;
  gateway: string;
  prefixLen: number;
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

export interface AddIpRangeResult {
  inventory?: IpRangeInventory;
}
