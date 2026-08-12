import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MetricRuleTemplateInventory } from "./types";

@Injectable()
export class UpdateMetricRuleTemplateAction extends ActionAdvance {
  async call(
    params: UpdateMetricRuleTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateMetricRuleTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateMetricRuleTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/monitortemplates/metricrules/${params.uuid}/actions`,
      {
        updateMetricRuleTemplate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateMetricRuleTemplateResult>(
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

export interface UpdateMetricRuleTemplateActionParam {
  uuid: string;
  name?: string;
  comparisonOperator?: string;
  period?: number;
  threshold?: number;
  repeatInterval?: number;
  labels?: any[];
  repeatCount?: number;
  enableRecovery?: boolean;
  emergencyLevel?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateMetricRuleTemplateResult {
  inventory?: MetricRuleTemplateInventory;
}
