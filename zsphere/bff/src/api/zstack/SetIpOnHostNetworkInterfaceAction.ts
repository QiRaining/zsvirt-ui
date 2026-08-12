import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostNetworkInterfaceInventory } from "./types";

@Injectable()
export class SetIpOnHostNetworkInterfaceAction extends ActionAdvance {
  async call(
    params: SetIpOnHostNetworkInterfaceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetIpOnHostNetworkInterfaceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetIpOnHostNetworkInterfaceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/nics/${params.interfaceUuid}/ip`,
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
    return this.postAction<SetIpOnHostNetworkInterfaceResult>(
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

export interface SetIpOnHostNetworkInterfaceActionParam {
  interfaceUuid: string;
  ipAddress?: string;
  netmask?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetIpOnHostNetworkInterfaceResult {
  inventory?: HostNetworkInterfaceInventory;
}
