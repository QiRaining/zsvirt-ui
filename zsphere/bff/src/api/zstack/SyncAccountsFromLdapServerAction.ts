import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SyncAccountsFromLdapServerAction extends ActionAdvance {
  async call(
    params: SyncAccountsFromLdapServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SyncAccountsFromLdapServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SyncAccountsFromLdapServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/ldap/servers/${params.uuid}/actions`,
      {
        syncAccountsFromLdapServer: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SyncAccountsFromLdapServerResult>(
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

export interface SyncAccountsFromLdapServerActionParam {
  uuid: string;
  createAccountStrategy?: string;
  deleteAccountStrategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SyncAccountsFromLdapServerResult {
  result?: any;
}
