import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class CreateNkpAction extends ActionAdvance {
  async call(
    params: CreateNkpActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateNkpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateNkpAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/key-providers/nkp`,
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
    return this.postAction<CreateNkpResult>(
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

export interface CreateNkpActionParam {
  kdf?: string;
  saltPolicy?: string;
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

export interface CreateNkpResult {
  inventory?: any;
}
