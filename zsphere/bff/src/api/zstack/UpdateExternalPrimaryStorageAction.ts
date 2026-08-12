import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ExternalPrimaryStorageInventory } from "./types";

@Injectable()
export class UpdateExternalPrimaryStorageAction extends ActionAdvance {
  async call(
    params: UpdateExternalPrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateExternalPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateExternalPrimaryStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/primary-storage/addon/${params.uuid}/actions`,
      {
        updateExternalPrimaryStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateExternalPrimaryStorageResult>(
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

export interface UpdateExternalPrimaryStorageActionParam {
  config?: string;
  defaultProtocol?: string;
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

export interface UpdateExternalPrimaryStorageResult {
  inventory?: ExternalPrimaryStorageInventory;
}
