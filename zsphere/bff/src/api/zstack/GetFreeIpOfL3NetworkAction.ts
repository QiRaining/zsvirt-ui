import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetFreeIpOfL3NetworkAction extends QueryAdvance {
  async call(
    params: GetFreeIpOfL3NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetFreeIpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetFreeIpOfL3NetworkAction.name,
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
      "l3NetworkUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/l3-networks/${params.l3NetworkUuid}/ip/free${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetFreeIpResult>(
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

export interface GetFreeIpOfL3NetworkActionParam {
  l3NetworkUuid?: string;
  ipRangeUuid?: string;
  start?: string;
  ipRangeType?: string;
  ipVersion?: number;
  limit?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetFreeIpResult {
  inventories?: any[];
}
