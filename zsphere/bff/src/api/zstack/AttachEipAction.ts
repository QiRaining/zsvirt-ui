import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { EipInventory } from "./types";

@Injectable()
export class AttachEipAction extends ActionAdvance {
  async call(
    params: AttachEipActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachEipResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachEipAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/eips/${params.eipUuid}/vm-instances/nics/${params.vmNicUuid}`,
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
    return this.postAction<AttachEipResult>(
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

export interface AttachEipActionParam {
  eipUuid: string;
  vmNicUuid: string;
  usedIpUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachEipResult {
  inventory?: EipInventory;
}
