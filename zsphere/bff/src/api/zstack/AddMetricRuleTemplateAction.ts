import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MetricRuleTemplateInventory } from "./types";

@Injectable()
export class AddMetricRuleTemplateAction extends ActionAdvance {
  async call(
    params: AddMetricRuleTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddMetricRuleTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddMetricRuleTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/monitortemplates/${params.monitorTemplateUuid}/metricrules`,
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
    return this.postAction<AddMetricRuleTemplateResult>(
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

export interface AddMetricRuleTemplateActionParam {
  name: string;
  monitorTemplateUuid: string;
  comparisonOperator: string;
  period?: number;
  namespace: string;
  metricName: string;
  threshold: number;
  repeatInterval?: number;
  labels?: any[];
  repeatCount?: number;
  enableRecovery?: boolean;
  emergencyLevel?: string;
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

export interface AddMetricRuleTemplateResult {
  inventory?: MetricRuleTemplateInventory;
}
