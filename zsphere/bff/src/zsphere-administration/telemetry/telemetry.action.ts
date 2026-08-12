import { Inject, Injectable } from "@nestjs/common";
import { Args, Mutation } from "@nestjs/graphql";

import {
  TelemetryConsentActionValue,
  UpdateTelemetryConsentAction,
  UpdateTelemetryConsentActionParam,
} from "@/api/zstack/UpdateTelemetryConsentAction";
import { ActionService } from "@/base/action-service";
import { ActionResult } from "@/common/model/action.model";

import {
  TELEMETRY_CONSENT_UUID,
  TelemetryConsentAction,
  UpdateTelemetryConsentInput,
  UpdateTelemetryConsentPayload,
} from "./telemetry.model";
import { TelemetryAccessService } from "./telemetry.service";

@Injectable()
export class TelemetryActionService extends ActionService {
  @Inject()
  telemetryAccessService: TelemetryAccessService;

  @Inject()
  updateTelemetryConsentAction: UpdateTelemetryConsentAction;

  @Mutation(() => ActionResult)
  async updateTelemetryConsent(
    @Args("input") input: UpdateTelemetryConsentInput,
  ): Promise<ActionResult> {
    await this.telemetryAccessService.assertSystemAdmin();

    const actionId = input.action.actionId;
    const actionFn = async (
      payload: UpdateTelemetryConsentPayload,
      taskId: string,
    ) => {
      const params: UpdateTelemetryConsentActionParam =
        payload.action === TelemetryConsentAction.Disabled
          ? {
              action: TelemetryConsentActionValue.Disabled,
            }
          : {
              action: TelemetryConsentActionValue.Enabled,
              agreedToTerms: payload.agreedToTerms,
            };
      const { inventory } = await this.updateTelemetryConsentAction.call(
        params,
        {
          actionId,
          taskId,
        },
      );

      return {
        id: TELEMETRY_CONSENT_UUID,
        fields: "consentGrantedAt",
        inventory: {
          ...inventory,
          uuid: TELEMETRY_CONSENT_UUID,
        },
      };
    };

    this.actionHelper(input, "TelemetryConsentInventory", actionFn);

    return { actionId };
  }
}
