import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { UsbDeviceInventory } from "./types";

@Injectable()
export class UpdateUsbDeviceAction extends ActionAdvance {
  async call(
    params: UpdateUsbDeviceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateUsbDeviceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateUsbDeviceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/usb-device/usb-devices/${params.uuid}/actions`,
      {
        updateUsbDevice: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateUsbDeviceResult>(
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

export interface UpdateUsbDeviceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateUsbDeviceResult {
  inventory?: UsbDeviceInventory;
}
