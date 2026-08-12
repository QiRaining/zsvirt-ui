import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalChassisInventory } from "./types";

@Injectable()
export class CreateBaremetalChassisAction extends ActionAdvance {
  async call(
    params: CreateBaremetalChassisActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateBaremetalChassisResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateBaremetalChassisAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/baremetal/chassis`,
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
    return this.postAction<CreateBaremetalChassisResult>(
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

export interface CreateBaremetalChassisActionParam {
  name: string;
  description?: string;
  clusterUuid: string;
  ipmiAddress: string;
  ipmiPort?: number;
  ipmiUsername: string;
  ipmiPassword: string;
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

export interface CreateBaremetalChassisResult {
  inventory?: BaremetalChassisInventory;
}
