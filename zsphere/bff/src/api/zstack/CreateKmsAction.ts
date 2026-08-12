import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class CreateKmsAction extends ActionAdvance {
  async call(
    params: CreateKmsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateKmsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateKmsAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/key-providers/kms`,
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
    return this.postAction<CreateKmsResult>(
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

export interface CreateKmsActionParam {
  endpoint: string;
  port: number;
  kmipVersion?: string;
  username?: string;
  password?: string;
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

export interface CreateKmsResult {
  inventory?: any;
}
