import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostInventory } from "./types";

@Injectable()
export class UpdateHostnameAction extends ActionAdvance {
  async call(
    params: UpdateHostnameActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHostnameResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHostnameAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/hostname/${params.uuid}/actions`,
      {
        updateHostname: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateHostnameResult>(
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

export interface UpdateHostnameActionParam {
  uuid: string;
  hostname: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
  timeout?: number;
}

export interface UpdateHostnameResult {
  inventory?: HostInventory;
}
