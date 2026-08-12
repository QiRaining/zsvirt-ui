import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetMetricDataAction extends QueryAdvance {
  async call(
    params: GetMetricDataActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetMetricDataResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetMetricDataAction.name,
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
      `/zwatch/metrics${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetMetricDataResult>(
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

export interface GetMetricDataActionParam {
  namespace: string;
  metricName: string;
  startTime?: number;
  endTime?: number;
  offsetAheadOfCurrentTime?: number;
  period?: number;
  labels?: any[];
  valueConditions?: any[];
  functions?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetMetricDataResult {
  data?: any[];
}
