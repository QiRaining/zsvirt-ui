import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UngenerateMdevDevicesAction extends ActionAdvance {
  async call(
    params: UngenerateMdevDevicesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UngenerateVirtualPciDevicesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UngenerateMdevDevicesAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/pci-devices/${params.pciDeviceUuid}/actions`,
      {
        ungenerateMdevDevices: params,
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

export interface UngenerateMdevDevicesActionParam {
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
