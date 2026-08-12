import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { IscsiServerInventory } from "./types";

@Injectable()
export class RefreshIscsiServerAction extends ActionAdvance {
  async call(
    params: RefreshIscsiServerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RefreshIscsiServerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RefreshIscsiServerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/storage-devices/iscsi/servers/${params.uuid}`,
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
    return this.postAction<RefreshIscsiServerResult>(
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

export interface RefreshIscsiServerActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RefreshIscsiServerResult {
  inventory?: IscsiServerInventory;
}
