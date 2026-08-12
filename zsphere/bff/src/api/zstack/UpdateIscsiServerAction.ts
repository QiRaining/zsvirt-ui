import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { IscsiServerInventory } from "./types";

@Injectable()
export class UpdateIscsiServerAction extends ActionAdvance {
  async call(
    params: UpdateIscsiServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateIscsiServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateIscsiServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/storage-devices/iscsi/servers/${params.uuid}/actions`,
      {
        updateIscsiServer: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateIscsiServerResult>(
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

export interface UpdateIscsiServerActionParam {
  uuid: string;
  name?: string;
  chapUserName?: string;
  chapUserPassword?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateIscsiServerResult {
  inventory?: IscsiServerInventory;
}
