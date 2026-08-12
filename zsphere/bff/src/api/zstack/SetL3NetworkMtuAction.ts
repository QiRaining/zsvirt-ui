import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetL3NetworkMtuAction extends ActionAdvance {
  async call(
    params: SetL3NetworkMtuActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetL3NetworkMtuResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetL3NetworkMtuAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l3-networks/${params.l3NetworkUuid}/mtu`,
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
    return this.postAction<SetL3NetworkMtuResult>(
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

export interface SetL3NetworkMtuActionParam {
  l3NetworkUuid: string;
  mtu: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetL3NetworkMtuResult {}
