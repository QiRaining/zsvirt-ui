import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BareMetal2InstanceInventory } from "./types";

@Injectable()
export class UpdateBareMetal2InstanceAction extends ActionAdvance {
  async call(
    params: UpdateBareMetal2InstanceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateBareMetal2InstanceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateBareMetal2InstanceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/baremetal2/bm-instances/${params.uuid}/action`,
      {
        updateBareMetal2Instance: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateBareMetal2InstanceResult>(
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

export interface UpdateBareMetal2InstanceActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  chassisOfferingUuid?: string;
  defaultL3NetworkUuid?: string;
  autoReleaseChassisEvent?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateBareMetal2InstanceResult {
  inventory?: BareMetal2InstanceInventory;
}
