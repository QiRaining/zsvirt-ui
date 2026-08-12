import { Injectable } from "@nestjs/common";

import { HostIommuStateType } from "@/common/enum/zstack";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateHostIommuStateAction extends ActionAdvance {
  async call(
    params: UpdateHostIommuStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHostIommuStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHostIommuStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/pci-device/hosts/${params.uuid}/actions`,
      {
        updateHostIommuState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateHostIommuStateResult>(
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

export interface UpdateHostIommuStateActionParam {
  uuid: string;
  state: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateHostIommuStateResult {
  state?: HostIommuStateType;
}
