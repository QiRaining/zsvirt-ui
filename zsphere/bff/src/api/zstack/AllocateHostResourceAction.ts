import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AllocateHostResourceAction extends ActionAdvance {
  async call(
    params: AllocateHostResourceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AllocateHostResourceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AllocateHostResourceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/${params.uuid}/allocate-resource`,
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
    return this.postAction<AllocateHostResourceResult>(
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

export interface AllocateHostResourceActionParam {
  uuid: string;
  strategy: string;
  scene: string;
  vcpu: number;
  memSize?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AllocateHostResourceResult {
  name?: string;
  uuid?: string;
  vCPUPin?: any[];
}
