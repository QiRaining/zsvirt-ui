import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import * as _ from 'lodash'

import { UIExtendedLicenseType } from '@/common/enum'

import { GetLicenseAddonService } from './get-license-addon/get-license-addon.service'
import { GetLicenseInfoService } from './get-license-info/get-license-info.service'
import { GetUSBKeyStatusService } from './get-usbkey-status/get-usbkey-status.service'
import {
  LicenseAddOn,
  LicenseInfo,
  LicenseInfoExtensionResp,
  LicenseInfoResp,
  LicenseRecordsQueryResp,
  LicenseUSBKeyStatus,
  ModuleAuthorizationDetailsQueryResp,
  PointsDetailsQueryResp,
  ProdInfo,
  QueryLicenseRecordArgs,
  QueryModuleAuthorizationDetailsArgs,
  QueryPointsDetailsArgs,
  VersionType
} from './license.model'
import { LicenseService } from './license.service'

@Resolver(() => LicenseInfo)
export class LicenseResolver {
  @Inject() getLicenseInfoService: GetLicenseInfoService
  @Inject() getLicenseAddonService: GetLicenseAddonService
  @Inject() getUSBKeyStatusService: GetUSBKeyStatusService
  @Inject() licenseService: LicenseService

  @Query(() => LicenseInfo)
  async getLicenseInfo() {
    return this.licenseService.getLicenseInfo()
  }

  // 读取自定义license名称的json文件
  @Query(() => String)
  async getCustomizedLicenseNameInfo() {
    return this.getLicenseInfoService.getCustomizedLicenseNameInfo()
  }

  @Query(() => [LicenseAddOn])
  async getLicenseAddOns() {
    return this.getLicenseAddonService.getLicenseAddOns()
  }

  @Query(() => VersionType)
  async getVersion() {
    return this.licenseService.getVersion()
  }

  @Query(() => [LicenseUSBKeyStatus])
  async getUSBKeyStatus() {
    return this.getUSBKeyStatusService.getUSBKeyStatus()
  }

  @ResolveField()
  async licenseType(@Parent() licenseInfo: LicenseInfo) {
    if (_.isEqual(licenseInfo.licenseType, UIExtendedLicenseType.Paid)) {
      switch (licenseInfo.prodInfo) {
        case ProdInfo.Basic:
          return UIExtendedLicenseType.Basic
        case ProdInfo.Standard:
          return UIExtendedLicenseType.Standard
        default:
          return UIExtendedLicenseType.Paid
      }
    }

    return licenseInfo.licenseType
  }

  /**
   * 获取about页面 license信息
   */
  @Query(() => LicenseInfoResp)
  async getAboutLicenseInfo() {
    return this.licenseService.getAboutLicenseInfo()
  }

  @Query(() => LicenseInfoExtensionResp)
  async getAboutLicenseExtensionInfo() {
    return this.licenseService.getAboutLicenseExtensionInfo()
  }

  @Query(() => LicenseRecordsQueryResp)
  async licenseRecordsList(@Args() args: QueryLicenseRecordArgs) {
    delete args.conditions
    return this.licenseService.getLicenseRecordsList(args)
  }

  /**
   *
   * 获取license类型和集群资源不一致的提示
   * (From Xinchuang)
   */
  @Query(() => Boolean)
  async isLicenseTypeEqualToCluster() {
    return this.licenseService.judgeLicenseTypeEqualToCluster()
  }

  //todo
  @Query(() => ModuleAuthorizationDetailsQueryResp)
  async moduleAuthorizationDetailsList(@Args() args: QueryModuleAuthorizationDetailsArgs) {
    return this.licenseService.getModuleAuthorizationDetailsList(args)
  }
  //todo
  @Query(() => PointsDetailsQueryResp)
  async pointsDetailsList(@Args() args: QueryPointsDetailsArgs) {
    return this.licenseService.getPointsDetailsList(args)
  }
}
