import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ReclaimSpaceFromImageStoreAction extends ActionAdvance {
  async call(
    params: ReclaimSpaceFromImageStoreActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ReclaimSpaceFromImageStoreResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ReclaimSpaceFromImageStoreAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/backup-storage/image-store/${params.uuid}/actions`,
      {
        reclaimSpaceFromImageStore: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ReclaimSpaceFromImageStoreResult>(
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

export interface ReclaimSpaceFromImageStoreActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ReclaimSpaceFromImageStoreResult {
  gcResult?: any;
}
