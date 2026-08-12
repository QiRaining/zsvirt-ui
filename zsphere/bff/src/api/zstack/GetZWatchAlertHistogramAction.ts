import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetZWatchAlertHistogramAction extends QueryAdvance {
  async call(
    params: GetZWatchAlertHistogramActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetZWatchAlertHistogramResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetZWatchAlertHistogramAction.name,
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
      `/zwatch/alert-histories/histogram${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetZWatchAlertHistogramResult>(
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

export interface GetZWatchAlertHistogramActionParam {
  tableName: string;
  startTime: number;
  endTime: number;
  intervalHours: number;
  groupColumns?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetZWatchAlertHistogramResult {
  histograms?: any[];
}
