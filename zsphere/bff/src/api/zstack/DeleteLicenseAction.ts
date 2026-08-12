import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteLicenseAction extends ActionAdvance {
  async call(
    params: DeleteLicenseActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteLicenseResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteLicenseAction.name,
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
      "managementNodeUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/licenses/mn/${params.managementNodeUuid}/actions${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteLicenseResult>(
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

export interface DeleteLicenseActionParam {
  uuid?: string;
  module?: string;
  managementNodeUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteLicenseResult {}
