import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VRouterRouteTableInventory } from "./types";

@Injectable()
export class DetachVRouterRouteTableFromVRouterAction extends ActionAdvance {
  async call(
    params: DetachVRouterRouteTableFromVRouterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachVRouterRouteTableFromVRouterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachVRouterRouteTableFromVRouterAction.name,
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
      "routeTableUuid",
      "virtualRouterVmUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/vrouter-route-tables/${params.routeTableUuid}/detach/${params.virtualRouterVmUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachVRouterRouteTableFromVRouterResult>(
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

export interface DetachVRouterRouteTableFromVRouterActionParam {
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

export interface DetachVRouterRouteTableFromVRouterResult {
  inventory?: VRouterRouteTableInventory;
}
