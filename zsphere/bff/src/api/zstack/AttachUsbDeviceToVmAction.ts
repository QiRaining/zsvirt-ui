import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { UsbDeviceInventory } from "./types";

@Injectable()
export class AttachUsbDeviceToVmAction extends ActionAdvance {
  async call(
    params: AttachUsbDeviceToVmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachUsbDeviceToVmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachUsbDeviceToVmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/usb-device/usb-devices/${params.usbDeviceUuid}/attach`,
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
    return this.postAction<AttachUsbDeviceToVmResult>(
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

export interface AttachUsbDeviceToVmActionParam {
  usbDeviceUuid: string;
  vmInstanceUuid: string;
  attachType?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachUsbDeviceToVmResult {
  inventory?: UsbDeviceInventory;
}
