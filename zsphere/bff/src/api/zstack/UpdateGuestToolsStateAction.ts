import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { GuestToolsStateInventory } from "./types";

@Injectable()
export class UpdateGuestToolsStateAction extends ActionAdvance {
  async call(
    params: UpdateGuestToolsStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateGuestToolsStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateGuestToolsStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.vmInstanceUuid}/guesttools-state`,
      {
        updateGuestToolsState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateGuestToolsStateResult>(
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

export interface UpdateGuestToolsStateActionParam {
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateGuestToolsStateResult {
  inventory?: GuestToolsStateInventory;
}
