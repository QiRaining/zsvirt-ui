import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class MoveResourcesToDirectoryAction extends ActionAdvance {
  async call(
    params: MoveResourcesToDirectoryActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<MoveResourcesToDirectoryResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      MoveResourcesToDirectoryAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/move/resources/directory`,
      {
        moveResourcesToDirectory: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<MoveResourcesToDirectoryResult>(
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

export interface MoveResourcesToDirectoryActionParam {
  resourceUuids: any[];
  directoryUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface MoveResourcesToDirectoryResult {}
