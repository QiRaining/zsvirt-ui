import { Injectable } from '@nestjs/common'

import { execCommand } from '@/utils'

@Injectable()
export class ZOpsService {
  async supportable() {
    try {
      // install.sh脚本安装zops时会生成/usr/local/zops/cloud_integration 文件, 如果改文件存在则说明改zops是跟zstack一起安装的.
      // 前端判断该文件是否存在, 来决定是否隐藏一键巡检功能
      await execCommand('ls /usr/local/zops/cloud_integration')
      return true
    } catch (err1) {
      try {
        // 旧的判断方法，查询centos版本，支持c76,c79
        // 例子：CentOS Linux release 7.6.1810 (Core)
        const { stdout } = await execCommand('cat /etc/redhat-release')
        return /centos.+7\.[6|9]\./i.test(stdout)
      } catch (err2) {
        return false
      }
    }
  }
}
