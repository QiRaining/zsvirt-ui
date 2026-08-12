import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ZceXInventory } from "./types";

@Injectable()
export class AddZceXAction extends ActionAdvance {
  async call(
    params: AddZceXActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddZceXResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddZceXAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zce-x-plugin`,
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
    return this.postAction<AddZceXResult>(
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

export interface AddZceXActionParam {
  name: string;
  adminToken?: string;
  managementIp?: string;
  apiPort?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddZceXResult {
  inventory?: ZceXInventory;
}
