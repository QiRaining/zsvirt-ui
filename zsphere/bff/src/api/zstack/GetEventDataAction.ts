import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetEventDataAction extends QueryAdvance {
  async call(
    params: GetEventDataActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetEventDataResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetEventDataAction.name,
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
      `/zwatch/events${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetEventDataResult>(
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

export interface GetEventDataActionParam {
  startTime?: number;
  endTime?: number;
  offsetAheadOfCurrentTime?: number;
  limit?: number;
  conditions?: any[];
  count?: boolean;
  start?: number;
  conditionExpression?: string;
  endpointUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetEventDataResult {
  events?: any[];
  total?: number;
}
