import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteVmStaticIpAction extends ActionAdvance {
  async call(
    params: DeleteVmStaticIpActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteVmStaticIpResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteVmStaticIpAction.name,
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
      "vmInstanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/vm-instances/${params.vmInstanceUuid}/static-ips${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteVmStaticIpResult>(
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

export interface DeleteVmStaticIpActionParam {
  vmInstanceUuid: string;
  l3NetworkUuid: string;
  staticIp?: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteVmStaticIpResult {}
