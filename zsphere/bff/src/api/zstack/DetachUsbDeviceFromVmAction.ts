import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { UsbDeviceInventory } from "./types";

@Injectable()
export class DetachUsbDeviceFromVmAction extends ActionAdvance {
  async call(
    params: DetachUsbDeviceFromVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachUsbDeviceFromVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachUsbDeviceFromVmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/usb-device/usb-devices/${params.usbDeviceUuid}/detach`,
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
    return this.postAction<DetachUsbDeviceFromVmResult>(
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

export interface DetachUsbDeviceFromVmActionParam {
  usbDeviceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachUsbDeviceFromVmResult {
  inventory?: UsbDeviceInventory;
}
