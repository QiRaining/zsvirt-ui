import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { TagPatternInventory } from "./types";

@Injectable()
export class UpdateTagAction extends ActionAdvance {
  async call(
    params: UpdateTagActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateTagResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateTagAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/tags/${params.uuid}/actions`,
      {
        updateTag: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateTagResult>(
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

export interface UpdateTagActionParam {
  uuid: string;
  name?: string;
  value?: string;
  description?: string;
  color?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateTagResult {
  inventory?: TagPatternInventory;
}
