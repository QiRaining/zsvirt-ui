import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ThirdpartyPlatformInventory } from "./types";

@Injectable()
export class UpdateThirdpartyPlatformAction extends ActionAdvance {
  async call(
    params: UpdateThirdpartyPlatformActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateThirdpartyPlatformResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateThirdpartyPlatformAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/third-party/platforms/${params.uuid}/actions`,
      {
        updateThirdpartyPlatform: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateThirdpartyPlatformResult>(
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

export interface UpdateThirdpartyPlatformActionParam {
  uuid: string;
  name?: string;
  description?: string;
  template?: string;
  url?: string;
  stateEvent?: string;
  lastSyncDateMills?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateThirdpartyPlatformResult {
  inventory?: ThirdpartyPlatformInventory;
}
