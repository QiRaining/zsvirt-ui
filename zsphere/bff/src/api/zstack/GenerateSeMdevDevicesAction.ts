import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GenerateSeMdevDevicesAction extends ActionAdvance {
  async call(
    params: GenerateSeMdevDevicesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GenerateSeMdevDevicesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GenerateSeMdevDevicesAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/mtty-devices/${params.mttyDeviceUuid}/actions`,
      {
        generateSeMdevDevices: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GenerateSeMdevDevicesResult>(
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

export interface GenerateSeMdevDevicesActionParam {
  mttyDeviceUuid: string;
  virtPartNum: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GenerateSeMdevDevicesResult {}
