import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostNetworkInterfaceInventory } from "./types";

@Injectable()
export class UpdateHostNetworkInterfaceAction extends ActionAdvance {
  async call(
    params: UpdateHostNetworkInterfaceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHostNetworkInterfaceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHostNetworkInterfaceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/nics/${params.interfaceUuid}/actions`,
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
    return this.postAction<UpdateHostNetworkInterfaceResult>(
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

export interface UpdateHostNetworkInterfaceActionParam {
  interfaceUuid: string;
  description: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateHostNetworkInterfaceResult {
  inventory?: HostNetworkInterfaceInventory;
}
