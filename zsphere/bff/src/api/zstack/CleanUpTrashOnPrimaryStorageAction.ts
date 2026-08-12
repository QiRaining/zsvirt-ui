import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CleanUpTrashOnPrimaryStorageAction extends ActionAdvance {
  async call(
    params: CleanUpTrashOnPrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CleanUpTrashOnPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CleanUpTrashOnPrimaryStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/primary-storage/${params.uuid}/trash/actions`,
      {
        cleanUpTrashOnPrimaryStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CleanUpTrashOnPrimaryStorageResult>(
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

export interface CleanUpTrashOnPrimaryStorageActionParam {
  uuid: string;
  trashId?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CleanUpTrashOnPrimaryStorageResult {
  result?: any;
  results?: any[];
}
