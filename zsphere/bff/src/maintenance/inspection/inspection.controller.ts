// import * as Pdfkit from 'pdfkit'
import { Writable } from 'stream'

import { Controller, Post, Res, Body, Headers, Inject, Req } from '@nestjs/common'
import { cloneDeep } from 'lodash'
import * as PdfKit from 'pdfkit'

import { ActionService } from '@/base/action-service'

import { InspectionService } from './inspection.service'
import {
  PdfTableLike,
  PdfText,
  CellProps,
  PdfTitle,
  PdfTable,
  HeaderProp,
  PdfPage,
  PdfCatalog,
  PdfSvg,
  pathresolve
} from './pdf-utils'

class Payload {
  res: any
  body: PdfBody
  sessionId: string
}

@Controller('api/inspection')
export class InspectionController extends ActionService {
  @Inject() service: InspectionService

  @Post('pdf')
  async controller(
    @Res() res,
    @Req() req,
    @Body() body: PdfBody,
    @Headers('x-session-id') sessionId
  ): Promise<void> {
    const { actionId, actionName, ..._body } = body
    const actionFn = async (payload: Payload, taskId: string) => {
      await new Promise(resolve => this.exportPdf(payload, resolve as typeof Promise.resolve))
      return { id: taskId }
    }

    this.actionHelper(
      {
        payload: { res, body: _body, sessionId },
        action: { name: actionName, total: 1, actionId }
      },
      'Inspection',
      actionFn,
      { req }
    )
  }

  // @Post('pdf')
  async exportPdf({ res, body, sessionId }: Payload, resolve = Promise.resolve): Promise<void> {
    const writeStream = new Writable()
    const chunkArr = []
    writeStream._write = (chunk, encoding, cb) => {
      chunkArr.push(chunk)
      cb(null)
    }
    writeStream.on('finish', () => {
      const buffer = Buffer.concat(chunkArr)
      res.set('Content-Type', 'application/pdf') //设置响应文本类型
      res.set('Content-Disposition', 'attachment; filename="test pdf-' + '.pdf"') //设置文件名称
      res.set('Content-Length', buffer.length)
      res.end(buffer, 'binary')
      // 确认传输pdf结束
      resolve()
    })

    const doc = new PdfKit({
      size: 'A4',
      margins: {
        top: 85,
        bottom: 75,
        left: 45,
        right: 45
      },
      bufferPages: true
    })
    doc.font(pathresolve('public/font/NotoSansCJKscRegular.otf'))
    doc.lineWidth(0.2)
    doc.fillOpacity(0.8)
    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right

    const tbLike = new PdfTableLike(doc)
    const pdfText = new PdfText(doc)
    pdfText.setDefaultColor('#4A4C4F')
    const pdfTitle = new PdfTitle(doc)

    const { addIcon } = new PdfSvg(doc)
    const renderHealthState = (
      type: string,
      text: string,
      pos: any = {},
      textOptions: any = {}
    ) => {
      addIcon(type?.toUpperCase() as 'WARN', pos.x, pos.y - 1, { size: 16 })
      if (textOptions.width) {
        // 计算icon的占位
        textOptions.width -= 15
      }
      pdfText.text(text, pos.x + 12 + 3, pos.y, {
        fontSize: 10,
        ...textOptions
      })
    }

    // 封面
    doc.image(pathresolve('public/icon/inspection.bg.page.png'), 0, 0, {
      width: doc.page.width,
      height: doc.page.height
    })
    let headerMarginTop = 600
    const getWidthFromPx = (px: number) => (px * doc.page.width) / 794
    if (
      pdfText.heightOfString(body?.header, {
        width: getWidthFromPx(400),
        fontSize: 60
      }) > pdfText.heightOfString(body?.header)
    ) {
      headerMarginTop = 560
    }
    pdfText.text(body?.header, getWidthFromPx(100), (headerMarginTop * doc.page.height) / 1123, {
      fontSize: 60,
      fillColor: 'black',
      lineGap: -20
    })

    // 页眉页脚插件
    const pdfPagePlugin = new PdfPage(doc)
    pdfPagePlugin.setHeaderText(body.header)
    // 目录插件
    const catalog = new PdfCatalog({ pdf: doc, page: pdfPagePlugin })
    catalog.addCatalog(body.catalog)
    catalog.collect()

    // 目录页不计算页数，install在目录创建完成之后。
    pdfPagePlugin.install()
    // 新增一页，手动跳过目录页，避免人工编辑。
    doc.addPage()

    // 巡检概述
    const { describe } = body
    const { declaration, desc } = describe
    pdfTitle.first(body.describe.title)
    pdfTitle.second(desc.title)
    pdfText.text(desc.desc)
    doc.y += 15

    pdfTitle.second(declaration.title)
    pdfText.text(declaration.desc)

    // 巡检总结
    const { overview } = body
    pdfTitle.first(overview.title)
    pdfTitle.second(overview.overview.title)
    // 基本信息
    const { basicInfo, platformInfo } = overview.overview

    const _platformInfo = cloneDeep(platformInfo)
    _platformInfo.value = Object.assign({}, platformInfo.value, {
      empty: { title: ' ', value: ' ' }
    })
    const reportPlatformData = await this.service.getReportPlatformData(sessionId)
    Object.entries(reportPlatformData).forEach(([key, value]) => {
      _platformInfo.value[key].value = value
    })
    ;[basicInfo, _platformInfo].forEach((info, index) => {
      tbLike.addRow([
        {
          text: `- ${info.title} -`,
          textOptions: { align: 'center', fillColor: 'black' },
          options: { fillColor: '#E6F6FF', padding: [5, 0] }
        }
      ])

      const cellList = Object.entries(info.value)
        .map(([key, item]: [string, any]) => {
          return [item.title, item.value].map((text: any, isValue: any) => {
            const prop = {
              text,
              options: {
                fillColor: isValue ? 'white' : '#F5F7FA',
                width: isValue ? contentWidth / 2 - 100 : 100
              }
            } as CellProps
            // 健康评分需要字体设置颜色
            if (index === 0 && key === 'healthGrade' && isValue) {
              const grade = parseInt(text)
              let color = '#FF9000'
              if (grade < 60) {
                color = '#F93940'
              }
              if (grade > 80) {
                color = '#57D344'
              }
              prop.textOptions = {
                fillColor: color,
                fontSize: 11
              }
            }
            return prop
          })
        })
        .flat()

      // 信息总览的数据， 四个单元格组成一行。
      const OneRowCellNumber = 4
      for (let i = OneRowCellNumber; i <= cellList.length; i += OneRowCellNumber) {
        const row = cellList.slice(i - OneRowCellNumber, i)
        tbLike.addRow(row)
      }
    })
    doc.y += 15

    // 相关巡检资源
    const { relateResource } = overview
    pdfTitle.second(relateResource.title)
    const resourceData = await this.service.getResourceData(sessionId)
    const relateCellList = Object.entries(relateResource.value)
      .map(([type, info]: [string, any]) => {
        // type like vm\host ect.
        const inventory = resourceData[type]
        const valueText = Object.entries(info?.value)
          .map(([key, title]: [string, string]) => `${title}: ${inventory[key]}`)
          .join(', ')

        return [info?.title, valueText].map(
          (text, isValue) =>
            ({
              text,
              options: {
                fillColor: isValue ? 'white' : '#F5F7FA',
                width: isValue ? contentWidth / 2 - 100 : 100
              }
            }) as CellProps
        )
      })
      .flat()
    const OneRowCellNumber = 4
    for (let i = OneRowCellNumber; i <= relateCellList.length; i += OneRowCellNumber) {
      const row = relateCellList.slice(i - OneRowCellNumber, i)
      tbLike.addRow(row)
    }

    // 巡检结果
    const { result } = body
    const { define, item, errorItem } = result
    pdfTitle.first(result.title)
    pdfTitle.second(define.title)

    // 巡检结果定义
    const pdfTable = new PdfTable(doc)
    const defineData = define.value
    const defineWidthList = [105, 105, contentWidth - 105 * 2]
    const defineBodyFillColor = ['#F5F7FA']
    const defineHeaderList = defineData?.headers?.map((header, index) => ({
      ...header,
      width: defineWidthList[index],
      bodyFillColor: defineBodyFillColor[index],
      render:
        header.id === 'result'
          ? ({ data, pos }) => renderHealthState(data.healthState, data.result, pos)
          : undefined
    }))
    pdfTable.addHeader(defineHeaderList)
    pdfTable.addBody(defineData?.data, { mergeSameColumns: ['classify'] })
    doc.y += 15

    // 巡检项结果
    pdfTitle.second(item.title)
    const itemWidthList = [75, 150, 75, contentWidth - 300]
    pdfTable.addHeader(
      item.headers.map(
        (header, index) =>
          ({
            ...header,
            width: itemWidthList[index],
            bodyFillColor: defineBodyFillColor[index],
            render:
              header.id === 'result'
                ? ({ data, pos }) => renderHealthState(data.healthState, data.result, pos)
                : undefined
          }) as HeaderProp
      )
    )
    pdfTable.addBody(item.value, { mergeSameColumns: ['type'] })
    doc.y += 30

    // 异常巡检项详情
    pdfTitle.second(errorItem.title)

    const dataList = body?.data
    dataList?.forEach((item, index) => {
      if (index) {
        doc.y += 15
      }
      const marginX = doc.x
      pdfTitle.third(item.title)
      doc.y -= 15

      if (item?.children?.length) {
        item?.children?.forEach(child => {
          doc.y += 15

          pdfTitle.fourth(child.title, pos => {
            addIcon(child?.state, pos.x, pos.y - 1, { size: 16 })
            pdfText.text(child?.result, pos.x + 12 + 3, pos.y, {
              fontSize: 10
            })
          })

          if (child.data?.length) {
            doc.fontSize(10)
            const table = new PdfTable(doc)
            const renderMap = {
              // link disabled
              // resourceName: ({ data, pos }) => {
              //   pdfText.text(data.resourceName, pos.x, pos.y, {
              //     fillColor: data.link ? 'blue' : undefined,
              //     link: data.link
              //   })
              // }
            }
            table.addHeader(
              child.headers.map(header => {
                const key = header.id
                const render = ({ data, pos, cell: { width } }) => {
                  const value = data[key]
                  if (['string', 'undefined'].includes(typeof value)) {
                    return pdfText.text(value || '-', pos.x, pos.y, {
                      fontSize: 10,
                      width
                    })
                  }
                  renderHealthState(value?.level, value?.value, pos, {
                    width
                  })
                }

                return {
                  ...header,
                  width: contentWidth / child.headers.length,
                  render
                }
              })
            )
            table.addBody(child.data)

            // 移回行首，重置为margin
            doc.x = marginX
          }

          if (child.critical || child.warn) {
            doc.y += 12
            const textWidth = contentWidth
            let afterY = doc.y

            const printInfo = (type: 'critical' | 'warn') => {
              if (child[type]) {
                doc.y += 12
                addIcon(type.toUpperCase() as 'CRITICAL', marginX + 12, doc.y - 2, { size: 16 })
                pdfText.text(`${child[type]?.title}：`, marginX + 12 + 16)
                doc.moveDown(0)

                pdfText.text(child[type]?.value, marginX + 28, doc.y, {
                  width: textWidth - 28 - 12
                })
              }
            }

            const print = () => {
              printInfo('critical')
              printInfo('warn')
            }

            // z-index不可控制. 先画底框再写提示
            let rectHeight = 12
            if (child.critical) {
              rectHeight +=
                24 +
                doc.heightOfString(child.critical?.value, {
                  width: textWidth - 28 - 12
                })
            }
            if (child.warn) {
              rectHeight +=
                24 +
                doc.heightOfString(child.warn?.value, {
                  width: textWidth - 28 - 12
                })
            }

            // 提示超出页面, 换页
            if (doc.y + rectHeight > doc.page.maxY()) {
              doc.addPage()
              afterY = doc.y
            }
            doc
              .rect(doc.x, doc.y, textWidth, rectHeight)
              .lineWidth(0.5)
              .fillAndStroke('#F5F7FA', '#DFE1E4')

            print()

            doc.y = afterY + rectHeight
          }
        })
      } else {
        doc.y += 9
        pdfText.text('无异常巡检项', { fillColor: '#96989B' })
      }
    })

    pdfPagePlugin.uninstanll()
    catalog.end()

    doc.pipe(writeStream)
    doc.end()
  }
}

interface TitleValue {
  title: string
  value: any
}
interface PdfBody {
  data: any[]
  describe: {
    title: string
    desc: {
      title: string
      desc: string
    }
    declaration: {
      title: string
      desc: string
    }
  }
  overview: {
    title: string
    overview: {
      title: string
      basicInfo: {
        title: string
        value: {
          [key: string]: TitleValue
        }
      }
      platformInfo: {
        title: string
        value: {
          [key: string]: TitleValue
        }
      }
    }
    relateResource: TitleValue
  }
  result: {
    title: string
    define: TitleValue
    item: TitleValue & {
      headers: any[]
    }
    errorItem: TitleValue
  }
  actionName: string
  actionId: string
  catalog: string
  header: string
}
