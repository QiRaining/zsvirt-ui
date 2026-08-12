import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ZoneInventory } from "./types";

@Injectable()
export class ChangeZoneStateAction extends ActionAdvance {
  async call(
    params: ChangeZoneStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeZoneStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeZoneStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zones/${params.uuid}/actions`,
      {
        changeZoneState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeZoneStateResult>(
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

export interface ChangeZoneStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeZoneStateResult {
  inventory?: ZoneInventory;
}
