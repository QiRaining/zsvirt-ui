import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class UpdateNkpAction extends ActionAdvance {
  async call(
    params: UpdateNkpActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateNkpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateNkpAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/nkp/${params.uuid}/actions`,
      {
        updateNkp: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateNkpResult>(
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

export interface UpdateNkpActionParam {
  uuid: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateNkpResult {
  inventory?: any;
}
