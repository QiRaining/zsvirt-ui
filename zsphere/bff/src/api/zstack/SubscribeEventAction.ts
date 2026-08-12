import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { EventSubscriptionInventory } from "./types";

@Injectable()
export class SubscribeEventAction extends ActionAdvance {
  async call(
    params: SubscribeEventActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SubscribeEventResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SubscribeEventAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/events/subscriptions`,
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
    return this.postAction<SubscribeEventResult>(
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

export interface SubscribeEventActionParam {
  name?: string;
  namespace: string;
  eventName: string;
  actions?: any[];
  labels?: any[];
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

export interface SubscribeEventResult {
  inventory?: EventSubscriptionInventory;
}
