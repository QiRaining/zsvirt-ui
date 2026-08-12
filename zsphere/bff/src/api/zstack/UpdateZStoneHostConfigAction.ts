import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateZStoneHostConfigAction extends ActionAdvance {
  async call(
    params: UpdateZStoneHostConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateZStoneHostConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateZStoneHostConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zstone-plugin/config/host`,
      {
        updateZStoneHostConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateZStoneHostConfigResult>(
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

export interface UpdateZStoneHostConfigActionParam {
  uuid: string;
  hostPort?: number;
  hosts: any[];
  deployChrony?: boolean;
  copySshKey?: boolean;
  installWatch?: boolean;
  updateHostname?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateZStoneHostConfigResult {}
