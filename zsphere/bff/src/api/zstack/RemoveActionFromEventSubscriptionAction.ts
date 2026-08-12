import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemoveActionFromEventSubscriptionAction extends ActionAdvance {
  async call(
    params: RemoveActionFromEventSubscriptionActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveActionFromEventSubscriptionResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveActionFromEventSubscriptionAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "subscriptionUuid",
      "actionUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/zwatch/events/subscriptions/${params.subscriptionUuid}/actions/${params.actionUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveActionFromEventSubscriptionResult>(
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

export interface RemoveActionFromEventSubscriptionActionParam {
  subscriptionUuid: string;
  actionUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveActionFromEventSubscriptionResult {}
