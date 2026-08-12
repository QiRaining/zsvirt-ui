import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AccessKeyInventory } from "./types";

@Injectable()
export class CreateAccessKeyAction extends ActionAdvance {
  async call(
    params: CreateAccessKeyActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateAccessKeyResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateAccessKeyAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/accesskeys`,
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
    return this.postAction<CreateAccessKeyResult>(
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

export interface CreateAccessKeyActionParam {
  accountUuid: string;
  userUuid?: string;
  description?: string;
  AccessKeyID?: string;
  AccessKeySecret?: string;
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

export interface CreateAccessKeyResult {
  inventory?: AccessKeyInventory;
}
