import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalChassisInventory } from "./types";

@Injectable()
export class InspectBaremetalChassisAction extends ActionAdvance {
  async call(
    params: InspectBaremetalChassisActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<InspectBaremetalChassisResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      InspectBaremetalChassisAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/chassis/${params.uuid}/actions`,
      {
        inspectBaremetalChassis: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<InspectBaremetalChassisResult>(
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

export interface InspectBaremetalChassisActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface InspectBaremetalChassisResult {
  inventory?: BaremetalChassisInventory;
}
