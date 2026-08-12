import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AddStorageProtocolAction extends ActionAdvance {
  async call(
    params: AddStorageProtocolActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddStorageProtocolResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddStorageProtocolAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/primary-storage/protocols`,
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
    return this.postAction<AddStorageProtocolResult>(
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

export interface AddStorageProtocolActionParam {
  uuid: string;
  outputProtocol: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddStorageProtocolResult {}
