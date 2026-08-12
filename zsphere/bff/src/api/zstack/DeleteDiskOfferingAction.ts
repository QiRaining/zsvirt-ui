import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteDiskOfferingAction extends ActionAdvance {
  async call(
    params: DeleteDiskOfferingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteDiskOfferingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteDiskOfferingAction.name,
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
      `/disk-offerings/${params.uuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteDiskOfferingResult>(
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

export interface DeleteDiskOfferingActionParam {
  uuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteDiskOfferingResult {}
