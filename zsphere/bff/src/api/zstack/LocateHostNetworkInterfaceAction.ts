import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class LocateHostNetworkInterfaceAction extends ActionAdvance {
  async call(
    params: LocateHostNetworkInterfaceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<LocateHostNetworkInterfaceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      LocateHostNetworkInterfaceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/${params.hostUuid}/locate/network-interface`,
      {
        locateHostNetworkInterface: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<LocateHostNetworkInterfaceResult>(
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

export interface LocateHostNetworkInterfaceActionParam {
  hostUuid: string;
  networkInterfaceName: string;
  interval?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface LocateHostNetworkInterfaceResult {}
