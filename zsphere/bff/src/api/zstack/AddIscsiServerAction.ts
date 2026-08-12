import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { IscsiServerInventory } from "./types";

@Injectable()
export class AddIscsiServerAction extends ActionAdvance {
  async call(
    params: AddIscsiServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddIscsiServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddIscsiServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/storage-devices/iscsi/servers`,
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
    return this.postAction<AddIscsiServerResult>(
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

export interface AddIscsiServerActionParam {
  name?: string;
  ip: string;
  port?: number;
  chapUserName?: string;
  chapUserPassword?: string;
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

export interface AddIscsiServerResult {
  inventory?: IscsiServerInventory;
}
