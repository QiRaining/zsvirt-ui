import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class CheckIpAvailabilityAction extends QueryAdvance {
  async call(
    params: CheckIpAvailabilityActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CheckIpAvailabilityResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CheckIpAvailabilityAction.name,
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
      "ip",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/l3-networks/${params.l3NetworkUuid}/ip/${params.ip}/availability${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CheckIpAvailabilityResult>(
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

export interface CheckIpAvailabilityActionParam {
  l3NetworkUuid: string;
  ip: string;
  arpCheck?: boolean;
  ipRangeCheck?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CheckIpAvailabilityResult {
  available?: boolean;
  reason?: string;
}
