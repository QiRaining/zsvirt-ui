import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { EipInventory } from "./types";

@Injectable()
export class UpdateEipAction extends ActionAdvance {
  async call(
    params: UpdateEipActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateEipResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateEipAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/eips/${params.uuid}/actions`,
      {
        updateEip: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateEipResult>(
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

export interface UpdateEipActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateEipResult {
  inventory?: EipInventory;
}
