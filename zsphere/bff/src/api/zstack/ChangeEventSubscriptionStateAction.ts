import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { EventSubscriptionInventory } from "./types";

@Injectable()
export class ChangeEventSubscriptionStateAction extends ActionAdvance {
  async call(
    params: ChangeEventSubscriptionStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeEventSubscriptionStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeEventSubscriptionStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/change/eventSubscription/${params.uuid}/state`,
      {
        changeEventSubscriptionState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeEventSubscriptionStateResult>(
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

export interface ChangeEventSubscriptionStateActionParam {
  uuid: string;
  state: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeEventSubscriptionStateResult {
  inventory?: EventSubscriptionInventory;
}
