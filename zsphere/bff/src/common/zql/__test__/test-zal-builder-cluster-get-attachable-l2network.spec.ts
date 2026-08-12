import ZQL, { ZOp } from '../index'

describe('zql builder 集群获取可用二层网络', () => {
  beforeEach(async () => {})

  it('1. ESX集群获取二层网络', () => {
    const clusterUuid = '29737bfb7186482f83de997661a54558'

    const zql = ZQL.stringify({
      tableName: 'L2Network',
      fields: ['uuid'],
      condition: {
        [ZOp.and]: [
          {
            [ZOp.or]: [
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'L2Network',
                      fields: ['uuid'],
                      condition: {
                        type: 'L2NoVlanNetwork',
                        physicalInterface: {
                          [ZOp.notIn]: {
                            [ZOp.query]: {
                              tableName: 'L2Network',
                              fields: ['physicalInterface'],
                              condition: {
                                type: 'L2NoVlanNetwork',
                                uuid: {
                                  [ZOp.in]: {
                                    [ZOp.query]: {
                                      tableName: 'L2NetworkClusterRef',
                                      fields: ['l2NetworkUuid'],
                                      condition: {
                                        clusterUuid
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'L2Network',
                      fields: ['uuid'],
                      condition: {
                        type: 'L2VlanNetwork',
                        [ZOp.or]: [
                          {
                            uuid: {
                              [ZOp.in]: {
                                [ZOp.query]: {
                                  tableName: 'L2Network',
                                  fields: ['uuid'],
                                  condition: {
                                    type: 'L2VlanNetwork',
                                    [ZOp.and]: {
                                      physicalInterface: {
                                        [ZOp.in]: {
                                          [ZOp.query]: {
                                            tableName: 'L2Network',
                                            fields: ['physicalInterface'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              uuid: {
                                                [ZOp.in]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2NetworkClusterRef',
                                                    fields: ['l2NetworkUuid'],
                                                    condition: {
                                                      clusterUuid
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      uuid: {
                                        [ZOp.in]: {
                                          [ZOp.query]: {
                                            tableName: 'L2VlanNetwork',
                                            fields: ['uuid'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              vlan: {
                                                [ZOp.notIn]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2VlanNetwork',
                                                    fields: ['vlan'],
                                                    condition: {
                                                      type: 'L2VlanNetwork',
                                                      uuid: {
                                                        [ZOp.in]: {
                                                          [ZOp.query]: {
                                                            tableName: 'L2NetworkClusterRef',
                                                            fields: ['l2NetworkUuid'],
                                                            condition: {
                                                              clusterUuid
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          {
                            uuid: {
                              [ZOp.in]: {
                                [ZOp.query]: {
                                  tableName: 'L2Network',
                                  fields: ['uuid'],
                                  condition: {
                                    type: 'L2VlanNetwork',
                                    [ZOp.and]: {
                                      physicalInterface: {
                                        [ZOp.notIn]: {
                                          [ZOp.query]: {
                                            tableName: 'L2Network',
                                            fields: ['physicalInterface'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              uuid: {
                                                [ZOp.in]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2NetworkClusterRef',
                                                    fields: ['l2NetworkUuid'],
                                                    condition: {
                                                      clusterUuid
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      uuid: {
                                        [ZOp.in]: {
                                          [ZOp.query]: {
                                            tableName: 'L2VlanNetwork',
                                            fields: ['uuid'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              vlan: {
                                                [ZOp.notIn]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2VlanNetwork',
                                                    fields: ['vlan'],
                                                    condition: {
                                                      type: 'L2VlanNetwork',
                                                      uuid: {
                                                        [ZOp.in]: {
                                                          [ZOp.query]: {
                                                            tableName: 'L2NetworkClusterRef',
                                                            fields: ['l2NetworkUuid'],
                                                            condition: {
                                                              clusterUuid
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          {
                            uuid: {
                              [ZOp.in]: {
                                [ZOp.query]: {
                                  tableName: 'L2Network',
                                  fields: ['uuid'],
                                  condition: {
                                    type: 'L2VlanNetwork',
                                    [ZOp.and]: {
                                      physicalInterface: {
                                        [ZOp.notIn]: {
                                          [ZOp.query]: {
                                            tableName: 'L2Network',
                                            fields: ['physicalInterface'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              uuid: {
                                                [ZOp.in]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2NetworkClusterRef',
                                                    fields: ['l2NetworkUuid'],
                                                    condition: {
                                                      clusterUuid
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      uuid: {
                                        [ZOp.in]: {
                                          [ZOp.query]: {
                                            tableName: 'L2VlanNetwork',
                                            fields: ['uuid'],
                                            type: 'L2VlanNetwork',
                                            vlan: {
                                              [ZOp.in]: {
                                                [ZOp.query]: {
                                                  tableName: 'L2VlanNetwork',
                                                  fields: ['vlan'],
                                                  condition: {
                                                    type: 'L2VlanNetwork',
                                                    uuid: {
                                                      [ZOp.in]: {
                                                        [ZOp.query]: {
                                                          tableName: 'L2NetworkClusterRef',
                                                          fields: ['l2NetworkUuid'],
                                                          condition: {
                                                            clusterUuid
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              },
              // VxlanNetworkPool
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'L2Network',
                      fields: ['uuid'],
                      condition: {
                        type: 'VxlanNetworkPool',
                        uuid: {
                          [ZOp.notIn]: {
                            [ZOp.query]: {
                              tableName: 'L2NetworkClusterRef',
                              fields: ['l2NetworkUuid'],
                              condition: {
                                clusterUuid
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // HardwareVxlanNetworkPool
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'L2Network',
                      fields: ['uuid'],
                      condition: {
                        type: 'HardwareVxlanNetworkPool',
                        uuid: {
                          [ZOp.notIn]: {
                            [ZOp.query]: {
                              tableName: 'L2NetworkClusterRef',
                              fields: ['l2NetworkUuid'],
                              condition: {
                                clusterUuid
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            ]
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'L2Network',
                  fields: ['uuid'],
                  condition: {
                    'cluster.hypervisorType': {
                      [ZOp.in]: ['baremetal', 'KVM']
                    }
                  }
                }
              }
            }
          }
        ]
      }
    })
    const Rs = `query L2Network.uuid where ((uuid in (query L2Network.uuid where type='L2NoVlanNetwork' and physicalInterface not in (query L2Network.physicalInterface where type='L2NoVlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558'))) or uuid in (query L2Network.uuid where type='L2VlanNetwork' and (uuid in (query L2Network.uuid where type='L2VlanNetwork' and (physicalInterface in (query L2Network.physicalInterface where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558')) and uuid in (query L2VlanNetwork.uuid where type='L2VlanNetwork' and vlan not in (query L2VlanNetwork.vlan where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558'))))) or uuid in (query L2Network.uuid where type='L2VlanNetwork' and (physicalInterface not in (query L2Network.physicalInterface where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558')) and uuid in (query L2VlanNetwork.uuid where type='L2VlanNetwork' and vlan not in (query L2VlanNetwork.vlan where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558'))))) or uuid in (query L2Network.uuid where type='L2VlanNetwork' and (physicalInterface not in (query L2Network.physicalInterface where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558')) and uuid in (query L2VlanNetwork.uuid))))) or uuid in (query L2Network.uuid where type='VxlanNetworkPool' and uuid not in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558')) or uuid in (query L2Network.uuid where type='HardwareVxlanNetworkPool' and uuid not in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558'))) and uuid not in (query L2Network.uuid where cluster.hypervisorType in ('baremetal','KVM')))`
    expect(zql).toBe(Rs)
  })

  it('2. baremetal或KVM集群获取二层网络', () => {
    const clusterUuid = '29737bfb7186482f83de997661a54558'

    const zql = ZQL.stringify({
      tableName: 'L2Network',
      fields: ['uuid'],
      condition: {
        [ZOp.and]: [
          {
            [ZOp.or]: [
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'L2Network',
                      fields: ['uuid'],
                      condition: {
                        type: 'L2NoVlanNetwork',
                        physicalInterface: {
                          [ZOp.notIn]: {
                            [ZOp.query]: {
                              tableName: 'L2Network',
                              fields: ['physicalInterface'],
                              condition: {
                                type: 'L2NoVlanNetwork',
                                uuid: {
                                  [ZOp.in]: {
                                    [ZOp.query]: {
                                      tableName: 'L2NetworkClusterRef',
                                      fields: ['l2NetworkUuid'],
                                      condition: {
                                        clusterUuid
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'L2Network',
                      fields: ['uuid'],
                      condition: {
                        type: 'L2VlanNetwork',
                        [ZOp.or]: [
                          {
                            uuid: {
                              [ZOp.in]: {
                                [ZOp.query]: {
                                  tableName: 'L2Network',
                                  fields: ['uuid'],
                                  condition: {
                                    type: 'L2VlanNetwork',
                                    [ZOp.and]: {
                                      physicalInterface: {
                                        [ZOp.in]: {
                                          [ZOp.query]: {
                                            tableName: 'L2Network',
                                            fields: ['physicalInterface'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              uuid: {
                                                [ZOp.in]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2NetworkClusterRef',
                                                    fields: ['l2NetworkUuid'],
                                                    condition: {
                                                      clusterUuid
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      uuid: {
                                        [ZOp.in]: {
                                          [ZOp.query]: {
                                            tableName: 'L2VlanNetwork',
                                            fields: ['uuid'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              vlan: {
                                                [ZOp.notIn]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2VlanNetwork',
                                                    fields: ['vlan'],
                                                    condition: {
                                                      type: 'L2VlanNetwork',
                                                      uuid: {
                                                        [ZOp.in]: {
                                                          [ZOp.query]: {
                                                            tableName: 'L2NetworkClusterRef',
                                                            fields: ['l2NetworkUuid'],
                                                            condition: {
                                                              clusterUuid
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          {
                            uuid: {
                              [ZOp.in]: {
                                [ZOp.query]: {
                                  tableName: 'L2Network',
                                  fields: ['uuid'],
                                  condition: {
                                    type: 'L2VlanNetwork',
                                    [ZOp.and]: {
                                      physicalInterface: {
                                        [ZOp.notIn]: {
                                          [ZOp.query]: {
                                            tableName: 'L2Network',
                                            fields: ['physicalInterface'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              uuid: {
                                                [ZOp.in]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2NetworkClusterRef',
                                                    fields: ['l2NetworkUuid'],
                                                    condition: {
                                                      clusterUuid
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      uuid: {
                                        [ZOp.in]: {
                                          [ZOp.query]: {
                                            tableName: 'L2VlanNetwork',
                                            fields: ['uuid'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              vlan: {
                                                [ZOp.notIn]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2VlanNetwork',
                                                    fields: ['vlan'],
                                                    condition: {
                                                      type: 'L2VlanNetwork',
                                                      uuid: {
                                                        [ZOp.in]: {
                                                          [ZOp.query]: {
                                                            tableName: 'L2NetworkClusterRef',
                                                            fields: ['l2NetworkUuid'],
                                                            condition: {
                                                              clusterUuid
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          {
                            uuid: {
                              [ZOp.in]: {
                                [ZOp.query]: {
                                  tableName: 'L2Network',
                                  fields: ['uuid'],
                                  condition: {
                                    type: 'L2VlanNetwork',
                                    [ZOp.and]: {
                                      physicalInterface: {
                                        [ZOp.notIn]: {
                                          [ZOp.query]: {
                                            tableName: 'L2Network',
                                            fields: ['physicalInterface'],
                                            condition: {
                                              type: 'L2VlanNetwork',
                                              uuid: {
                                                [ZOp.in]: {
                                                  [ZOp.query]: {
                                                    tableName: 'L2NetworkClusterRef',
                                                    fields: ['l2NetworkUuid'],
                                                    condition: {
                                                      clusterUuid
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      uuid: {
                                        [ZOp.in]: {
                                          [ZOp.query]: {
                                            tableName: 'L2VlanNetwork',
                                            fields: ['uuid'],
                                            type: 'L2VlanNetwork',
                                            vlan: {
                                              [ZOp.in]: {
                                                [ZOp.query]: {
                                                  tableName: 'L2VlanNetwork',
                                                  fields: ['vlan'],
                                                  condition: {
                                                    type: 'L2VlanNetwork',
                                                    uuid: {
                                                      [ZOp.in]: {
                                                        [ZOp.query]: {
                                                          tableName: 'L2NetworkClusterRef',
                                                          fields: ['l2NetworkUuid'],
                                                          condition: {
                                                            clusterUuid
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              },
              // VxlanNetworkPool
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'L2Network',
                      fields: ['uuid'],
                      condition: {
                        type: 'VxlanNetworkPool',
                        uuid: {
                          [ZOp.notIn]: {
                            [ZOp.query]: {
                              tableName: 'L2NetworkClusterRef',
                              fields: ['l2NetworkUuid'],
                              condition: {
                                clusterUuid
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              // HardwareVxlanNetworkPool
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'L2Network',
                      fields: ['uuid'],
                      condition: {
                        type: 'HardwareVxlanNetworkPool',
                        uuid: {
                          [ZOp.notIn]: {
                            [ZOp.query]: {
                              tableName: 'L2NetworkClusterRef',
                              fields: ['l2NetworkUuid'],
                              condition: {
                                clusterUuid
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            ]
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'L2Network',
                  fields: ['uuid'],
                  condition: {
                    'cluster.hypervisorType': 'ESX'
                  }
                }
              }
            }
          }
        ]
      }
    })
    const Rs = `query L2Network.uuid where ((uuid in (query L2Network.uuid where type='L2NoVlanNetwork' and physicalInterface not in (query L2Network.physicalInterface where type='L2NoVlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558'))) or uuid in (query L2Network.uuid where type='L2VlanNetwork' and (uuid in (query L2Network.uuid where type='L2VlanNetwork' and (physicalInterface in (query L2Network.physicalInterface where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558')) and uuid in (query L2VlanNetwork.uuid where type='L2VlanNetwork' and vlan not in (query L2VlanNetwork.vlan where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558'))))) or uuid in (query L2Network.uuid where type='L2VlanNetwork' and (physicalInterface not in (query L2Network.physicalInterface where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558')) and uuid in (query L2VlanNetwork.uuid where type='L2VlanNetwork' and vlan not in (query L2VlanNetwork.vlan where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558'))))) or uuid in (query L2Network.uuid where type='L2VlanNetwork' and (physicalInterface not in (query L2Network.physicalInterface where type='L2VlanNetwork' and uuid in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558')) and uuid in (query L2VlanNetwork.uuid))))) or uuid in (query L2Network.uuid where type='VxlanNetworkPool' and uuid not in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558')) or uuid in (query L2Network.uuid where type='HardwareVxlanNetworkPool' and uuid not in (query L2NetworkClusterRef.l2NetworkUuid where clusterUuid='29737bfb7186482f83de997661a54558'))) and uuid not in (query L2Network.uuid where cluster.hypervisorType='ESX'))`
    expect(zql).toBe(Rs)
  })
})
