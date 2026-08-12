import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { LdapServerInventory } from "./types";

@Injectable()
export class AddLdapServerAction extends ActionAdvance {
  async call(
    params: AddLdapServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddLdapServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddLdapServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/ldap/servers`,
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
    return this.postAction<AddLdapServerResult>(
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

export interface AddLdapServerActionParam {
  name: string;
  description?: string;
  url: string;
  base: string;
  username: string;
  password: string;
  encryption: string;
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

export interface AddLdapServerResult {
  inventory?: LdapServerInventory;
}
