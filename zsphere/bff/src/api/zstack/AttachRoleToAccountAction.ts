import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AttachRoleToAccountAction extends ActionAdvance {
  async call(
    params: AttachRoleToAccountActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachRoleToAccountResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachRoleToAccountAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/identities/accounts/${params.accountUuid}/roles/${params.roleUuid}`,
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
    return this.postAction<AttachRoleToAccountResult>(
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

export interface AttachRoleToAccountActionParam {
  roleUuid: string;
  accountUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachRoleToAccountResult {}
