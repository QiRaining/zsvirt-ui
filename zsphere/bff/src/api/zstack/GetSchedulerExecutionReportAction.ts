import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetSchedulerExecutionReportAction extends QueryAdvance {
  async call(
    params: GetSchedulerExecutionReportActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetSchedulerExecutionReportResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetSchedulerExecutionReportAction.name,
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
      `/scheduler/report${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetSchedulerExecutionReportResult>(
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

export interface GetSchedulerExecutionReportActionParam {
  startTime: number;
  intervalTimeUnit: string;
  range: number;
  schedulerJobTypes: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetSchedulerExecutionReportResult {
  successRecords?: any[];
  failureRecords?: any[];
  partialSuccessRecords?: any[];
  waitingRecords?: any[];
}
