const api = (intl: any) => {
  return {
    AddDnsToL3Network: {
      name: 'AddDnsToL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.AddDnsToL3Network', defaultMessage: 'AddDnsToL3Network' }),
      api: 'org.zstack.header.network.l3.APIAddDnsToL3NetworkMsg',
    },
    AddHostRouteToL3Network: {
      name: 'AddHostRouteToL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.AddHostRouteToL3Network', defaultMessage: 'AddHostRouteToL3Network' }),
      api: 'org.zstack.header.network.l3.APIAddHostRouteToL3NetworkMsg',
    },
    AddIpRange: {
      name: 'AddIpRange',
      description: intl.formatMessage({ id: 'apiModel.api.AddIpRange', defaultMessage: 'AddIpRange' }),
      api: 'org.zstack.header.network.l3.APIAddIpRangeMsg',
    },
    AddIpRangeByNetworkCidr: {
      name: 'AddIpRangeByNetworkCidr',
      description: intl.formatMessage({ id: 'apiModel.api.AddIpRangeByNetworkCidr', defaultMessage: 'AddIpRangeByNetworkCidr' }),
      api: 'org.zstack.header.network.l3.APIAddIpRangeByNetworkCidrMsg',
    },
    AddIpv6Range: {
      name: 'AddIpv6Range',
      description: intl.formatMessage({ id: 'apiModel.api.AddIpv6Range', defaultMessage: 'AddIpv6Range' }),
      api: 'org.zstack.header.network.l3.APIAddIpv6RangeMsg',
    },
    AddIpv6RangeByNetworkCidr: {
      name: 'AddIpv6RangeByNetworkCidr',
      description: intl.formatMessage({ id: 'apiModel.api.AddIpv6RangeByNetworkCidr', defaultMessage: 'AddIpv6RangeByNetworkCidr' }),
      api: 'org.zstack.header.network.l3.APIAddIpv6RangeByNetworkCidrMsg',
    },
    AttachNetworkServiceToL3Network: {
      name: 'AttachNetworkServiceToL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.AttachNetworkServiceToL3Network', defaultMessage: 'AttachNetworkServiceToL3Network' }),
      api: 'org.zstack.header.network.service.APIAttachNetworkServiceToL3NetworkMsg',
    },
    ChangeL3NetworkState: {
      name: 'ChangeL3NetworkState',
      description: intl.formatMessage({ id: 'apiModel.api.ChangeL3NetworkState', defaultMessage: 'ChangeL3NetworkState' }),
      api: 'org.zstack.header.network.l3.APIChangeL3NetworkStateMsg',
    },
    CheckIpAvailability: {
      name: 'CheckIpAvailability',
      description: intl.formatMessage({ id: 'apiModel.api.CheckIpAvailability', defaultMessage: 'CheckIpAvailability' }),
      api: 'org.zstack.header.network.l3.APICheckIpAvailabilityMsg',
    },
    CreateHostKernelInterface: {
      name: 'CreateHostKernelInterface',
      description: intl.formatMessage({ id: 'apiModel.api.CreateHostKernelInterface', defaultMessage: 'CreateHostKernelInterface' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APICreateHostKernelInterfaceMsg',
    },
    CreateL2VirtualSwitch: {
      name: 'CreateL2VirtualSwitch',
      description: intl.formatMessage({ id: 'apiModel.api.CreateL2VirtualSwitch', defaultMessage: 'CreateL2VirtualSwitch' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APICreateL2VirtualSwitchMsg',
    },
    CreateL3Network: {
      name: 'CreateL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.CreateL3Network', defaultMessage: 'CreateL3Network' }),
      api: 'org.zstack.header.network.l3.APICreateL3NetworkMsg',
    },
    CreatePortGroup: {
      name: 'CreatePortGroup',
      description: intl.formatMessage({ id: 'apiModel.api.CreatePortGroup', defaultMessage: 'CreatePortGroup' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APICreatePortGroupMsg',
    },
    DeleteHostKernelInterface: {
      name: 'DeleteHostKernelInterface',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteHostKernelInterface', defaultMessage: 'DeleteHostKernelInterface' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIDeleteHostKernelInterfaceMsg',
    },
    DeleteIpRange: {
      name: 'DeleteIpRange',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteIpRange', defaultMessage: 'DeleteIpRange' }),
      api: 'org.zstack.header.network.l3.APIDeleteIpRangeMsg',
    },
    DeleteL2Network: {
      name: 'DeleteL2Network',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteL2Network', defaultMessage: 'DeleteL2Network' }),
      api: 'org.zstack.header.network.l2.APIDeleteL2NetworkMsg',
    },
    DeleteL3Network: {
      name: 'DeleteL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.DeleteL3Network', defaultMessage: 'DeleteL3Network' }),
      api: 'org.zstack.header.network.l3.APIDeleteL3NetworkMsg',
    },
    DeletePortGroup: {
      name: 'DeletePortGroup',
      description: intl.formatMessage({ id: 'apiModel.api.DeletePortGroup', defaultMessage: 'DeletePortGroup' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIDeletePortGroupMsg',
    },
    GetFreeIp: {
      name: 'GetFreeIp',
      description: intl.formatMessage({ id: 'apiModel.api.GetFreeIp', defaultMessage: 'GetFreeIp' }),
      api: 'org.zstack.header.network.l3.APIGetFreeIpMsg',
    },
    GetIpAddressCapacity: {
      name: 'GetIpAddressCapacity',
      description: intl.formatMessage({ id: 'apiModel.api.GetIpAddressCapacity', defaultMessage: 'GetIpAddressCapacity' }),
      api: 'org.zstack.header.network.l3.APIGetIpAddressCapacityMsg',
    },
    GetL2NetworkTypes: {
      name: 'GetL2NetworkTypes',
      description: intl.formatMessage({ id: 'apiModel.api.GetL2NetworkTypes', defaultMessage: 'GetL2NetworkTypes' }),
      api: 'org.zstack.header.network.l2.APIGetL2NetworkTypesMsg',
    },
    GetL3NetworkDhcpIpAddress: {
      name: 'GetL3NetworkDhcpIpAddress',
      description: intl.formatMessage({ id: 'apiModel.api.GetL3NetworkDhcpIpAddress', defaultMessage: 'GetL3NetworkDhcpIpAddress' }),
      api: 'org.zstack.network.service.flat.APIGetL3NetworkDhcpIpAddressMsg',
    },
    GetL3NetworkIpStatistic: {
      name: 'GetL3NetworkIpStatistic',
      description: intl.formatMessage({ id: 'apiModel.api.GetL3NetworkIpStatistic', defaultMessage: 'GetL3NetworkIpStatistic' }),
      api: 'org.zstack.network.service.flat.APIGetL3NetworkIpStatisticMsg',
    },
    GetL3NetworkMtu: {
      name: 'GetL3NetworkMtu',
      description: intl.formatMessage({ id: 'apiModel.api.GetL3NetworkMtu', defaultMessage: 'GetL3NetworkMtu' }),
      api: 'org.zstack.header.network.l3.APIGetL3NetworkMtuMsg',
    },
    GetL3NetworkTypes: {
      name: 'GetL3NetworkTypes',
      description: intl.formatMessage({ id: 'apiModel.api.GetL3NetworkTypes', defaultMessage: 'GetL3NetworkTypes' }),
      api: 'org.zstack.header.network.l3.APIGetL3NetworkTypesMsg',
    },
    GetVSwitchTypes: {
      name: 'GetVSwitchTypes',
      description: intl.formatMessage({ id: 'apiModel.api.GetVSwitchTypes', defaultMessage: 'GetVSwitchTypes' }),
      api: 'org.zstack.header.network.l2.APIGetVSwitchTypesMsg',
    },
    QueryAddressPool: {
      name: 'QueryAddressPool',
      description: intl.formatMessage({ id: 'apiModel.api.QueryAddressPool', defaultMessage: 'QueryAddressPool' }),
      api: 'org.zstack.header.network.l3.APIQueryAddressPoolMsg',
    },
    QueryHostKernelInterface: {
      name: 'QueryHostKernelInterface',
      description: intl.formatMessage({ id: 'apiModel.api.QueryHostKernelInterface', defaultMessage: 'QueryHostKernelInterface' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIQueryHostKernelInterfaceMsg',
    },
    QueryIpAddress: {
      name: 'QueryIpAddress',
      description: intl.formatMessage({ id: 'apiModel.api.QueryIpAddress', defaultMessage: 'QueryIpAddress' }),
      api: 'org.zstack.header.network.l3.APIQueryIpAddressMsg',
    },
    QueryIpRange: {
      name: 'QueryIpRange',
      description: intl.formatMessage({ id: 'apiModel.api.QueryIpRange', defaultMessage: 'QueryIpRange' }),
      api: 'org.zstack.header.network.l3.APIQueryIpRangeMsg',
    },
    QueryL2Network: {
      name: 'QueryL2Network',
      description: intl.formatMessage({ id: 'apiModel.api.QueryL2Network', defaultMessage: 'QueryL2Network' }),
      api: 'org.zstack.header.network.l2.APIQueryL2NetworkMsg',
    },
    QueryL2PortGroupNetwork: {
      name: 'QueryL2PortGroupNetwork',
      description: intl.formatMessage({ id: 'apiModel.api.QueryL2PortGroupNetwork', defaultMessage: 'QueryL2PortGroupNetwork' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIQueryL2PortGroupNetworkMsg',
    },
    QueryL2VirtualSwitchNetwork: {
      name: 'QueryL2VirtualSwitchNetwork',
      description: intl.formatMessage({ id: 'apiModel.api.QueryL2VirtualSwitchNetwork', defaultMessage: 'QueryL2VirtualSwitchNetwork' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIQueryL2VirtualSwitchNetworkMsg',
    },
    QueryL2VlanNetwork: {
      name: 'QueryL2VlanNetwork',
      description: intl.formatMessage({ id: 'apiModel.api.QueryL2VlanNetwork', defaultMessage: 'QueryL2VlanNetwork' }),
      api: 'org.zstack.header.network.l2.APIQueryL2VlanNetworkMsg',
    },
    QueryNetworkServiceProvider: {
      name: 'QueryNetworkServiceProvider',
      description: intl.formatMessage({ id: 'apiModel.api.QueryNetworkServiceProvider', defaultMessage: 'QueryNetworkServiceProvider' }),
      api: 'org.zstack.header.network.service.APIQueryNetworkServiceProviderMsg',
    },
    QueryPortGroup: {
      name: 'QueryPortGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryPortGroup', defaultMessage: 'QueryPortGroup' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIQueryPortGroupMsg',
    },
    QueryUplinkGroup: {
      name: 'QueryUplinkGroup',
      description: intl.formatMessage({ id: 'apiModel.api.QueryUplinkGroup', defaultMessage: 'QueryUplinkGroup' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIQueryUplinkGroupMsg',
    },
    RemoveDnsFromL3Network: {
      name: 'RemoveDnsFromL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveDnsFromL3Network', defaultMessage: 'RemoveDnsFromL3Network' }),
      api: 'org.zstack.header.network.l3.APIRemoveDnsFromL3NetworkMsg',
    },
    RemoveHostRouteFromL3Network: {
      name: 'RemoveHostRouteFromL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.RemoveHostRouteFromL3Network', defaultMessage: 'RemoveHostRouteFromL3Network' }),
      api: 'org.zstack.header.network.l3.APIRemoveHostRouteFromL3NetworkMsg',
    },
    SetL3NetworkMtu: {
      name: 'SetL3NetworkMtu',
      description: intl.formatMessage({ id: 'apiModel.api.SetL3NetworkMtu', defaultMessage: 'SetL3NetworkMtu' }),
      api: 'org.zstack.header.network.l3.APISetL3NetworkMtuMsg',
    },
    SetL3NetworkRouterInterfaceIp: {
      name: 'SetL3NetworkRouterInterfaceIp',
      description: intl.formatMessage({ id: 'apiModel.api.SetL3NetworkRouterInterfaceIp', defaultMessage: 'SetL3NetworkRouterInterfaceIp' }),
      api: 'org.zstack.header.network.l3.APISetL3NetworkRouterInterfaceIpMsg',
    },
    UpdateHostKernelInterface: {
      name: 'UpdateHostKernelInterface',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateHostKernelInterface', defaultMessage: 'UpdateHostKernelInterface' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIUpdateHostKernelInterfaceMsg',
    },
    UpdateIpRange: {
      name: 'UpdateIpRange',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateIpRange', defaultMessage: 'UpdateIpRange' }),
      api: 'org.zstack.header.network.l3.APIUpdateIpRangeMsg',
    },
    UpdateL2Network: {
      name: 'UpdateL2Network',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateL2Network', defaultMessage: 'UpdateL2Network' }),
      api: 'org.zstack.header.network.l2.APIUpdateL2NetworkMsg',
    },
    UpdateL3Network: {
      name: 'UpdateL3Network',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateL3Network', defaultMessage: 'UpdateL3Network' }),
      api: 'org.zstack.header.network.l3.APIUpdateL3NetworkMsg',
    },
    UpdatePortGroup: {
      name: 'UpdatePortGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UpdatePortGroup', defaultMessage: 'UpdatePortGroup' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIUpdatePortGroupMsg',
    },
    UpdateVirtualSwitchUplinkBondings: {
      name: 'UpdateVirtualSwitchUplinkBondings',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVirtualSwitchUplinkBondings', defaultMessage: 'UpdateVirtualSwitchUplinkBondings' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIUpdateVirtualSwitchUplinkBondingsMsg',
    },
    UpdateVirtualSwitchUplinkGroup: {
      name: 'UpdateVirtualSwitchUplinkGroup',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateVirtualSwitchUplinkGroup', defaultMessage: 'UpdateVirtualSwitchUplinkGroup' }),
      api: 'org.zstack.network.l2.virtualSwitch.header.APIUpdateVirtualSwitchUplinkGroupMsg',
    },
  }
}

export default api
