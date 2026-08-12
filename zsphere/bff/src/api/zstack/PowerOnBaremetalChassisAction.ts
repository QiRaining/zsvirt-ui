import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class PowerOnBaremetalChassisAction extends ActionAdvance {
  async call(
    params: PowerOnBaremetalChassisActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<PowerOnBaremetalChassisResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      PowerOnBaremetalChassisAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/chassis/${params.chassisUuid}/actions`,
      {
        powerOnBaremetalChassis: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<PowerOnBaremetalChassisResult>(
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

export interface PowerOnBaremetalChassisActionParam {
  chassisUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface PowerOnBaremetalChassisResult {}
