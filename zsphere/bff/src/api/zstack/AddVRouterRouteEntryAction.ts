import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VRouterRouteEntryInventory } from "./types";

@Injectable()
export class AddVRouterRouteEntryAction extends ActionAdvance {
  async call(
    params: AddVRouterRouteEntryActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddVRouterRouteEntryResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddVRouterRouteEntryAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vrouter-route-tables/${params.routeTableUuid}/route-entries`,
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
    return this.postAction<AddVRouterRouteEntryResult>(
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

export interface AddVRouterRouteEntryActionParam {
  description?: string;
  type?: string;
  routeTableUuid: string;
  destination: string;
  target?: string;
  distance?: number;
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

export interface AddVRouterRouteEntryResult {
  inventory?: VRouterRouteEntryInventory;
}
