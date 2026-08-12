import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { InstanceOfferingInventory } from "./types";

@Injectable()
export class ChangeInstanceOfferingStateAction extends ActionAdvance {
  async call(
    params: ChangeInstanceOfferingStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeInstanceOfferingStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeInstanceOfferingStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/instance-offerings/${params.uuid}/actions`,
      {
        changeInstanceOfferingState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeInstanceOfferingStateResult>(
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

export interface ChangeInstanceOfferingStateActionParam {
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

export interface ChangeInstanceOfferingStateResult {
  inventory?: InstanceOfferingInventory;
}
