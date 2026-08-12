import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GenerateSriovPciDevicesAction extends ActionAdvance {
  async call(
    params: GenerateSriovPciDevicesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GenerateVirtualPciDevicesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GenerateSriovPciDevicesAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/pci-devices/${params.pciDeviceUuid}/actions`,
      {
        generateSriovPciDevices: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GenerateVirtualPciDevicesResult>(
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

export interface GenerateSriovPciDevicesActionParam {
  pciDeviceUuid: string;
  virtPartNum: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GenerateVirtualPciDevicesResult {}
