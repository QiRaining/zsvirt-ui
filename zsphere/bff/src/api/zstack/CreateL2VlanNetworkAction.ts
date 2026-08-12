import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L2NetworkInventory } from "./types";

@Injectable()
export class CreateL2VlanNetworkAction extends ActionAdvance {
  async call(
    params: CreateL2VlanNetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateL2VlanNetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateL2VlanNetworkAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l2-networks/vlan`,
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
    return this.postAction<CreateL2VlanNetworkResult>(
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

export interface CreateL2VlanNetworkActionParam {
  vlan: number;
  name: string;
  description?: string;
  zoneUuid: string;
  physicalInterface: string;
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

export interface CreateL2VlanNetworkResult {
  inventory?: L2NetworkInventory;
}
