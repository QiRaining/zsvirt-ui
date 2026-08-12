import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VRouterRouteTableInventory } from "./types";

@Injectable()
export class UpdateVRouterRouteTableAction extends ActionAdvance {
  async call(
    params: UpdateVRouterRouteTableActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVRouterRouteTableResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVRouterRouteTableAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vrouter-route-tables/${params.uuid}/actions`,
      {
        updateVRouterRouteTable: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVRouterRouteTableResult>(
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

export interface UpdateVRouterRouteTableActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVRouterRouteTableResult {
  inventory?: VRouterRouteTableInventory;
}
