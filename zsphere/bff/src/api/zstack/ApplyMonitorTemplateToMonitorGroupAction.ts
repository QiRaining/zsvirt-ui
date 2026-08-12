import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MonitorGroupTemplateRefInventory } from "./types";

@Injectable()
export class ApplyMonitorTemplateToMonitorGroupAction extends ActionAdvance {
  async call(
    params: ApplyMonitorTemplateToMonitorGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ApplyMonitorTemplateToMonitorGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ApplyMonitorTemplateToMonitorGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/monitortemplates/${params.templateUuid}/monitorgroups/${params.groupUuid}`,
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
    return this.postAction<ApplyMonitorTemplateToMonitorGroupResult>(
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

export interface ApplyMonitorTemplateToMonitorGroupActionParam {
  templateUuid: string;
  groupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ApplyMonitorTemplateToMonitorGroupResult {
  inventory?: MonitorGroupTemplateRefInventory;
}
