import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PreconfigurationTemplateInventory } from "./types";

@Injectable()
export class ChangePreconfigurationTemplateStateAction extends ActionAdvance {
  async call(
    params: ChangePreconfigurationTemplateStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangePreconfigurationTemplateStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangePreconfigurationTemplateStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal/preconfigurations/${params.uuid}/actions`,
      {
        changePreconfigurationTemplateState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangePreconfigurationTemplateStateResult>(
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

export interface ChangePreconfigurationTemplateStateActionParam {
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

export interface ChangePreconfigurationTemplateStateResult {
  inventory?: PreconfigurationTemplateInventory;
}
