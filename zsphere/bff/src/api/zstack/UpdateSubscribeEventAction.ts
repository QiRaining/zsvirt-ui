import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { EventSubscriptionInventory } from "./types";

@Injectable()
export class UpdateSubscribeEventAction extends ActionAdvance {
  async call(
    params: UpdateSubscribeEventActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSubscribeEventResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSubscribeEventAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/events/subscriptions/${params.uuid}/actions`,
      {
        updateSubscribeEvent: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSubscribeEventResult>(
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

export interface UpdateSubscribeEventActionParam {
  uuid: string;
  emergencyLevel?: string;
  name?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSubscribeEventResult {
  inventory?: EventSubscriptionInventory;
}
