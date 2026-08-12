import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetImageBootModeAction extends ActionAdvance {
  async call(
    params: SetImageBootModeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetImageBootModeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetImageBootModeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/images/${params.uuid}/actions`,
      {
        setImageBootMode: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SetImageBootModeResult>(
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

export interface SetImageBootModeActionParam {
  uuid: string;
  bootMode: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetImageBootModeResult {}
