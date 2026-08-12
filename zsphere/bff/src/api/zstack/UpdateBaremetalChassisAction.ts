import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalChassisInventory } from "./types";

@Injectable()
export class UpdateBaremetalChassisAction extends ActionAdvance {
  async call(
    params: UpdateBaremetalChassisActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateBaremetalChassisResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateBaremetalChassisAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/chassis/${params.uuid}/actions`,
      {
        updateBaremetalChassis: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateBaremetalChassisResult>(
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

export interface UpdateBaremetalChassisActionParam {
  uuid: string;
  name?: string;
  description?: string;
  ipmiAddress?: string;
  ipmiPort?: number;
  ipmiUsername?: string;
  ipmiPassword?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateBaremetalChassisResult {
  inventory?: BaremetalChassisInventory;
}
