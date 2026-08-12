// import { InjectModel } from '@nestjs/mongoose'
// import { Model } from 'mongoose'
import * as fs from 'fs'
import * as path from 'path'

import { Inject, Injectable } from '@nestjs/common'

import { ActionResp } from '@/common/model/action-resp.model'
import { PUBLIC_DIR } from '@/common/paths'
import { PubSubServiceBase } from '@/common/pub-sub/pub-sub-base.service'
import { RecordActionService } from '@/common/record-action/record-action.service'

// import { PubSub } from 'graphql-subscriptions'
import { CreateExportTaskArgs, ExportTask, ExportTaskStatus } from './data-export.model'
// import { OvnControllerVmInstanceDataExport } from '@/network-resource/ovn-controller-vm-instance/data-export.service';
// import { AuditingDataExport } from '@/maintenance/audit/data-export.service';

@Injectable()
export class DataExportService {
  // private pubSub: PubSub;
  private readonly exportDir = path.join(PUBLIC_DIR, 'exports')

  @Inject() private pubSubService: PubSubServiceBase
  @Inject() private recordActionService: RecordActionService
  @Inject()
  // private ovnControllerVmInstanceDataExport: OvnControllerVmInstanceDataExport;
  // @Inject()
  // private auditingDataExport: AuditingDataExport;
  async createExportTask(args: CreateExportTaskArgs): Promise<ActionResp> {
    // 异步执行导出任务
    this.processExportTask(args)
    const actionResp = new ActionResp()
    actionResp.actionId = args.actionId

    return actionResp
  }

  async processExportTask(createTaskArgs: CreateExportTaskArgs) {
    const { actionId, headers } = createTaskArgs
    try {
      this.recordActionService.recordActionStart(
        createTaskArgs,
        createTaskArgs.actionId,
        'Export Data',
        {}
      )

      if (!fs.existsSync(this.exportDir)) {
        fs.mkdirSync(this.exportDir, { recursive: true })
      }
      // // 分批获取数据并写入文件
      const writeStream = fs.createWriteStream(path.join(this.exportDir, `${actionId}.csv`))

      // 写入表头
      // writeStream.write(columns.join(',') + '\n');
      //

      writeStream.write(headers.join('|') + '\n')
      const inventories = await this.queryData(createTaskArgs.resourceType, createTaskArgs)

      inventories.forEach(inventory => writeStream.write(Object.values(inventory).join('|') + '\n'))

      writeStream.end()

      const task = new ExportTask()
      task.taskId = actionId
      task.status = ExportTaskStatus.COMPLETED
      task.downloadUrl = `/api/export/${actionId}.csv`

      this.pubSubService.exportData({
        sessionId: createTaskArgs.sessionId,
        payload: task
      })

      this.recordActionService.recordActionSuccess(actionId)
    } catch (error) {
      const task = new ExportTask()
      task.taskId = actionId
      task.status = ExportTaskStatus.FAILED
      task.error = error.message

      this.pubSubService.exportData({
        sessionId: createTaskArgs.sessionId,
        payload: task
      })
      this.recordActionService.recordActionFailed(actionId)
    }

    // let start = 0;
    // const batchSize = 1000;

    // while (true) {
    //   const data = await this.queryData(resourceType, {
    //     conditions,
    //     limit: batchSize,
    //     start,
    //   });

    //   if (!data.length) break;

    //   // 写入数据
    //   data.forEach((item) => {
    //     const row = columns.map((col) => {
    //       const value = item[col];
    //       if (typeof value === 'string' && value.includes(',')) {
    //         return `"${value}"`;
    //       }
    //       return value ?? '';
    //     });
    //     writeStream.write(row.join(',') + '\n');
    //   });

    //   start += data.length;
    // }

    // // 更新任务状态为完成
    // const downloadUrl = `/exports/${task.taskId}.csv`;
    // await this.exportTaskModel.findByIdAndUpdate(task._id, {
    //   status: ExportTaskStatus.COMPLETED,
    //   downloadUrl,
    // });

    // // 发布任务完成事件
    // this.pubSub.publish('exportTaskUpdated', {
    //   exportTaskUpdated: {
    //     taskId: task.taskId,
    //     status: ExportTaskStatus.COMPLETED,
    //     downloadUrl,
    //   },
    // });
  }

  private async queryData(resourceType: string, variables: CreateExportTaskArgs) {
    switch (resourceType) {
      case 'VmInstance':
        // const result = await this.vmInstanceQueryService.get(variables);
        return [{ uuid: 'nb' }]

      case 'OvnControllerVm':
      // return await this.ovnControllerVmInstanceDataExport.exportService(
      //   variables,
      // );

      case 'auditing':
      // return await this.auditingDataExport.exportService(variables);

      // ... 其他资源类型
      default:
        throw new Error(`Unknown resource type: ${resourceType}`)
    }
  }

  // async getTaskStatus(taskId: string): Promise<ExportTask> {
  //   return this.exportTaskModel.findOne({ taskId });
  // }
}
