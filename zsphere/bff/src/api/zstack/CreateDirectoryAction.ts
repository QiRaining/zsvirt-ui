import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { DirectoryInventory } from "./types";

@Injectable()
export class CreateDirectoryAction extends ActionAdvance {
  async call(
    params: CreateDirectoryActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateDirectoryResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateDirectoryAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/create/directory`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CreateDirectoryResult>(
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

export interface CreateDirectoryActionParam {
  name: string;
  parentUuid?: string;
  zoneUuid: string;
  type: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateDirectoryResult {
  inventory?: DirectoryInventory;
}
