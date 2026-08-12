import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSApplicationPlatformInventory } from "./types";

@Injectable()
export class CreateSNSEmailPlatformAction extends ActionAdvance {
  async call(
    params: CreateSNSEmailPlatformActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSNSApplicationPlatformResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSNSEmailPlatformAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-platforms/email`,
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
    return this.postAction<CreateSNSApplicationPlatformResult>(
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

export interface CreateSNSEmailPlatformActionParam {
  smtpServer: string;
  smtpPort: number;
  username?: string;
  password?: string;
  encryptType?: string;
  name: string;
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

export interface CreateSNSApplicationPlatformResult {
  inventory?: SNSApplicationPlatformInventory;
}
