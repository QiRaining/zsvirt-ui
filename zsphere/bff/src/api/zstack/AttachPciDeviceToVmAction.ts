import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PciDeviceInventory } from "./types";

@Injectable()
export class AttachPciDeviceToVmAction extends ActionAdvance {
  async call(
    params: AttachPciDeviceToVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachPciDeviceToVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachPciDeviceToVmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/pci-device/pci-devices/${params.pciDeviceUuid}/attach`,
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
    return this.postAction<AttachPciDeviceToVmResult>(
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

export interface AttachPciDeviceToVmActionParam {
  pciDeviceUuid: string;
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachPciDeviceToVmResult {
  inventory?: PciDeviceInventory;
}
