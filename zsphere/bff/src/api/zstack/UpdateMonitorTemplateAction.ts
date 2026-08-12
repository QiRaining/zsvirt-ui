import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MonitorTemplateInventory } from "./types";

@Injectable()
export class UpdateMonitorTemplateAction extends ActionAdvance {
  async call(
    params: UpdateMonitorTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateMonitorTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateMonitorTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/monitortemplates/${params.uuid}/actions`,
      {
        updateMonitorTemplate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateMonitorTemplateResult>(
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

export interface UpdateMonitorTemplateActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateMonitorTemplateResult {
  inventory?: MonitorTemplateInventory;
}
