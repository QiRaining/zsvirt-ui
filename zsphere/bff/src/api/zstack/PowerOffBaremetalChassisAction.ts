import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class PowerOffBaremetalChassisAction extends ActionAdvance {
  async call(
    params: PowerOffBaremetalChassisActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<PowerOffBaremetalChassisResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      PowerOffBaremetalChassisAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/chassis/${params.chassisUuid}/actions`,
      {
        powerOffBaremetalChassis: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<PowerOffBaremetalChassisResult>(
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

export interface PowerOffBaremetalChassisActionParam {
  chassisUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface PowerOffBaremetalChassisResult {}
