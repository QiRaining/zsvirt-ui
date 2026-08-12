import { Inject } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import {
  TelemetryConsentInventory,
  TelemetrySettingInventory,
  TelemetryUpdateInventory,
} from "./telemetry.model";
import { TelemetryService } from "./telemetry.service";

@Resolver()
export class TelemetryResolver {
  @Inject()
  telemetryService: TelemetryService;

  @Query(() => TelemetryConsentInventory)
  getTelemetryConsent() {
    return this.telemetryService.getTelemetryConsent();
  }

  @Query(() => TelemetrySettingInventory)
  getTelemetrySettings() {
    return this.telemetryService.getTelemetrySettings();
  }

  @Query(() => TelemetryUpdateInventory)
  checkTelemetryUpdate() {
    return this.telemetryService.checkTelemetryUpdate();
  }
}
