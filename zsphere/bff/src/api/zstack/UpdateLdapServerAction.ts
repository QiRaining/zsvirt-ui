import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { LdapServerInventory } from "./types";

@Injectable()
export class UpdateLdapServerAction extends ActionAdvance {
  async call(
    params: UpdateLdapServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateLdapServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateLdapServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/ldap/servers/${params.ldapServerUuid}`,
      {
        updateLdapServer: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateLdapServerResult>(
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

export interface UpdateLdapServerActionParam {
  ldapServerUuid: string;
  name?: string;
  description?: string;
  url?: string;
  base?: string;
  username?: string;
  password?: string;
  encryption?: string;
  serverType?: string;
  usernameProperty?: string;
  filter?: string;
  syncCreatedAccountStrategy?: string;
  syncDeletedAccountStrategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateLdapServerResult {
  inventory?: LdapServerInventory;
}
