import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { DirectoryInventory } from "./types";

@Injectable()
export class UpdateDirectoryAction extends ActionAdvance {
  async call(
    params: UpdateDirectoryActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateDirectoryResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateDirectoryAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/update/directory`,
      {
        updateDirectory: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateDirectoryResult>(
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

export interface UpdateDirectoryActionParam {
  uuid: string;
  name: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateDirectoryResult {
  inventory?: DirectoryInventory;
}
