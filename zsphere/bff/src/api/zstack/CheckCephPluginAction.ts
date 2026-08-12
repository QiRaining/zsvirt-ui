import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CheckCephPluginAction extends ActionAdvance {
  async call(
    params: CheckCephPluginActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CheckCephPluginResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CheckCephPluginAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/ceph-plugin/check`,
      {
        checkCephPlugin: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CheckCephPluginResult>(
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

export interface CheckCephPluginActionParam {
  managementNode?: boolean;
  hostUuidList?: any[];
  ipList?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CheckCephPluginResult {
  inventories?: any[];
}
