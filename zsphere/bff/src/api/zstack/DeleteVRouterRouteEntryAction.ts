import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VRouterRouteTableInventory } from "./types";

@Injectable()
export class DeleteVRouterRouteEntryAction extends ActionAdvance {
  async call(
    params: DeleteVRouterRouteEntryActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteVRouterRouteEntryResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteVRouterRouteEntryAction.name,
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
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/vrouter-route-tables/${params.routeTableUuid}/route-entries/${params.uuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteVRouterRouteEntryResult>(
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

export interface DeleteVRouterRouteEntryActionParam {
  uuid: string;
  routeTableUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteVRouterRouteEntryResult {
  inventory?: VRouterRouteTableInventory;
}
