import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { EventRuleTemplateInventory } from "./types";

@Injectable()
export class UpdateEventRuleTemplateAction extends ActionAdvance {
  async call(
    params: UpdateEventRuleTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateEventRuleTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateEventRuleTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/monitortemplates/evenrules/${params.uuid}/actions`,
      {
        updateEventRuleTemplate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateEventRuleTemplateResult>(
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

export interface UpdateEventRuleTemplateActionParam {
  uuid: string;
  name?: string;
  emergencyLevel?: string;
  labels?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateEventRuleTemplateResult {
  inventory?: EventRuleTemplateInventory;
}
