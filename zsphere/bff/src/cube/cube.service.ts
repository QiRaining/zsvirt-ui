import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { execCommand } from '@/utils'

@Injectable()
export class CubeService {
  @Inject() private configService: ConfigService
  @Inject() private readonly httpService: HttpService
  @Inject() queryHostAction: QueryHostAction

  // 判断是否是cube环境
  async isCube() {
    let result: boolean
    try {
      const { stdout } = await execCommand('bootstrap is_deployed')
      result = JSON.parse(stdout)
    } catch (e) {
      try {
        // 兼容2.0.0之前的版本
        await execCommand('ls /usr/local/hyperconverged/conf/host_info.json')
        result = true
      } catch (err) {
        result = false
      }
    }
    return result
  }

  // 获取cube版本
  async getVersion() {
    let result: string
    try {
      const { stdout } = await execCommand(`bootstrap version`)
      // 例子：xxx-2.0.0-20220427-091556
      if (stdout) {
        const outArr = stdout.trim().split('-')
        result = outArr[outArr.length - 3]
      }
    } catch (err) {
      result = ''
    }
    return result
  }

  // 判断sds存储
  async isSds() {
    try {
      await execCommand('ls ~zstack/zstack-ui/configs/sds.server.nginx.conf')
      await execCommand('ls ~zstack/zstack-ui/configs/sds.upstream.nginx.conf')
      return true
    } catch (err) {
      return false
    }
  }

  // 判断ZStone存储
  async isZStone() {
    try {
      await execCommand('ls ~zstack/zstack-ui/configs/zstone.server.nginx.conf')
      await execCommand('ls ~zstack/zstack-ui/configs/zstone.upstream.nginx.conf')
      return true
    } catch (err) {
      return false
    }
  }

  async getEnv() {
    const isCube = await this.isCube()
    // const isCube = true
    if (isCube) {
      let storageType = ''
      const isSds = await this.isSds()
      if (isSds) {
        storageType = 'sds'
      }
      const isZStone = await this.isZStone()
      if (isZStone) {
        storageType = 'zstone'
      }
      const version = await this.getVersion()
      return {
        isCube,
        storageType,
        version
      }
    } else {
      return {
        isCube
      }
    }
  }

  async getWizardInfo() {
    let info = {}

    try {
      const { stdout } = await execCommand('cat /usr/local/hyperconverged/conf/wizard_info.json')
      info = JSON.parse(stdout)
    } catch (e) {
      try {
        // 兼容2.0.0之前的版本
        const { stdout: stdout1 } = await execCommand(
          'cat /usr/local/hyperconverged/conf/host_info.json'
        )
        const hostNodeInfo = JSON.parse(stdout1)
        const { stdout: stdout2 } = await execCommand(
          'cat /usr/local/hyperconverged/conf/storage_monitor_info.json'
        )
        const monNodeInfo = JSON.parse(stdout2)
        info = { ...hostNodeInfo, ...monNodeInfo }
      } catch (err) {
        throw err
      }
    }
    // todo: Mock data
    // info = { "hostList": [{ "ip": "198.51.100.246", "password": "password", "port": 22, "username": "root", "sn": "bec8eaff-2eda-465f-b375-712f8894c1c8", "isManagementNode": true, "hostname": "zstone-1" }, { "ip": "198.51.100.9", "password": "password", "port": 22, "username": "root", "sn": "8b4dd4a3-1099-4b00-820c-6013dd15e185", "isManagementNode": true, "hostname": "zstone-2" }, { "ip": "198.51.100.203", "password": "password", "port": 22, "username": "root", "sn": "8abfef47-dbfc-4c65-a544-4669938e0be4", "isManagementNode": false, "hostname": "zstone-3" }], "storageInfo": { "storageType": "zstone", "poolName": "pool-bff811ded4534c58a05013710907c3e3", "monList": [{ "ip": "198.51.100.246", "password": "password", "port": 22, "username": "root", "sn": "bec8eaff-2eda-465f-b375-712f8894c1c8" }, { "ip": "198.51.100.9", "password": "password", "port": 22, "username": "root", "sn": "8b4dd4a3-1099-4b00-820c-6013dd15e185" }, { "ip": "198.51.100.203", "password": "password", "port": 22, "username": "root", "sn": "8abfef47-dbfc-4c65-a544-4669938e0be4" }] }, "storagePublicNetwork": "198.51.100.246/16", "storageClusterNetwork": "198.51.100.246/16", "tenantNetwork": { "start_ip": "", "end_ip": "", "netmask": 0, "gateway": "", "vlan_id": -1 } }
    return info
  }

  async getBootstrapServiceStatus() {
    let result: boolean
    try {
      const { stdout } = await execCommand('systemctl status hyperconverged-bootstrap.service')
      result = stdout.includes('running')
    } catch (err) {
      result = false
    }
    return result
  }

  /**获取扩容物理机
   * 1、查询bootstrap的info接口，筛选已部署的机器
   * 2、查询mn的物理机接口，排除本机已有的机器
   */
  async getDeployedNodes() {
    let nodes = []
    try {
      const mnServer = this.configService.get<string>('ZS_MN_SERVER')
      const bootstrapServer = mnServer.replace('8080', '7432')
      const path = `${bootstrapServer}/v1/bootstrap/info`
      const { status, data } = await this.httpService.get(path).toPromise()
      if (status === 200) {
        nodes = data.nodes
          .filter(item => {
            return item.expand === true
          })
          .map(item => {
            const memorySize = item.memory.reduce((prev, cur) => prev + cur.size, 0)
            const disk = item.disk.map(subItem => {
              return {
                sn: subItem.serial_number,
                name: subItem.name,
                size: subItem.size,
                productName: subItem.product_name,
                type: subItem.type
              }
            })
            return {
              sn: item.serial_number,
              model: item.product_name,
              ip: item.management_ip,
              memorySize,
              disk
            }
          })
      }
    } catch (err) {
      nodes = []
    }
    return nodes
  }

  async getBootstrapInfo() {
    const active = await this.getBootstrapServiceStatus()
    let nodes = []
    if (active) {
      nodes = await this.getDeployedNodes()
      const { inventories: hostList } = await this.queryHostAction.call({})
      const ipList = hostList.map(item => item.managementIp)
      nodes = nodes.filter(item => {
        return !ipList.includes(item.ip)
      })
    }
    return {
      active,
      nodes
    }
  }
}
