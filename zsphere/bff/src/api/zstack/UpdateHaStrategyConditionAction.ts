import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HaStrategyConditionInventory } from "./types";

@Injectable()
export class UpdateHaStrategyConditionAction extends ActionAdvance {
  async call(
    params: UpdateHaStrategyConditionActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHaStrategyConditionResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHaStrategyConditionAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/ha-strategy-condition/${params.uuid}/actions`,
      {
        updateHaStrategyCondition: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateHaStrategyConditionResult>(
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

export interface UpdateHaStrategyConditionActionParam {
  uuid: string;
  name?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateHaStrategyConditionResult {
  inventory?: HaStrategyConditionInventory;
}
