import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetHostWebSshUrlAction extends ActionAdvance {
  async call(
    params: GetHostWebSshUrlActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetHostWebSshUrlResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetHostWebSshUrlAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hosts/webssh`,
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
    return this.postAction<GetHostWebSshUrlResult>(
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

export interface GetHostWebSshUrlActionParam {
  uuid: string;
  https?: boolean;
  userName: string;
  password: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetHostWebSshUrlResult {
  url?: string;
}
