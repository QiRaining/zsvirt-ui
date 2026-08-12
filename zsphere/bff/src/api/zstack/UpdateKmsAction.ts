import { Injectable } from "@nestjs/common";
import { ActionInfo } from "./base/types";

import { ActionAdvance } from "./base/action-advance";

@Injectable()
export class UpdateKmsAction extends ActionAdvance {
  async call(
    params: UpdateKmsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateKmsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateKmsAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/key-providers/kms/${params.uuid}/actions`,
      {
        updateKms: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateKmsResult>(
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

export interface UpdateKmsActionParam {
  endpoint?: string;
  port?: number;
  kmipVersion?: string;
  username?: string;
  password?: string;
  uuid: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateKmsResult {
  inventory?: any;
}
