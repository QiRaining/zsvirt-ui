import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { EventSubscriptionInventory } from "./types";

@Injectable()
export class AddActionToEventSubscriptionAction extends ActionAdvance {
  async call(
    params: AddActionToEventSubscriptionActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddActionToEventSubscriptionResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddActionToEventSubscriptionAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/events/subscriptions/${params.subscriptionUuid}/actions`,
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
    return this.postAction<AddActionToEventSubscriptionResult>(
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

export interface AddActionToEventSubscriptionActionParam {
  subscriptionUuid: string;
  actionUuid: string;
  actionType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddActionToEventSubscriptionResult {
  inventory?: EventSubscriptionInventory;
}
