import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmInstanceInventory } from "./types";

@Injectable()
export class ChangeVmImageAction extends ActionAdvance {
  async call(
    params: ChangeVmImageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeVmImageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeVmImageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-instances/${params.vmInstanceUuid}/actions`,
      {
        changeVmImage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeVmImageResult>(
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

export interface ChangeVmImageActionParam {
  vmInstanceUuid: string;
  imageUuid: string;
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

export interface ChangeVmImageResult {
  inventory?: VmInstanceInventory;
}
