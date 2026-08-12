import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetPrometheusMetricLabelValueAction extends QueryAdvance {
  // 使用 zsHttpService

  async call(
    params: GetPrometheusMetricLabelValueActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetPrometheusMetricLabelValueResult> {
    const actionName = GetPrometheusMetricLabelValueAction.name;
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      actionName,
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
      `/zwatch/metrics/prometheus/label-values${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        actionName,
        sessionId,
      },
    );
    return this.postAction<GetPrometheusMetricLabelValueResult>(
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

export interface GetPrometheusMetricLabelValueActionParam {
  namespace: string;
  metricName: string;
  startTime?: number;
  endTime?: number;
  labelNames?: any[];
  filterLabels?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetPrometheusMetricLabelValueResult {
  labelValues?: any;
}
