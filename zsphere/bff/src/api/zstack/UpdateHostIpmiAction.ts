import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostIpmiInventory } from "./types";

@Injectable()
export class UpdateHostIpmiAction extends ActionAdvance {
  async call(
    params: UpdateHostIpmiActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHostIpmiResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHostIpmiAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/ipmi/${params.uuid}/actions`,
      {
        updateHostIpmi: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateHostIpmiResult>(
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

export interface UpdateHostIpmiActionParam {
  uuid: string;
  ipmiAddress?: string;
  ipmiUsername?: string;
  ipmiPassword?: string;
  ipmiPort?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateHostIpmiResult {
  hostIpmiInventory?: HostIpmiInventory;
}
