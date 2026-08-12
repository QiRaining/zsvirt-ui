import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetFreeIpOfIpRangeAction extends QueryAdvance {
  async call(
    params: GetFreeIpOfIpRangeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetFreeIpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetFreeIpOfIpRangeAction.name,
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
      "ipRangeUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/l3-networks/ip-ranges/${params.ipRangeUuid}/ip/free${paramString}`,
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

export interface GetFreeIpOfIpRangeActionParam {
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
