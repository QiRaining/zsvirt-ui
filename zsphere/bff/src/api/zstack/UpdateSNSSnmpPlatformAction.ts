import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSApplicationPlatformInventory } from "./types";

@Injectable()
export class UpdateSNSSnmpPlatformAction extends ActionAdvance {
  async call(
    params: UpdateSNSSnmpPlatformActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSNSApplicationPlatformResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSNSSnmpPlatformAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-platforms/snmp/${params.uuid}`,
      {
        updateSNSSnmpPlatform: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSNSApplicationPlatformResult>(
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

export interface UpdateSNSSnmpPlatformActionParam {
  snmpAddress: string;
  snmpPort: number;
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSNSApplicationPlatformResult {
  inventory?: SNSApplicationPlatformInventory;
}
