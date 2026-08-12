import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AttachRoleToAccountGroupAction extends ActionAdvance {
  async call(
    params: AttachRoleToAccountGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachRoleToAccountGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachRoleToAccountGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/account-groups/${params.groupUuid}/roles`,
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
    return this.postAction<AttachRoleToAccountGroupResult>(
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

export interface AttachRoleToAccountGroupActionParam {
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

export interface AttachRoleToAccountGroupResult {}
