import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ZoneInventory } from "./types";

@Injectable()
export class UpdateZoneAction extends ActionAdvance {
  async call(
    params: UpdateZoneActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateZoneResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateZoneAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zones/${params.uuid}/actions`,
      {
        updateZone: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateZoneResult>(
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

export interface UpdateZoneActionParam {
  name?: string;
  description?: string;
  uuid: string;
  isDefault?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateZoneResult {
  inventory?: ZoneInventory;
}
