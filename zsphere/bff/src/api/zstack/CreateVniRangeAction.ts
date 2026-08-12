import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VniRangeInventory } from "./types";

@Injectable()
export class CreateVniRangeAction extends ActionAdvance {
  async call(
    params: CreateVniRangeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVniRangeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVniRangeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l2-networks/vxlan-pool/${params.l2NetworkUuid}/vni-ranges`,
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
    return this.postAction<CreateVniRangeResult>(
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

export interface CreateVniRangeActionParam {
  name: string;
  description?: string;
  startVni: number;
  endVni: number;
  l2NetworkUuid: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateVniRangeResult {
  inventory?: VniRangeInventory;
}
