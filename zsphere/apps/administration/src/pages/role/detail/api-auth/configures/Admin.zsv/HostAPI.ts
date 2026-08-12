const api = (intl: any) => {
  return {
    AttachPciDeviceToVm: {
      name: 'AttachPciDeviceToVm',
      description: intl.formatMessage({ id: 'apiModel.api.AttachPciDeviceToVm', defaultMessage: 'AttachPciDeviceToVm' }),
      api: 'org.zstack.pciDevice.APIAttachPciDeviceToVmMsg',
    },
    AttachUsbDeviceToVm: {
      name: 'AttachUsbDeviceToVm',
      description: intl.formatMessage({ id: 'apiModel.api.AttachUsbDeviceToVm', defaultMessage: 'AttachUsbDeviceToVm' }),
      api: 'org.zstack.usbDevice.APIAttachUsbDeviceToVmMsg',
    },
    DetachPciDeviceFromVm: {
      name: 'DetachPciDeviceFromVm',
      description: intl.formatMessage({ id: 'apiModel.api.DetachPciDeviceFromVm', defaultMessage: 'DetachPciDeviceFromVm' }),
      api: 'org.zstack.pciDevice.APIDetachPciDeviceFromVmMsg',
    },
    DetachUsbDeviceFromVm: {
      name: 'DetachUsbDeviceFromVm',
      description: intl.formatMessage({ id: 'apiModel.api.DetachUsbDeviceFromVm', defaultMessage: 'DetachUsbDeviceFromVm' }),
      api: 'org.zstack.usbDevice.APIDetachUsbDeviceFromVmMsg',
    },
    GetCandidateInterfaceVlanIds: {
      name: 'GetCandidateInterfaceVlanIds',
      description: intl.formatMessage({ id: 'apiModel.api.GetCandidateInterfaceVlanIds', defaultMessage: 'GetCandidateInterfaceVlanIds' }),
      api: 'org.zstack.header.host.APIGetCandidateInterfaceVlanIdsMsg',
    },
    GetHostIommuState: {
      name: 'GetHostIommuState',
      description: intl.formatMessage({ id: 'apiModel.api.GetHostIommuState', defaultMessage: 'GetHostIommuState' }),
      api: 'org.zstack.pciDevice.APIGetHostIommuStateMsg',
    },
    GetHostIommuStatus: {
      name: 'GetHostIommuStatus',
      description: intl.formatMessage({ id: 'apiModel.api.GetHostIommuStatus', defaultMessage: 'GetHostIommuStatus' }),
      api: 'org.zstack.pciDevice.APIGetHostIommuStatusMsg',
    },
    GetHostNUMATopology: {
      name: 'GetHostNUMATopology',
      description: intl.formatMessage({ id: 'apiModel.api.GetHostNUMATopology', defaultMessage: 'GetHostNUMATopology' }),
      api: 'org.zstack.header.host.APIGetHostNUMATopologyMsg',
    },
    GetHostNetworkFacts: {
      name: 'GetHostNetworkFacts',
      description: intl.formatMessage({ id: 'apiModel.api.GetHostNetworkFacts', defaultMessage: 'GetHostNetworkFacts' }),
      api: 'org.zstack.header.host.APIGetHostNetworkFactsMsg',
    },
    GetInterfaceServiceTypeStatistic: {
      name: 'GetInterfaceServiceTypeStatistic',
      description: intl.formatMessage({ id: 'apiModel.api.GetInterfaceServiceTypeStatistic', defaultMessage: 'GetInterfaceServiceTypeStatistic' }),
      api: 'org.zstack.header.host.APIGetInterfaceServiceTypeStatisticMsg',
    },
    GetPciDeviceCandidatesForAttachingVm: {
      name: 'GetPciDeviceCandidatesForAttachingVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetPciDeviceCandidatesForAttachingVm', defaultMessage: 'GetPciDeviceCandidatesForAttachingVm' }),
      api: 'org.zstack.pciDevice.APIGetPciDeviceCandidatesForAttachingVmMsg',
    },
    GetPciDeviceCandidatesForNewCreateVm: {
      name: 'GetPciDeviceCandidatesForNewCreateVm',
      description: intl.formatMessage({ id: 'apiModel.api.GetPciDeviceCandidatesForNewCreateVm', defaultMessage: 'GetPciDeviceCandidatesForNewCreateVm' }),
      api: 'org.zstack.pciDevice.APIGetPciDeviceCandidatesForNewCreateVmMsg',
    },
    GetVmUsbRedirect: {
      name: 'GetVmUsbRedirect',
      description: intl.formatMessage({ id: 'apiModel.api.GetVmUsbRedirect', defaultMessage: 'GetVmUsbRedirect' }),
      api: 'org.zstack.header.vm.APIGetVmUsbRedirectMsg',
    },
    QueryHost: {
      name: 'QueryHost',
      description: intl.formatMessage({ id: 'apiModel.api.QueryHost', defaultMessage: 'QueryHost' }),
      api: 'org.zstack.header.host.APIQueryHostMsg',
    },
    QueryHostNetworkBonding: {
      name: 'QueryHostNetworkBonding',
      description: intl.formatMessage({ id: 'apiModel.api.QueryHostNetworkBonding', defaultMessage: 'QueryHostNetworkBonding' }),
      api: 'org.zstack.header.host.APIQueryHostNetworkBondingMsg',
    },
    QueryHostNetworkInterface: {
      name: 'QueryHostNetworkInterface',
      description: intl.formatMessage({ id: 'apiModel.api.QueryHostNetworkInterface', defaultMessage: 'QueryHostNetworkInterface' }),
      api: 'org.zstack.header.host.APIQueryHostNetworkInterfaceMsg',
    },
    QueryPciDevice: {
      name: 'QueryPciDevice',
      description: intl.formatMessage({ id: 'apiModel.api.QueryPciDevice', defaultMessage: 'QueryPciDevice' }),
      api: 'org.zstack.pciDevice.APIQueryPciDeviceMsg',
    },
    QueryPciDeviceOffering: {
      name: 'QueryPciDeviceOffering',
      description: intl.formatMessage({ id: 'apiModel.api.QueryPciDeviceOffering', defaultMessage: 'QueryPciDeviceOffering' }),
      api: 'org.zstack.pciDevice.APIQueryPciDeviceOfferingMsg',
    },
    QueryPciDevicePciDeviceOffering: {
      name: 'QueryPciDevicePciDeviceOffering',
      description: intl.formatMessage({ id: 'apiModel.api.QueryPciDevicePciDeviceOffering', defaultMessage: 'QueryPciDevicePciDeviceOffering' }),
      api: 'org.zstack.pciDevice.APIQueryPciDevicePciDeviceOfferingMsg',
    },
    QueryUsbDevice: {
      name: 'QueryUsbDevice',
      description: intl.formatMessage({ id: 'apiModel.api.QueryUsbDevice', defaultMessage: 'QueryUsbDevice' }),
      api: 'org.zstack.usbDevice.APIQueryUsbDeviceMsg',
    },
    SetVmUsbRedirect: {
      name: 'SetVmUsbRedirect',
      description: intl.formatMessage({ id: 'apiModel.api.SetVmUsbRedirect', defaultMessage: 'SetVmUsbRedirect' }),
      api: 'org.zstack.header.vm.APISetVmUsbRedirectMsg',
    },
    UpdateHostIommuState: {
      name: 'UpdateHostIommuState',
      description: intl.formatMessage({ id: 'apiModel.api.UpdateHostIommuState', defaultMessage: 'UpdateHostIommuState' }),
      api: 'org.zstack.pciDevice.APIUpdateHostIommuStateMsg',
    },
  }
}

export default api
