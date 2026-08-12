import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CheckBaremetalChassisConfigFileAction extends ActionAdvance {
  async call(
    params: CheckBaremetalChassisConfigFileActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CheckBaremetalChassisConfigFileResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CheckBaremetalChassisConfigFileAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/baremetal/chassis/from-file/check`,
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
    return this.postAction<CheckBaremetalChassisConfigFileResult>(
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

export interface CheckBaremetalChassisConfigFileActionParam {
  baremetalChassisInfo: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CheckBaremetalChassisConfigFileResult {}
