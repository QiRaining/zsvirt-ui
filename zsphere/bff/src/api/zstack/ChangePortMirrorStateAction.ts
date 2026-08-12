import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PortMirrorInventory } from "./types";

@Injectable()
export class ChangePortMirrorStateAction extends ActionAdvance {
  async call(
    params: ChangePortMirrorStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangePortMirrorStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangePortMirrorStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/port-mirrors/${params.uuid}/actions`,
      {
        changePortMirrorState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangePortMirrorStateResult>(
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

export interface ChangePortMirrorStateActionParam {
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

export interface ChangePortMirrorStateResult {
  inventory?: PortMirrorInventory;
}
