import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L2NetworkInventory } from "./types";

@Injectable()
export class CreateL2HardwareVxlanNetworkAction extends ActionAdvance {
  async call(
    params: CreateL2HardwareVxlanNetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateL2HardwareVxlanNetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateL2HardwareVxlanNetworkAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l2-networks/hardware-vxlan`,
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
    return this.postAction<CreateL2HardwareVxlanNetworkResult>(
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

export interface CreateL2HardwareVxlanNetworkActionParam {
  vni?: number;
  poolUuid: string;
  name: string;
  description?: string;
  zoneUuid?: string;
  physicalInterface?: string;
  type?: string;
  vSwitchType?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateL2HardwareVxlanNetworkResult {
  inventory?: L2NetworkInventory;
}
