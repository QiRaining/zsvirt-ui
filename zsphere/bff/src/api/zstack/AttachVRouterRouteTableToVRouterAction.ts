import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VRouterRouteTableInventory } from "./types";

@Injectable()
export class AttachVRouterRouteTableToVRouterAction extends ActionAdvance {
  async call(
    params: AttachVRouterRouteTableToVRouterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachVRouterRouteTableToVRouterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachVRouterRouteTableToVRouterAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vrouter-route-tables/${params.routeTableUuid}/attach`,
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
    return this.postAction<AttachVRouterRouteTableToVRouterResult>(
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

export interface AttachVRouterRouteTableToVRouterActionParam {
  routeTableUuid: string;
  virtualRouterVmUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachVRouterRouteTableToVRouterResult {
  inventory?: VRouterRouteTableInventory;
}
