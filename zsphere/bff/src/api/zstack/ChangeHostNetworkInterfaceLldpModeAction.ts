import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ChangeHostNetworkInterfaceLldpModeAction extends ActionAdvance {
  async call(
    params: ChangeHostNetworkInterfaceLldpModeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeHostNetworkInterfaceLldpModeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeHostNetworkInterfaceLldpModeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hostNetworkInterface/lldp/actions`,
      {
        changeHostNetworkInterfaceLldpMode: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeHostNetworkInterfaceLldpModeResult>(
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

export interface ChangeHostNetworkInterfaceLldpModeActionParam {
  interfaceUuids: any[];
  mode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeHostNetworkInterfaceLldpModeResult {
  inventories?: any[];
}
