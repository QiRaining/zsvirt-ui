import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetPhysicalMachineBlockDevicesAction extends QueryAdvance {
  async call(
    params: GetPhysicalMachineBlockDevicesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetPhysicalMachineBlockDevicesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetPhysicalMachineBlockDevicesAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/host/get-block-devices${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetPhysicalMachineBlockDevicesResult>(
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

export interface GetPhysicalMachineBlockDevicesActionParam {
  username: string;
  password?: string;
  sshPort: number;
  hostName: string;
  excludedTypes?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetPhysicalMachineBlockDevicesResult {
  blockDevices?: any;
}
