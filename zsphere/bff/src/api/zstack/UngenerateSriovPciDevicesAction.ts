import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UngenerateSriovPciDevicesAction extends ActionAdvance {
  async call(
    params: UngenerateSriovPciDevicesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UngenerateVirtualPciDevicesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UngenerateSriovPciDevicesAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/pci-devices/${params.pciDeviceUuid}/actions`,
      {
        ungenerateSriovPciDevices: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UngenerateVirtualPciDevicesResult>(
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

export interface UngenerateSriovPciDevicesActionParam {
  pciDeviceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UngenerateVirtualPciDevicesResult {}
