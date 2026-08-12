import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SystemTagInventory } from "./types";

@Injectable()
export class CreateSystemTagAction extends ActionAdvance {
  async call(
    params: CreateSystemTagActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSystemTagResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSystemTagAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/system-tags`,
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
    return this.postAction<CreateSystemTagResult>(
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

export interface CreateSystemTagActionParam {
  resourceType: string;
  resourceUuid: string;
  tag: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateSystemTagResult {
  inventory?: SystemTagInventory;
}
