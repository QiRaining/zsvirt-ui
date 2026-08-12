import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SystemTagInventory } from "./types";

@Injectable()
export class UpdateSystemTagAction extends ActionAdvance {
  async call(
    params: UpdateSystemTagActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSystemTagResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSystemTagAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/system-tags/${params.uuid}/actions`,
      {
        updateSystemTag: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSystemTagResult>(
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

export interface UpdateSystemTagActionParam {
  uuid: string;
  tag: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSystemTagResult {
  inventory?: SystemTagInventory;
}
