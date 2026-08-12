import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { TagPatternInventory } from "./types";

@Injectable()
export class CreateTagAction extends ActionAdvance {
  async call(
    params: CreateTagActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateTagResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateTagAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/tags`,
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
    return this.postAction<CreateTagResult>(
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

export interface CreateTagActionParam {
  name: string;
  value: string;
  description?: string;
  color?: string;
  type?: string;
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

export interface CreateTagResult {
  inventory?: TagPatternInventory;
}
