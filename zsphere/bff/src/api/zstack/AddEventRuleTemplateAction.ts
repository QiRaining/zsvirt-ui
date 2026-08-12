import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { EventRuleTemplateInventory } from "./types";

@Injectable()
export class AddEventRuleTemplateAction extends ActionAdvance {
  async call(
    params: AddEventRuleTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddEventRuleTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddEventRuleTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/monitortemplates/evenrules`,
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
    return this.postAction<AddEventRuleTemplateResult>(
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

export interface AddEventRuleTemplateActionParam {
  name: string;
  monitorTemplateUuid: string;
  namespace: string;
  eventName: string;
  emergencyLevel?: string;
  labels?: any[];
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

export interface AddEventRuleTemplateResult {
  inventory?: EventRuleTemplateInventory;
}
