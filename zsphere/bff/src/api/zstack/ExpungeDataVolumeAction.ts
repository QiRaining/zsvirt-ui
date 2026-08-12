import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ExpungeDataVolumeAction extends ActionAdvance {
  async call(
    params: ExpungeDataVolumeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ExpungeDataVolumeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ExpungeDataVolumeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volumes/${params.uuid}/actions`,
      {
        expungeDataVolume: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ExpungeDataVolumeResult>(
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

export interface ExpungeDataVolumeActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ExpungeDataVolumeResult {}
