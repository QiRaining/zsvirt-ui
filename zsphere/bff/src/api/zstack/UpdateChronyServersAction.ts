import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateChronyServersAction extends ActionAdvance {
  async call(
    params: UpdateChronyServersActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateChronyServersResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateChronyServersAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zops/chrony/actions`,
      {
        updateChronyServers: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateChronyServersResult>(
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

export interface UpdateChronyServersActionParam {
  internalHostnames?: any[];
  externalHostnames?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateChronyServersResult {}
