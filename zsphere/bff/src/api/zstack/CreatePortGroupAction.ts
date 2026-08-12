import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L3NetworkInventory } from "./types";

@Injectable()
export class CreatePortGroupAction extends ActionAdvance {
  async call(
    params: CreatePortGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreatePortGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreatePortGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l3-networks/port-group`,
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
    return this.postAction<CreatePortGroupResult>(
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

export interface CreatePortGroupActionParam {
  vSwitchUuid: string;
  vlanMode?: string;
  vlan: number;
  vlanRanges?: string;
  name: string;
  description?: string;
  type?: string;
  l2NetworkUuid?: string;
  category?: string;
  ipVersion?: number;
  system?: boolean;
  dnsDomain?: string;
  enableIPAM?: boolean;
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

export interface CreatePortGroupResult {
  inventory?: L3NetworkInventory;
}
