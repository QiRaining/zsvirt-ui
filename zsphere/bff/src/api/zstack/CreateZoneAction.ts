import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ZoneInventory } from "./types";

@Injectable()
export class CreateZoneAction extends ActionAdvance {
  async call(
    params: CreateZoneActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateZoneResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateZoneAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zones`,
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
    return this.postAction<CreateZoneResult>(
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

export interface CreateZoneActionParam {
  name: string;
  description?: string;
  isDefault?: boolean;
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

export interface CreateZoneResult {
  inventory?: ZoneInventory;
}
