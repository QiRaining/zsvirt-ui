import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CephPrimaryStorageInventory } from "./types";

@Injectable()
export class RemoveMonFromCephPrimaryStorageAction extends ActionAdvance {
  async call(
    params: RemoveMonFromCephPrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveMonFromCephPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveMonFromCephPrimaryStorageAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/primary-storage/ceph/${params.uuid}/mons${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveMonFromCephPrimaryStorageResult>(
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

export interface RemoveMonFromCephPrimaryStorageActionParam {
  uuid: string;
  monHostnames: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveMonFromCephPrimaryStorageResult {
  inventory?: CephPrimaryStorageInventory;
}
