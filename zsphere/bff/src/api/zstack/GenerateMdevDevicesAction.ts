import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GenerateMdevDevicesAction extends ActionAdvance {
  async call(
    params: GenerateMdevDevicesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GenerateVirtualPciDevicesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GenerateMdevDevicesAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/pci-devices/${params.pciDeviceUuid}/actions`,
      {
        generateMdevDevices: params,
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

export interface GenerateMdevDevicesActionParam {
  pciDeviceUuid: string;
  mdevSpecUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GenerateVirtualPciDevicesResult {}
