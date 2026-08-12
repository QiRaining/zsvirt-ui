import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ImageInventory } from "./types";

@Injectable()
export class RecoverImageAction extends ActionAdvance {
  async call(
    params: RecoverImageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RecoverImageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RecoverImageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/images/${params.imageUuid}/actions`,
      {
        recoverImage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RecoverImageResult>(
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

export interface RecoverImageActionParam {
  imageUuid: string;
  backupStorageUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RecoverImageResult {
  inventory?: ImageInventory;
}
