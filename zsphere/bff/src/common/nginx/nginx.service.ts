import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'

import { Inject, Injectable } from '@nestjs/common'

import { execCommand } from '@/utils'
import { ManagementNodeService } from '@/zsphere-administration/management-node/management-node.service'


import { zmigrateProxyConfig } from './configs/zmigrate.config'

import { NginxProxyConfig, NginxProxySetupParams } from './types'

/**
 * 已注册的代理配置注册表
 */
const PROXY_CONFIGS: NginxProxyConfig[] = [ zmigrateProxyConfig]

/**
 * 生成上游服务器配置
 */
const getUpstreamTemplate = (managementIp: string, upstreamName: string, port: number) => `
upstream ${upstreamName} {
    server ${managementIp}:${port};
}`

@Injectable()
export class NginxService {
  constructor(
    @Inject(ManagementNodeService)
    private readonly managementNodeService: ManagementNodeService
  ) {}

  // ─── 配置注册表查询 ──────────────────────────────────────

  private getProxyConfig(serviceId: string): NginxProxyConfig {
    const config = PROXY_CONFIGS.find(c => c.serviceId === serviceId)
    if (!config) {
      throw new Error(`未找到 serviceId="${serviceId}" 的 Nginx 代理配置`)
    }
    return config
  }

  // ─── 基础设施方法（private） ──────────────────────────────

  /**
   * 获取本机所有非内部的IPv4地址列表
   */
  private getAllLocalIps(): string[] {
    const interfaces = os.networkInterfaces()
    const allIps: string[] = []
    for (const devName in interfaces) {
      const iface = interfaces[devName]
      if (iface) {
        for (const alias of iface) {
          if (alias.family === 'IPv4' && !alias.internal) {
            allIps.push(alias.address)
          }
        }
      }
    }
    return allIps
  }

  /**
   * 获取当前节点的IP地址
   */
  private async getCurrentNodeIp(): Promise<string> {
    try {
      const isDouble = await this.managementNodeService.isDoubleManagementNode()

      if (isDouble) {
        const nodeInfo = await this.managementNodeService.getDoubleManagementNodeInfo()
        const managementIps = nodeInfo?.hostNameList

        if (managementIps && managementIps.length > 0) {
          const allLocalIps = this.getAllLocalIps()
          for (const localIp of allLocalIps) {
            if (managementIps.includes(localIp)) {
              console.info(`节点IP识别成功: 本机管理IP为 ${localIp}`)
              return localIp
            }
          }

          console.error(
            `严重错误: 当前节点的任何IP [${allLocalIps.join(
              ', '
            )}] 都不在已知的管理节点列表 [${managementIps.join(', ')}] 中！`
          )
        }
      }

      console.info('无法通过匹配确认currentIP,继续尝试使用命令')

      const { stdout: hostnameResult } = await execCommand("hostname -I | awk '{print $1}'")
      if (hostnameResult && hostnameResult.trim()) {
        console.info(`通过hostname命令获取到的IP: ${hostnameResult.trim()}`)
        return hostnameResult.trim()
      }

      const { stdout: ipAddrResult } = await execCommand(
        "ip addr show | grep -w inet | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d/ -f1"
      )
      if (ipAddrResult && ipAddrResult.trim()) {
        console.info(`通过ip addr命令获取到的IP: ${ipAddrResult.trim()}`)
        return ipAddrResult.trim()
      }

      const { stdout: ifconfigResult } = await execCommand(
        "ifconfig | grep -w inet | grep -v 127.0.0.1 | head -1 | awk '{print $2}'"
      )
      if (ifconfigResult && ifconfigResult.trim()) {
        console.info(`通过ifconfig命令获取到的IP: ${ifconfigResult.trim()}`)
        return ifconfigResult.trim()
      }

      console.warn('无法获取当前节点IP地址，将使用"未知"表示')
      return '未知'
    } catch (error) {
      console.error('获取当前节点IP地址失败:', error)
      return '未知'
    }
  }

  /**
   * 获取nginx配置文件路径
   */
  private async getNginxConfigPath() {
    const { stdout } = await execCommand('realpath ~zstack')
    if (!stdout) {
      throw new Error('无法获取zstack用户目录路径')
    }
    return path.join(stdout.trim(), 'zstack-ui/configs')
  }

  /**
   * 检查并创建必要的nginx目录和文件
   */
  private async ensureNginxDirs() {
    try {
      await execCommand('sudo mkdir -p /var/log/nginx')
      await execCommand('sudo chown -R zstack:zstack /var/log/nginx')
      await execCommand('sudo mkdir -p /run/nginx')
      await execCommand('sudo chown -R zstack:zstack /run/nginx')

      const configPath = await this.getNginxConfigPath()
      await execCommand(`sudo mkdir -p ${configPath}`)
      await execCommand(`sudo chown -R zstack:zstack ${configPath}`)
    } catch (error) {
      console.error('创建nginx必要目录失败:', error)
      throw new Error(`创建nginx必要目录失败: ${error.message}`)
    }
  }

  /**
   * 验证nginx配置
   */
  private async validateNginxConfig() {
    try {
      await execCommand('sudo nginx -t')
      return true
    } catch (error) {
      console.error('Nginx配置验证失败:', error)
      return false
    }
  }

  /**
   * 调整双节点环境下的IP方向
   * 返回 [localIp, peerIp]，可能经过交换
   */
  private async adjustNodeIps(
    localIp?: string,
    peerIp?: string
  ): Promise<{ localIp?: string; peerIp?: string }> {
    if (!localIp || !peerIp) {
      return { localIp, peerIp }
    }

    const currentNodeIp = await this.getCurrentNodeIp()
    console.info(`当前执行命令的节点IP: ${currentNodeIp}`)

    if (currentNodeIp === '未知') {
      return { localIp, peerIp }
    }

    if (currentNodeIp === localIp) {
      console.info(`当前节点IP(${currentNodeIp})与配置中的本地节点IP(${localIp})匹配`)
      return { localIp, peerIp }
    }

    if (currentNodeIp === peerIp) {
      console.info(`警告: 当前节点IP(${currentNodeIp})与配置中的对端节点IP(${peerIp})匹配，已调整`)
      return { localIp: peerIp, peerIp: localIp }
    }

    console.info(`警告: 当前节点IP(${currentNodeIp})与配置的任何节点IP都不匹配`)
    return { localIp, peerIp }
  }

  /**
   * 获取双节点信息
   */
  private async getDoubleNodeInfo(): Promise<{
    isDouble: boolean
    localIp?: string
    peerIp?: string
  }> {
    const isDouble = await this.managementNodeService.isDoubleManagementNode()
    if (!isDouble) {
      return { isDouble: false }
    }

    const nodeInfo = await this.managementNodeService.getDoubleManagementNodeInfo()
    if (nodeInfo?.hostNameList?.length === 2) {
      return {
        isDouble: true,
        localIp: nodeInfo.hostNameList[0],
        peerIp: nodeInfo.hostNameList[1]
      }
    }

    return { isDouble: true }
  }

  /**
   * 重新加载nginx配置
   */
  private async reloadNginx(peerIp?: string, localIp?: string) {
    try {
      const configPath = await this.getNginxConfigPath()
      const adjusted = await this.adjustNodeIps(localIp, peerIp)
      localIp = adjusted.localIp
      peerIp = adjusted.peerIp

      console.info(
        `[重载Nginx] 开始重新加载Nginx配置，本地节点: ${
          localIp || '未知'
        }, 对端节点: ${peerIp || '无'}`
      )

      const reloadCommand = async (isRemote = false, remoteIp = '') => {
        const checkPidCmd = 'test -f /run/nginx.pid && echo "yes" || echo "no"'
        const nginxBasePath = path.dirname(configPath)
        const reloadCmd = `sudo /usr/sbin/nginx -s reload -c ${configPath}/nginx.conf -p ${nginxBasePath}`
        console.info(`${isRemote ? '远程' : '本地'}节点上的 reloadCmd 是: ${reloadCmd}`)

        if (isRemote) {
          console.info(`检查远程节点 ${remoteIp} 上的Nginx进程状态`)
          const { stdout: remotePidExists } = await execCommand(
            `sudo ssh root@${remoteIp} "${checkPidCmd}"`
          )
          console.info(`远程节点 ${remoteIp} 上的Nginx进程状态: ${remotePidExists.trim()}`)

          if (remotePidExists.trim() === 'yes') {
            console.info(`远程节点 ${remoteIp} 上的Nginx正在运行，执行重载命令`)
            const { stdout: reloadResult } = await execCommand(
              `sudo ssh root@${remoteIp} "sudo ${reloadCmd} "`
            )
            console.info(`远程节点 ${remoteIp} 重载Nginx结果: ${reloadResult || '成功'}`)
          } else {
            console.info(`远程节点 ${remoteIp} 上的Nginx未运行，尝试启动服务`)
            const { stdout: startResult } = await execCommand(
              `sudo ssh root@${remoteIp} "sudo systemctl start nginx 2>&1"`
            )
            console.info(`远程节点 ${remoteIp} 启动Nginx结果: ${startResult || '成功'}`)
          }
          console.info(`远程节点 ${remoteIp} 的Nginx配置已成功更新并重新加载`)
        } else {
          console.info(`检查本地节点${localIp ? ` ${localIp}` : ''}上的Nginx进程状态`)
          const { stdout: pidExists } = await execCommand(checkPidCmd)
          console.info(
            `本地节点${localIp ? ` ${localIp}` : ''}上的Nginx进程状态: ${pidExists.trim()}`
          )

          if (pidExists.trim() === 'yes') {
            console.info(`本地节点${localIp ? ` ${localIp}` : ''}上的Nginx正在运行，执行重载命令`)
            const { stdout: reloadResult } = await execCommand(`sudo ${reloadCmd} `)
            console.info(
              `本地节点${localIp ? ` ${localIp}` : ''}重载Nginx结果: ${reloadResult || '成功'}`
            )
          } else {
            console.info(`本地节点${localIp ? ` ${localIp}` : ''}上的Nginx未运行，尝试启动服务`)
            const { stdout: startResult } = await execCommand('sudo systemctl start nginx 2>&1')
            console.info(
              `本地节点${localIp ? ` ${localIp}` : ''}启动Nginx结果: ${startResult || '成功'}`
            )
          }
          console.info(`本地节点${localIp ? ` ${localIp}` : ''}的Nginx配置已成功更新并重新加载`)
        }
      }

      console.info(`准备重载本地节点${localIp ? ` ${localIp}` : ''}上的Nginx配置`)
      await reloadCommand()

      if (peerIp) {
        console.info(`准备重载对端节点 ${peerIp} 上的Nginx配置`)
        await reloadCommand(true, peerIp)
      }

      console.info(`所有节点的Nginx配置重载完成`)
    } catch (error) {
      console.error('重新加载nginx配置失败:', error)
      throw new Error(`重新加载nginx配置失败: ${error.message}`)
    }
  }

  /**
   * 通过 systemctl 重启 nginx 服务
   * 公开方法，供 resolver 调用
   */
  async reloadNginxBySystemctl(peerIp?: string, localIp?: string) {
    try {
      const adjusted = await this.adjustNodeIps(localIp, peerIp)
      localIp = adjusted.localIp
      peerIp = adjusted.peerIp

      console.info(
        `[重载Nginx] 开始重新加载Nginx配置，本地节点: ${
          localIp || '未知'
        }, 对端节点: ${peerIp || '无'}`
      )

      const reloadCommand = async (isRemote = false, remoteIp = '') => {
        const checkPidCmd = 'test -f /run/nginx.pid && echo "yes" || echo "no"'
        const reloadCmd = `systemctl restart zstack-ui-nginx`
        console.info(`${isRemote ? '远程' : '本地'}节点上的 reloadCmd 是: ${reloadCmd}`)

        if (isRemote) {
          console.info(`检查远程节点 ${remoteIp} 上的Nginx进程状态`)
          const { stdout: remotePidExists } = await execCommand(
            `sudo ssh root@${remoteIp} "${checkPidCmd}"`
          )
          console.info(`远程节点 ${remoteIp} 上的Nginx进程状态: ${remotePidExists.trim()}`)

          if (remotePidExists.trim() === 'yes') {
            console.info(`远程节点 ${remoteIp} 上的Nginx正在运行，执行重载命令`)
            const { stdout: reloadResult } = await execCommand(
              `sudo ssh root@${remoteIp} "sudo ${reloadCmd} "`
            )
            console.info(`远程节点 ${remoteIp} 重载Nginx结果: ${reloadResult || '成功'}`)
          } else {
            console.info(`远程节点 ${remoteIp} 上的Nginx未运行，尝试启动服务`)
            const { stdout: startResult } = await execCommand(
              `sudo ssh root@${remoteIp} "sudo systemctl start nginx 2>&1"`
            )
            console.info(`远程节点 ${remoteIp} 启动Nginx结果: ${startResult || '成功'}`)
          }
          console.info(`远程节点 ${remoteIp} 的Nginx配置已成功更新并重新加载`)
        } else {
          console.info(`检查本地节点${localIp ? ` ${localIp}` : ''}上的Nginx进程状态`)
          const { stdout: pidExists } = await execCommand(checkPidCmd)
          console.info(
            `本地节点${localIp ? ` ${localIp}` : ''}上的Nginx进程状态: ${pidExists.trim()}`
          )

          if (pidExists.trim() === 'yes') {
            console.info(`本地节点${localIp ? ` ${localIp}` : ''}上的Nginx正在运行，执行重载命令`)
            const { stdout: reloadResult } = await execCommand(`sudo ${reloadCmd} `)
            console.info(
              `本地节点${localIp ? ` ${localIp}` : ''}重载Nginx结果: ${reloadResult || '成功'}`
            )
          } else {
            console.info(`本地节点${localIp ? ` ${localIp}` : ''}上的Nginx未运行，尝试启动服务`)
            const { stdout: startResult } = await execCommand('sudo systemctl start nginx 2>&1')
            console.info(
              `本地节点${localIp ? ` ${localIp}` : ''}启动Nginx结果: ${startResult || '成功'}`
            )
          }
          console.info(`本地节点${localIp ? ` ${localIp}` : ''}的Nginx配置已成功更新并重新加载`)
        }
      }

      console.info(`准备重载本地节点${localIp ? ` ${localIp}` : ''}上的Nginx配置`)
      await reloadCommand()

      if (peerIp) {
        console.info(`准备重载对端节点 ${peerIp} 上的Nginx配置`)
        await reloadCommand(true, peerIp)
      }

      console.info(`所有节点的Nginx配置重载完成`)
    } catch (error) {
      console.error('重新加载nginx配置失败:', error)
      throw new Error(`重新加载nginx配置失败: ${error.message}`)
    }
  }

  /**
   * 清理指定服务的 Nginx 配置文件
   */
  private async cleanupNginxFilesForServices(
    configPath: string,
    serviceIds: string[],
    localIp?: string,
    peerIp?: string
  ) {
    const adjusted = await this.adjustNodeIps(localIp, peerIp)
    localIp = adjusted.localIp
    peerIp = adjusted.peerIp

    const filesToDelete: string[] = []
    for (const serviceId of serviceIds) {
      const config = this.getProxyConfig(serviceId)
      filesToDelete.push(
        path.join(configPath, config.upstreamConfigFileName),
        path.join(configPath, config.serverConfigFileName)
      )
    }

    console.info(`准备清理Nginx配置文件：${filesToDelete.join(', ')}`)

    // 本地节点删除
    try {
      console.info(`检查本地节点${localIp ? ` ${localIp}` : ''}上的Nginx配置文件是否存在`)
      for (const file of filesToDelete) {
        const { stdout: fileExists } = await execCommand(
          `test -f ${file} && echo "存在" || echo "不存在"`
        )
        console.info(
          `本地节点${localIp ? ` ${localIp}` : ''}上的文件 ${file}: ${fileExists.trim()}`
        )
      }

      console.info(`在本地节点${localIp ? ` ${localIp}` : ''}上删除Nginx配置文件`)
      const { stdout: rmResult } = await execCommand(`sudo rm -fv ${filesToDelete.join(' ')} 2>&1`)
      console.info(
        `本地节点${localIp ? ` ${localIp}` : ''}上删除文件结果: ${rmResult || '没有输出'}`
      )
    } catch (error) {
      console.error(`删除本地节点${localIp ? ` ${localIp}` : ''}上的Nginx配置文件失败:`, error)
      throw new Error(
        `删除本地节点${localIp ? ` ${localIp}` : ''}上的Nginx配置文件失败: ${error.message}`
      )
    }

    // 双节点：在对端节点也删除
    if (peerIp) {
      try {
        console.info(`检查对端节点 ${peerIp} 上的Nginx配置文件是否存在`)
        for (const file of filesToDelete) {
          const { stdout: fileExists } = await execCommand(
            `sudo ssh root@${peerIp} "test -f ${file} && echo '存在' || echo '不存在'"`
          )
          console.info(`对端节点 ${peerIp} 上的文件 ${file}: ${fileExists.trim()}`)
        }

        console.info(`在对端节点 ${peerIp} 上删除Nginx配置文件`)
        const { stdout: rmResult } = await execCommand(
          `sudo ssh root@${peerIp} "sudo rm -fv ${filesToDelete.join(' ')} 2>&1"`
        )
        console.info(`对端节点 ${peerIp} 上删除文件结果: ${rmResult || '没有输出'}`)
      } catch (error) {
        console.error(`删除对端节点 ${peerIp} 上的Nginx配置文件失败:`, error)
        throw new Error(`删除对端节点 ${peerIp} 上的Nginx配置文件失败: ${error.message}`)
      }
    }

    console.info(`Nginx配置文件清理完成`)
  }

  /**
   * 处理nginx配置文件（写入server和upstream配置）
   */
  private async handleNginxConfig(
    configPath: string,
    serverConfigPath: string,
    upstreamConfigPath: string,
    serverConfig: string,
    upstreamConfig: string
  ) {
    try {
      const { isDouble, localIp: rawLocalIp, peerIp: rawPeerIp } = await this.getDoubleNodeInfo()
      const adjusted = await this.adjustNodeIps(rawLocalIp, rawPeerIp)
      const localIp = adjusted.localIp
      const peerIp = adjusted.peerIp

      // 确保nginx配置目录存在
      await this.ensureNginxDirs()

      // 创建临时配置文件
      const tmpServerConfigPath = `/tmp/nginx_server_${Date.now()}.conf`
      const tmpUpstreamConfigPath = `/tmp/nginx_upstream_${Date.now()}.conf`

      console.info(`创建临时配置文件: ${tmpServerConfigPath}`)
      await fs.writeFile(tmpServerConfigPath, serverConfig)
      console.info(`创建临时配置文件: ${tmpUpstreamConfigPath}`)
      await fs.writeFile(tmpUpstreamConfigPath, upstreamConfig)

      // 在本地节点写入配置文件
      console.info(
        `正在将配置文件复制到本地节点${localIp ? ` ${localIp}` : ''}: ${serverConfigPath}`
      )
      await execCommand(`sudo cp ${tmpServerConfigPath} ${serverConfigPath}`)
      console.info(
        `正在将配置文件复制到本地节点${localIp ? ` ${localIp}` : ''}: ${upstreamConfigPath}`
      )
      await execCommand(`sudo cp ${tmpUpstreamConfigPath} ${upstreamConfigPath}`)

      // 检查复制结果
      const { stdout: localServerFileResult } = await execCommand(`ls -la ${serverConfigPath}`)
      console.info(`本地节点服务器配置文件状态: ${localServerFileResult}`)
      const { stdout: localUpstreamFileResult } = await execCommand(`ls -la ${upstreamConfigPath}`)
      console.info(`本地节点上游配置文件状态: ${localUpstreamFileResult}`)

      // 设置正确的权限
      console.info(`正在本地节点${localIp ? ` ${localIp}` : ''}上设置文件权限`)
      await execCommand(`sudo chown zstack:zstack ${serverConfigPath} ${upstreamConfigPath}`)
      await execCommand(`sudo chmod 644 ${serverConfigPath} ${upstreamConfigPath}`)

      // 检查文件内容
      console.info(`检查本地节点${localIp ? ` ${localIp}` : ''}上的配置文件内容`)
      const { stdout: localServerContent } = await execCommand(
        `cat ${serverConfigPath} | head -n 5`
      )
      console.info(`本地节点服务器配置文件前5行内容: ${localServerContent}`)
      const { stdout: localUpstreamContent } = await execCommand(
        `cat ${upstreamConfigPath} | head -n 5`
      )
      console.info(`本地节点上游配置文件前5行内容: ${localUpstreamContent}`)

      // 清理临时文件
      try {
        await fs.unlink(tmpServerConfigPath)
        await fs.unlink(tmpUpstreamConfigPath)
        console.info('临时配置文件已清理')
      } catch (error) {
        console.warn('清理临时配置文件失败，可以忽略:', error)
      }

      console.info(`在本地节点${localIp ? ` ${localIp}` : ''} 上成功写入Nginx配置文件`)

      // 如果是双节点环境，则在对端节点也写入配置
      if (isDouble && peerIp) {
        console.info(`检测到双节点环境，准备在对端节点 ${peerIp} 上写入Nginx配置`)

        try {
          // 在对端节点创建目录
          console.info(`正在对端节点 ${peerIp} 上创建目录: ${configPath}`)
          await execCommand(`sudo ssh root@${peerIp} "mkdir -p ${configPath}"`)
          const { stdout: dirCheckResult } = await execCommand(
            `sudo ssh root@${peerIp} "ls -la ${configPath}"`
          )
          console.info(`对端节点目录创建结果: ${dirCheckResult}`)

          await execCommand(`sudo ssh root@${peerIp} "chown -R zstack:zstack ${configPath}"`)
          console.info(`已在对端节点 ${peerIp} 上设置目录权限`)

          // 将server配置文件复制到对端节点
          console.info(`正在将配置文件复制到对端节点 ${peerIp}: ${serverConfigPath}`)
          await execCommand(`sudo scp ${serverConfigPath} root@${peerIp}:${serverConfigPath}`)

          // 将upstream配置文件复制到对端节点
          // 如果upstream中包含本地节点IP，需要替换为对端节点IP
          // 确保每个节点的nginx upstream指向自己本地的服务（如zmigrate）
          // SDS等外部服务的IP不会匹配本地节点IP，不受影响
          if (localIp && upstreamConfig.includes(localIp)) {
            const peerUpstreamConfig = upstreamConfig.replaceAll(localIp, peerIp)
            console.info(`对端节点upstream配置已调整：将 ${localIp} 替换为 ${peerIp}`)
            const tmpPeerUpstreamPath = `/tmp/nginx_peer_upstream_${Date.now()}.conf`
            await fs.writeFile(tmpPeerUpstreamPath, peerUpstreamConfig)
            await execCommand(
              `sudo scp ${tmpPeerUpstreamPath} root@${peerIp}:${upstreamConfigPath}`
            )
            try {
              await fs.unlink(tmpPeerUpstreamPath)
            } catch {
              console.warn('清理对端upstream临时文件失败，可以忽略')
            }
          } else {
            console.info(`正在将配置文件复制到对端节点 ${peerIp}: ${upstreamConfigPath}`)
            await execCommand(`sudo scp ${upstreamConfigPath} root@${peerIp}:${upstreamConfigPath}`)
          }

          // 检查复制结果
          const { stdout: serverFileResult } = await execCommand(
            `sudo ssh root@${peerIp} "ls -la ${serverConfigPath}"`
          )
          console.info(`对端节点服务器配置文件状态: ${serverFileResult}`)
          const { stdout: upstreamFileResult } = await execCommand(
            `sudo ssh root@${peerIp} "ls -la ${upstreamConfigPath}"`
          )
          console.info(`对端节点上游配置文件状态: ${upstreamFileResult}`)

          // 在对端节点设置正确的权限
          console.info(`正在对端节点 ${peerIp} 上设置文件权限`)
          await execCommand(
            `sudo ssh root@${peerIp} "chown zstack:zstack ${serverConfigPath} ${upstreamConfigPath}"`
          )
          await execCommand(
            `sudo ssh root@${peerIp} "chmod 644 ${serverConfigPath} ${upstreamConfigPath}"`
          )

          // 检查文件内容
          console.info(`检查对端节点 ${peerIp} 上的配置文件内容`)
          const { stdout: serverContent } = await execCommand(
            `sudo ssh root@${peerIp} "cat ${serverConfigPath} | head -n 5"`
          )
          console.info(`对端节点服务器配置文件前5行内容: ${serverContent}`)
          const { stdout: upstreamContent } = await execCommand(
            `sudo ssh root@${peerIp} "cat ${upstreamConfigPath} | head -n 5"`
          )
          console.info(`对端节点上游配置文件前5行内容: ${upstreamContent}`)

          // 在对端节点验证nginx配置
          console.info(`正在对端节点 ${peerIp} 上验证Nginx配置`)
          const { stdout: validateResult } = await execCommand(
            `sudo ssh root@${peerIp} "nginx -t 2>&1"`
          )
          console.info(`对端节点Nginx配置验证结果: ${validateResult}`)
        } catch (error) {
          console.error(`在对端节点 ${peerIp} 上配置Nginx失败:`, error)
          throw new Error(`在对端节点 ${peerIp} 上配置Nginx失败: ${error.message}`)
        }

        console.info(`在对端节点 ${peerIp} 上成功写入Nginx配置文件`)
      }

      // 在本地节点验证nginx配置
      const isValid = await this.validateNginxConfig()
      if (!isValid) {
        throw new Error('Nginx配置验证失败')
      }

      // 重新加载nginx配置（本地节点和对端节点）
      await this.reloadNginx(peerIp, localIp)
    } catch (error) {
      console.error('处理nginx配置文件失败:', error)
      throw new Error(`处理nginx配置文件失败: ${error.message}`)
    }
  }

  // ─── 公开 API（通用） ─────────────────────────────────────

  /**
   * 通用代理设置入口
   * @param params.serviceId 服务标识
   * @param params.managementIp 管理节点 IP
   * @param params.port 覆盖默认端口
   */
  async setupProxy(params: NginxProxySetupParams) {
    const config = this.getProxyConfig(params.serviceId)
    const port = params.port ?? config.defaultPort

    console.info(
      `开始配置${params.serviceId}的Nginx配置，管理IP: ${params.managementIp}, 端口: ${port}`
    )

    const configPath = await this.getNginxConfigPath()
    const serverConfigPath = path.join(configPath, config.serverConfigFileName)
    const upstreamConfigPath = path.join(configPath, config.upstreamConfigFileName)

    await this.handleNginxConfig(
      configPath,
      serverConfigPath,
      upstreamConfigPath,
      config.serverTemplate,
      getUpstreamTemplate(params.managementIp, config.upstreamName, port)
    )
  }

  /**
   * 清理单个服务的 nginx 配置
   */
  async cleanupProxy(serviceId: string) {
    try {
      console.info(`开始清理${serviceId}相关的Nginx配置文件...`)

      const configPath = await this.getNginxConfigPath()
      const { localIp, peerIp } = await this.getDoubleNodeInfo()

      await this.cleanupNginxFilesForServices(configPath, [serviceId], localIp, peerIp)

      await this.reloadNginx(peerIp, localIp)

      console.info(`${serviceId}相关的Nginx配置文件清理完成`)
      return true
    } catch (error) {
      console.error(`清理${serviceId}的Nginx配置文件失败:`, error)
      throw new Error(`清理${serviceId}的Nginx配置文件失败: ${error.message}`)
    }
  }

  /**
   * 批量清理多个服务的 nginx 配置
   */
  async cleanupProxies(serviceIds: string[]) {
    try {
      console.info(`开始清理 [${serviceIds.join(', ')}] 相关的Nginx配置文件...`)

      const configPath = await this.getNginxConfigPath()
      const { localIp, peerIp } = await this.getDoubleNodeInfo()

      await this.cleanupNginxFilesForServices(configPath, serviceIds, localIp, peerIp)

      await this.reloadNginx(peerIp, localIp)

      console.info(`[${serviceIds.join(', ')}] 相关的Nginx配置文件清理完成`)
      return true
    } catch (error) {
      console.error('批量清理Nginx配置文件失败:', error)
      throw new Error(`批量清理Nginx配置文件失败: ${error.message}`)
    }
  }
}
