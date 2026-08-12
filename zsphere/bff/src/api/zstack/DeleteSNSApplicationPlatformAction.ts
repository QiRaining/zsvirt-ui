import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteSNSApplicationPlatformAction extends ActionAdvance {
  async call(
    params: DeleteSNSApplicationPlatformActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteSNSApplicationPlatformResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteSNSApplicationPlatformAction.name,
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
      `/sns/application-platforms/${params.uuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteSNSApplicationPlatformResult>(
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

export interface DeleteSNSApplicationPlatformActionParam {
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

export interface DeleteSNSApplicationPlatformResult {}
