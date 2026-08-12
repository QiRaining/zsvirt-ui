import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ImageInventory } from "./types";

@Injectable()
export class ChangeImageStateAction extends ActionAdvance {
  async call(
    params: ChangeImageStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeImageStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeImageStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/images/${params.uuid}/actions`,
      {
        changeImageState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeImageStateResult>(
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

export interface ChangeImageStateActionParam {
  uuid: string;
  stateEvent: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeImageStateResult {
  inventory?: ImageInventory;
}
