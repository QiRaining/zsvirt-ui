import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DetachRoleFromAccountGroupAction extends ActionAdvance {
  async call(
    params: DetachRoleFromAccountGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachRoleFromAccountGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachRoleFromAccountGroupAction.name,
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
      "groupUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/account-groups/${params.groupUuid}/roles${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachRoleFromAccountGroupResult>(
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

export interface DetachRoleFromAccountGroupActionParam {
  groupUuid: string;
  roleUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachRoleFromAccountGroupResult {}
