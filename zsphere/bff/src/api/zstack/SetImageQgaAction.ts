import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SetImageQgaAction extends ActionAdvance {
  async call(
    params: SetImageQgaActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SetImageQgaResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SetImageQgaAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/images/${params.uuid}/actions`,
      {
        setImageQga: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SetImageQgaResult>(
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

export interface SetImageQgaActionParam {
  uuid: string;
  enable: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SetImageQgaResult {}
