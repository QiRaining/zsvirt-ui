import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DetachRoleFromAccountAction extends ActionAdvance {
  async call(
    params: DetachRoleFromAccountActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachRoleFromAccountResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachRoleFromAccountAction.name,
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
      "accountUuid",
      "roleUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/identities/accounts/${params.accountUuid}/roles/${params.roleUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachRoleFromAccountResult>(
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

export interface DetachRoleFromAccountActionParam {
  roleUuid: string;
  accountUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachRoleFromAccountResult {}
