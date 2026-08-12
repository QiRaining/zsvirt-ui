import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RevokeMonitorTemplateFromMonitorGroupAction extends ActionAdvance {
  async call(
    params: RevokeMonitorTemplateFromMonitorGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RevokeMonitorTemplateFromMonitorGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RevokeMonitorTemplateFromMonitorGroupAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "templateUuid",
      "groupUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/zwatch/monitortemplates/${params.templateUuid}/monitorgroups/${params.groupUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RevokeMonitorTemplateFromMonitorGroupResult>(
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

export interface RevokeMonitorTemplateFromMonitorGroupActionParam {
  groupUuid: string;
  templateUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RevokeMonitorTemplateFromMonitorGroupResult {}
