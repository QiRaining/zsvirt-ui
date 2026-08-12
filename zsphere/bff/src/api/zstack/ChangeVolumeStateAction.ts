import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeInventory } from "./types";

@Injectable()
export class ChangeVolumeStateAction extends ActionAdvance {
  async call(
    params: ChangeVolumeStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeVolumeStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeVolumeStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volumes/${params.uuid}/actions`,
      {
        changeVolumeState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeVolumeStateResult>(
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

export interface ChangeVolumeStateActionParam {
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

export interface ChangeVolumeStateResult {
  inventory?: VolumeInventory;
}
