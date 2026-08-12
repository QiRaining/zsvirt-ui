import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ExpungeImageAction extends ActionAdvance {
  async call(
    params: ExpungeImageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ExpungeImageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ExpungeImageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/images/${params.imageUuid}/actions`,
      {
        expungeImage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ExpungeImageResult>(
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

export interface ExpungeImageActionParam {
  uuid?: string;
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

export interface ExpungeImageResult {}
