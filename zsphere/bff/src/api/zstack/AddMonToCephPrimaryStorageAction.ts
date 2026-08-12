import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CephPrimaryStorageInventory } from "./types";

@Injectable()
export class AddMonToCephPrimaryStorageAction extends ActionAdvance {
  async call(
    params: AddMonToCephPrimaryStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddMonToCephPrimaryStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddMonToCephPrimaryStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/primary-storage/ceph/${params.uuid}/mons`,
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
    return this.postAction<AddMonToCephPrimaryStorageResult>(
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

export interface AddMonToCephPrimaryStorageActionParam {
  uuid: string;
  monUrls: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddMonToCephPrimaryStorageResult {
  inventory?: CephPrimaryStorageInventory;
}
