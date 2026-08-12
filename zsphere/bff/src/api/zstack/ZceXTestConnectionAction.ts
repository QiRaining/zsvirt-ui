import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ZceXTestConnectionAction extends ActionAdvance {
  async call(
    params: ZceXTestConnectionActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ZceXTestConnectionResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ZceXTestConnectionAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zce-x-plugin/test-connection`,
      {
        zceXTestConnection: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ZceXTestConnectionResult>(
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

export interface ZceXTestConnectionActionParam {
  managementIp?: string;
  port?: number;
  uuid?: string;
  url?: string;
  adminToken?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ZceXTestConnectionResult {}
