import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemovePciDeviceSpecFromVmInstanceAction extends ActionAdvance {
  async call(
    params: RemovePciDeviceSpecFromVmInstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemovePciDeviceSpecFromVmInstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemovePciDeviceSpecFromVmInstanceAction.name,
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
      "pciSpecUuid",
      "vmInstanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/pci-device-specs/${params.pciSpecUuid}/vm-instances/${params.vmInstanceUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemovePciDeviceSpecFromVmInstanceResult>(
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

export interface RemovePciDeviceSpecFromVmInstanceActionParam {
  pciSpecUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemovePciDeviceSpecFromVmInstanceResult {}
