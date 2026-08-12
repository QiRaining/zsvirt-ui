import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MonitorTemplateInventory } from "./types";

@Injectable()
export class CloneMonitorTemplateAction extends ActionAdvance {
  async call(
    params: CloneMonitorTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CloneMonitorTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CloneMonitorTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/monitortemplates/${params.uuid}/actions`,
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
    return this.postAction<CloneMonitorTemplateResult>(
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

export interface CloneMonitorTemplateActionParam {
  uuid: string;
  name: string;
  description?: string;
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

export interface CloneMonitorTemplateResult {
  inventory?: MonitorTemplateInventory;
}
