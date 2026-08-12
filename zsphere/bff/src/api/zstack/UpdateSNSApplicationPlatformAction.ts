import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSApplicationPlatformInventory } from "./types";

@Injectable()
export class UpdateSNSApplicationPlatformAction extends ActionAdvance {
  async call(
    params: UpdateSNSApplicationPlatformActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSNSApplicationPlatformResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSNSApplicationPlatformAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-platforms/${params.uuid}/actions`,
      {
        updateSNSApplicationPlatform: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSNSApplicationPlatformResult>(
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

export interface UpdateSNSApplicationPlatformActionParam {
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

export interface UpdateSNSApplicationPlatformResult {
  inventory?: SNSApplicationPlatformInventory;
}
