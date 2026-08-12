import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostInventory } from "./types";

@Injectable()
export class AddXDragonHostAction extends ActionAdvance {
  async call(
    params: AddXDragonHostActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddHostResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddXDragonHostAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/xdragon`,
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
    return this.postAction<AddHostResult>(
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

export interface AddXDragonHostActionParam {
  username: string;
  password: string;
  cpuNum?: number;
  cpuSockets?: number;
  totalPhysicalMemory?: number;
  sshPort?: number;
  name: string;
  description?: string;
  managementIp: string;
  clusterUuid: string;
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

export interface AddHostResult {
  inventory?: HostInventory;
}
