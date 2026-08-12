import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PrimaryStorageInventory } from "./types";

@Injectable()
export class ChangePrimaryStorageStateAction extends ActionAdvance {
  async call(
    params: ChangePrimaryStorageStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangePrimaryStorageStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangePrimaryStorageStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/primary-storage/${params.uuid}/actions`,
      {
        changePrimaryStorageState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangePrimaryStorageStateResult>(
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

export interface ChangePrimaryStorageStateActionParam {
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

export interface ChangePrimaryStorageStateResult {
  inventory?: PrimaryStorageInventory;
}
