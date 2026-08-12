import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PrimaryStorageInventory } from "./types";

@Injectable()
export class UpdatePrimaryStorageAction extends ActionAdvance {
  async call(
    params: UpdatePrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdatePrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdatePrimaryStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/primary-storage/${params.uuid}/actions`,
      {
        updatePrimaryStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdatePrimaryStorageResult>(
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

export interface UpdatePrimaryStorageActionParam {
  uuid: string;
  name?: string;
  description?: string;
  url?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdatePrimaryStorageResult {
  inventory?: PrimaryStorageInventory;
}
