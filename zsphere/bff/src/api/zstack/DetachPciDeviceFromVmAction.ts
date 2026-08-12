import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PciDeviceInventory } from "./types";

@Injectable()
export class DetachPciDeviceFromVmAction extends ActionAdvance {
  async call(
    params: DetachPciDeviceFromVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachPciDeviceFromVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachPciDeviceFromVmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/pci-device/pci-devices/${params.pciDeviceUuid}/detach`,
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
    return this.postAction<DetachPciDeviceFromVmResult>(
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

export interface DetachPciDeviceFromVmActionParam {
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

export interface DetachPciDeviceFromVmResult {
  inventory?: PciDeviceInventory;
}
