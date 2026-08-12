import * as fs from 'fs'
import { WriteStream } from 'fs'
import * as path from 'path'

import { Injectable } from '@nestjs/common'
import { WebSocket } from 'ws'

export const failed = 'failed to start management server'
export const licenseFailed = 'The license is not permitted for the operation'
export const success = 'managementNode starts successfully'

export const tempFilePath = path.join(process.cwd(), 'public', 'logs', 'recover.database.log')

export const tempFileDir = path.join(process.cwd(), 'public', 'logs')

export enum RecoverDatabaseStatus {
  Success = 'Success',
  StartFailed = 'StartFailed',
  LicenseNoPermision = 'LicenseNoPermision',
  NoRunning = 'NoRunning',
  Running = 'Running',
  SocketConnectFailed = 'SocketConnectFailed'
}

@Injectable()
export class RecoverDatabaseWebSocketClient {
  ws: WebSocket

  path: string
  sessionId: string
  timer: NodeJS.Timeout

  maxReconnectCount = 20
  reconnectCount = 0
  isCompleted: boolean
  onCompleted: Function
  port: number
  len = 0
  isRunning: boolean
  mockTimer: NodeJS.Timeout
  mockMsg = ''
  status: RecoverDatabaseStatus
  stream: WriteStream

  mock() {
    this.reconnectCount = 0
    this.mockMsg = ''
    // this.mockMsg =
    for (let i = 0; i < 1000; i++) {
      this.mockMsg += `RecoverDatabaseStatus ${Math.random()}`
    }
    this.mockTimer = setInterval(() => {
      this.reconnectCount++
      if (this.reconnectCount < this.maxReconnectCount) {
        const message = `${this.reconnectCount} ${this.mockMsg} \n`
        this.stream.write(message)
        return
      }
      clearInterval(this.mockTimer)
      this.status = RecoverDatabaseStatus.Success
      this.isCompleted = true
      // this.stream.end('failed to start management server')
      this.stream.end('managementNode starts successfully')
    }, 1000)

    // cws.on('finish', () => {
    //   console.log('al finish mock')
    //   cws.close()
    //   this.complete()
    // })
  }

  initServer(port: number, sessionId: string, onCompleted?: Function) {
    this.port = port
    this.sessionId = sessionId
    this.onCompleted = onCompleted
    this.reconnectCount = 0
    this.isCompleted = false
    this.status = RecoverDatabaseStatus.NoRunning

    //创建目录
    fs.mkdir(
      tempFileDir,
      {
        recursive: true
      },
      err => {
        if (err) {
          throw err
        }

        //删除文件内容，不存在就创建文件
        fs.writeFile(tempFilePath, '', { flag: 'w+' }, err => {
          if (err) {
            console.log('writeFile : ', err)
          }
          this.stream = fs.createWriteStream(tempFilePath)
          this.stream.on('open', () => {
            this.startListen()
          })
          this.stream.on('finish', () => {
            console.log('finish')
            this.complete()
          })
        })
      }
    )
  }

  startListen() {
    // this.mock()
    // // setTimeout(() => {

    // //   this.status = RecoverDatabaseStatus.SocketConnectFailed
    // //   this.complete()
    // // } , 5000)
    // return
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.ws) {
      this.ws.terminate()
      this.ws = null
    }
    const server = process.env.ZS_MN_SERVER as string
    const isHttps = server.includes('https')
    const url = server.replace(/https?:\/\//, '').replace(/:\d+$/, '')

    this.path = `ws${isHttps ? 's' : ''}://${url}:${this.port}`
    this.ws = new WebSocket(this.path)

    this.initEvents()
  }
  complete() {
    if (this.ws) {
      this.ws.terminate()
      this.ws = null
    }

    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    if (!this.isCompleted && this.stream) {
      this.stream.close()
    }

    this.onCompleted?.(this.status)
  }
  onMessage(message: string) {
    if (this.isCompleted) {
      return
    }

    if ([failed, licenseFailed, success].some(str => message?.includes(str))) {
      this.isCompleted = true
      const index = [failed, licenseFailed, success].findIndex(str => message?.includes(str))
      this.status = [
        RecoverDatabaseStatus.StartFailed,
        RecoverDatabaseStatus.LicenseNoPermision,
        RecoverDatabaseStatus.Success
      ][index]

      this.stream.end(message)
      return
    }
    this.stream.write(message)
  }

  initEvents() {
    this.ws.on('message', (message: string) => {
      this.onMessage(message)
    })

    this.ws.on('error', (message: string) => {
      console.log('websocket , error : ', message)
      this.reconnect()
    })

    this.ws.on('close', () => {
      console.log('close WebSocket')
    })
  }

  reconnect() {
    if (this.timer) {
      return
    }
    this.timer = setInterval(() => {
      if (this.reconnectCount < this.maxReconnectCount) {
        this.ws = new WebSocket(this.path)
        this.reconnectCount++
        this.initEvents()
      } else {
        this.ws.close()
        this.ws = null
        clearInterval(this.timer)
        this.timer = null
        this.status = RecoverDatabaseStatus.SocketConnectFailed
        this.complete()
      }
    }, 500)
  }
}
