import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ThirdpartyPlatformInventory } from "./types";

@Injectable()
export class AddThirdpartyPlatformAction extends ActionAdvance {
  async call(
    params: AddThirdpartyPlatformActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddThirdpartyPlatformResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddThirdpartyPlatformAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/third-party/platforms`,
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
    return this.postAction<AddThirdpartyPlatformResult>(
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

export interface AddThirdpartyPlatformActionParam {
  name: string;
  type: string;
  url: string;
  template: string;
  description?: string;
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

export interface AddThirdpartyPlatformResult {
  inventory?: ThirdpartyPlatformInventory;
}
