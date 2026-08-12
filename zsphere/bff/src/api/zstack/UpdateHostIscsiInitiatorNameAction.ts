import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { KVMHostInventory } from "./types";

@Injectable()
export class UpdateHostIscsiInitiatorNameAction extends ActionAdvance {
  async call(
    params: UpdateHostIscsiInitiatorNameActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHostIscsiInitiatorNameResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHostIscsiInitiatorNameAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hosts/kvm/iscsiInitiatorName/${params.uuid}/actions`,
      {
        updateHostIscsiInitiatorName: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateHostIscsiInitiatorNameResult>(
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

export interface UpdateHostIscsiInitiatorNameActionParam {
  uuid: string;
  iscsiInitiatorName: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateHostIscsiInitiatorNameResult {
  inventory?: KVMHostInventory;
}
