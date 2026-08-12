import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSApplicationEndpointInventory } from "./types";

@Injectable()
export class ChangeSNSApplicationEndpointStateAction extends ActionAdvance {
  async call(
    params: ChangeSNSApplicationEndpointStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeSNSApplicationEndpointStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeSNSApplicationEndpointStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-endpoints/${params.uuid}/actions`,
      {
        changeSNSApplicationEndpointState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeSNSApplicationEndpointStateResult>(
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

export interface ChangeSNSApplicationEndpointStateActionParam {
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

export interface ChangeSNSApplicationEndpointStateResult {
  inventory?: SNSApplicationEndpointInventory;
}
