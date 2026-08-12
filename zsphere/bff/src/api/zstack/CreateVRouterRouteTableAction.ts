import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VRouterRouteTableInventory } from "./types";

@Injectable()
export class CreateVRouterRouteTableAction extends ActionAdvance {
  async call(
    params: CreateVRouterRouteTableActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVRouterRouteTableResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVRouterRouteTableAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vrouter-route-tables`,
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
    return this.postAction<CreateVRouterRouteTableResult>(
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

export interface CreateVRouterRouteTableActionParam {
  name: string;
  description?: string;
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

export interface CreateVRouterRouteTableResult {
  inventory?: VRouterRouteTableInventory;
}
