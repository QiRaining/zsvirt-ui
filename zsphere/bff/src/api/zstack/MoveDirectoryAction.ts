import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class MoveDirectoryAction extends ActionAdvance {
  async call(
    params: MoveDirectoryActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<MoveDirectoryResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      MoveDirectoryAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/move/directory`,
      {
        moveDirectory: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<MoveDirectoryResult>(
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

export interface MoveDirectoryActionParam {
  targetParentUuid: string;
  directoryUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface MoveDirectoryResult {}
