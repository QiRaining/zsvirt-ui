import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L2NetworkInventory } from "./types";

@Injectable()
export class CreateL2PortGroupAction extends ActionAdvance {
  async call(
    params: CreateL2PortGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateL2PortGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateL2PortGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l2-networks/port-group`,
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
    return this.postAction<CreateL2PortGroupResult>(
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

export interface CreateL2PortGroupActionParam {
  vSwitchUuid: string;
  vlanMode?: string;
  vlan: number;
  vlanRanges?: string;
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

export interface CreateL2PortGroupResult {
  inventory?: L2NetworkInventory;
}
