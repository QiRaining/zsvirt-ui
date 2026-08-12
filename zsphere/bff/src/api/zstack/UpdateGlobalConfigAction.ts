import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { GlobalConfigInventory } from "./types";

@Injectable()
export class UpdateGlobalConfigAction extends ActionAdvance {
  async call(
    params: UpdateGlobalConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateGlobalConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateGlobalConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/global-configurations/${params.category}/${params.name}/actions`,
      {
        updateGlobalConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateGlobalConfigResult>(
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

export interface UpdateGlobalConfigActionParam {
  category: string;
  name: string;
  value?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateGlobalConfigResult {
  inventory?: GlobalConfigInventory;
}
