import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VniRangeInventory } from "./types";

@Injectable()
export class UpdateVniRangeAction extends ActionAdvance {
  async call(
    params: UpdateVniRangeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVniRangeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVniRangeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/l2-networks/vxlan-pool/vni-ranges/${params.uuid}`,
      {
        updateVniRange: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVniRangeResult>(
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

export interface UpdateVniRangeActionParam {
  uuid: string;
  name: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVniRangeResult {
  inventory?: VniRangeInventory;
}
