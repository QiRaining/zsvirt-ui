import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSApplicationPlatformInventory } from "./types";

@Injectable()
export class ChangeSNSApplicationPlatformStateAction extends ActionAdvance {
  async call(
    params: ChangeSNSApplicationPlatformStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeSNSApplicationPlatformStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeSNSApplicationPlatformStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-platforms/${params.uuid}/actions`,
      {
        changeSNSApplicationPlatformState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeSNSApplicationPlatformStateResult>(
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

export interface ChangeSNSApplicationPlatformStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeSNSApplicationPlatformStateResult {
  inventory?: SNSApplicationPlatformInventory;
}
