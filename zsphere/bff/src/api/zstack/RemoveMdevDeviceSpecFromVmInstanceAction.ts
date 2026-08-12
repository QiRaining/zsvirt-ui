import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemoveMdevDeviceSpecFromVmInstanceAction extends ActionAdvance {
  async call(
    params: RemoveMdevDeviceSpecFromVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveMdevDeviceSpecFromVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveMdevDeviceSpecFromVmInstanceAction.name,
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
      "mdevSpecUuid",
      "vmInstanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/mdev-device-specs/${params.mdevSpecUuid}/vm-instances/${params.vmInstanceUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveMdevDeviceSpecFromVmInstanceResult>(
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

export interface RemoveMdevDeviceSpecFromVmInstanceActionParam {
  mdevSpecUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveMdevDeviceSpecFromVmInstanceResult {}
