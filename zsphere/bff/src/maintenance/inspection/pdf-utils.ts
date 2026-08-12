import { readFileSync } from 'fs'
import { resolve } from 'path'

import { pick } from 'lodash'
import * as PdfKit from 'pdfkit'
import * as SVGtoPDF from 'svg-to-pdfkit'

import { WORKING_DIR } from '@/common/paths'

export const pathresolve = (_path: string) => resolve(WORKING_DIR, _path)

function IText(text: string, x?: number, y?: number, options?: TextMixinProp): typeof PdfKit
function IText(text: string, options?: TextMixinProp): typeof PdfKit
function IText(..._args: any[]) {
  return new PdfKit()
}

export class PdfText {
  private pdf: typeof PdfKit
  private defaultSize = 10
  private defaultColor = 'black'
  constructor(pdf: typeof PdfKit) {
    this.pdf = pdf
    return this
  }

  private _setDefaultStyle = () => {
    this.pdf.fontSize(this.defaultSize)
    this.pdf.fillColor(this.defaultColor)
  }

  text: typeof IText = (...args: [string, ...any[]]) => {
    const doc = this.pdf
    const [text, x_or_option = {}, y, option = {}] = args

    this._setDefaultStyle()
    ;['fontSize', 'fillColor'].forEach(key => {
      ;[x_or_option, option].forEach(_o => {
        if (_o?.[key]) {
          doc[key]?.(_o[key])
          Reflect.deleteProperty(_o, key)
        }
      })
    })
    // if(x_or_option?.fontSize) {
    //   _fontSize = x_or_option.fontSize
    //   Reflect.deleteProperty(x_or_option, 'fontSize')
    // }

    // 每次调用doc.text后重置x坐标，否则会累加
    const marginX = doc.x
    doc.text(text, x_or_option, y, option)
    doc.x = marginX
    return this.pdf
  }

  widthOfString = (text: string, options: TextMixinProp = {}) => {
    const doc = this.pdf
    if (options.fontSize) {
      doc.fontSize(options.fontSize)
      Reflect.deleteProperty(options, 'fontSize')
    }
    return doc.widthOfString(text, options)
  }

  heightOfString = (text: string, options: TextMixinProp = {}) => {
    const doc = this.pdf
    if (options.fontSize) {
      doc.fontSize(options.fontSize)
      Reflect.deleteProperty(options, 'fontSize')
    }
    return doc.heightOfString(text, options)
  }

  setDefaultSize(size: number) {
    this.defaultSize = size
    return this
  }

  setDefaultColor(color: string) {
    this.defaultColor = color
    return this
  }
}

class PdfRect {
  private pdf: PDFKit.PDFDocument
  constructor(pdf: PDFKit.PDFDocument) {
    this.pdf = pdf
    return this
  }
  private _rect: {
    top: () => PDFKit.PDFDocument
    bottom: () => PDFKit.PDFDocument
    left: () => PDFKit.PDFDocument
    right: () => PDFKit.PDFDocument
  }
  private _strokes = ['top', 'right', 'bottom', 'left']
  private _args: [number, number, number, number]

  rect = (x: number, y: number, w: number, h: number) => {
    const doc = this.pdf
    this._args = [x, y, w, h]
    this._rect = {
      top: () => doc.moveTo(x, y).lineTo(x + w, y),
      right: () => doc.moveTo(x + w, y).lineTo(x + w, y + h),
      bottom: () => doc.moveTo(x, y + h).lineTo(x + w, y + h),
      left: () => doc.moveTo(x, y).lineTo(x, y + h)
    }
    return this
  }

  lineWidth = (width: number) => {
    this.pdf.lineWidth(width)
    return this
  }

  fill = (color: string) => {
    this.pdf.rect(...this._args).fill(color)
    return this
  }

  setStroke = (strokes: ('top' | 'bottom' | 'left' | 'right')[]) => {
    this._strokes = strokes
    return this
  }

  stroke = (color: string) => {
    if (this._strokes) {
      Object.entries(this._rect).forEach(([position, getStoke]) => {
        if (this._strokes.includes(position)) {
          getStoke().stroke(color)
        }
      })
    } else {
      this.pdf.rect(...this._args).stroke(color)
    }
  }
}

export class PdfTableLike {
  private rect: PdfRect
  public tableWidth
  private fontSize = 10
  private pdfText: PdfText
  constructor(private pdf: PDFKit.PDFDocument) {
    this.rect = new PdfRect(pdf)
    this.pdfText = new PdfText(pdf)
    this.tableWidth = pdf.page.width - pdf.page.margins.left - pdf.page.margins.right
    return this
  }

  // 测量的宽度的时候，使用的文字大小
  setCellFontSize = (fontSize: number) => (this.fontSize = fontSize)

  addCell = ({ render, options = {}, text, textOptions = {}, data, strokes }: CellProps) => {
    const doc = this.pdf
    const {
      padding = [5, 9],
      x = doc.x,
      y = doc.y,
      fillColor,
      StrokeColor = '#DFE1E4',
      width = this.tableWidth,
      height,
      returnTop
    } = options
    const currentY = doc.y
    // 如果没有设置高度的话，需要计算实际高度和默认高度取值
    let _h = height || 27
    if (text && !height) {
      _h = Math.max(this.getTextHeight(text, width, padding), 27)
    }

    this.rect
      .rect(x, y, width, _h)
      .lineWidth(0.5)
      .setStroke(strokes)
      .fill(fillColor || 'white')
      .stroke(StrokeColor)
    // doc
    //   .rect(x, y, width, _h)
    //   .lineWidth(0.5)
    //   .fillAndStroke(fillColor, StrokeColor)

    // 粗体需要设置字体 ---- todo
    const [t = 0, r = 0] = padding
    const [, , , l = r] = padding
    const pos = {
      x: x + l,
      y: y + t
    }
    if (render) {
      render({
        pos,
        table: this,
        data,
        cell: { ...textOptions, width: width - l - r }
      })
    } else {
      this.pdfText.text(
        text ?? '-',
        pos.x,
        pos.y,
        Object.assign({ width: width - l - r, fillColor: '#4A4C4F' }, textOptions)
      )
    }
    // docText(text, /- .+ -/.test(text) ? x : padding[1] + x, padding[0] + y, textOptions)
    doc.y = currentY + height
    if (returnTop) {
      doc.y = currentY
    }
    return doc
  }

  private getTextHeight = (text: string, width?: number, padding: number[] = [5, 9]) => {
    const [t, r] = padding
    const [, , b = t, l = r] = padding
    const options: any = {}
    if (width) {
      options.width = width - r - l
    }
    this.pdf.fontSize(this.fontSize)
    return this.pdf.heightOfString(text, options) + t + b
  }

  addRow = (propList: CellProps[], data?: any) => {
    const heightList = propList.map(({ text, options }) => {
      const { width, padding } = options || {}
      return this.getTextHeight(text, width, padding)
    })
    const height = Math.max(...heightList)
    // 超出页面高度时，换页
    if (this.pdf.y + height > this.pdf.page.maxY()) {
      this.pdf.addPage()
    }

    propList.forEach((prop, index) => {
      const { options, ...res } = prop
      this.addCell({
        ...res,
        data,
        options: Object.assign({}, options, {
          // x 坐标要行内累加
          x:
            this.pdf.x +
            propList.slice(0, index).reduce((acc, cur) => acc + cur.options.width || 0, 0),
          height,
          returnTop: index !== propList.length - 1
        })
      })
    })
  }
}

export class PdfTable extends PdfTableLike {
  private headers: HeaderProp[]

  addHeader = (propList: HeaderProp[]) => {
    this.headers = propList
    const cellPropList = propList.map(prop => ({
      text: prop.header,
      options: {
        width: this.tableWidth / this.headers.length,
        fillColor: '#F5F7FA',
        ...prop
      }
    }))
    this.addRow(cellPropList)
  }

  addBody = (dataList: any[], { mergeSameColumns = [] }: BoydConfig = {}) => {
    const sameKey = mergeSameColumns.pop()
    const sameMap = {} as any
    if (sameKey) {
      dataList.forEach(data => {
        if (sameMap?.[data[sameKey]]) {
          sameMap[data[sameKey]].count += 1
        } else {
          sameMap[data[sameKey]] = {
            first: true,
            count: 1
          }
        }
      })
    }
    const sameValueList = Object.entries(sameMap)
      .filter(([, value]) => (value as any)?.count > 1)
      .map(([key]) => key)

    dataList.map(data => {
      const cellList = this.headers.map(hd => {
        let text = data?.[hd.id]

        let strokes
        if (hd.id === sameKey && sameValueList.includes(text) && sameMap[text]) {
          if (sameMap[text].first) {
            strokes = ['left', 'right', 'top']
            sameMap[text].count--
            sameMap[text].first = false
          } else if (sameMap[text].count > 1) {
            strokes = ['left', 'right']
            sameMap[text].count--
            text = ''
          } else {
            strokes = ['bottom', 'left', 'right']
            text = ''
          }
        }

        return {
          text,
          options: Object.assign(
            { fillColor: hd.bodyFillColor || 'white' },
            pick(hd, ['width', 'padding'])
          ),
          render: hd.render,
          strokes
        } as CellProps
      })

      this.addRow(cellList, data)
    })
  }
}

export class PdfTitle {
  private pdfText: PdfText
  constructor(private pdf: typeof PdfKit) {
    this.pdfText = new PdfText(pdf)
    this.pdfText.setDefaultColor('#181A1D')
    return this
  }

  private numberList = [0]

  private claerAfterNumber = (index: number) => {
    for (let i = index + 1; i < this.numberList.length; i++) {
      this.numberList[i] = 0
    }
  }

  private initList = (index: number) => {
    while (this.numberList.length <= index) {
      this.numberList.push(0)
    }
  }

  private getPre = (index: number, split = '.') => this.numberList.slice(0, index).join(split)

  getFormat = ({ index, split = '.', margin = [0, 0] }) => {
    return (text: string, textOptions?: any) => {
      const _index = index
      this.initList(_index)

      const pre = this.getPre(_index, split)
      const preText = pre ? `${pre}${split}` : ''
      const entireTitle = `${preText}${++this.numberList[_index]} ${text}`

      this.pdf.y += margin[0]
      // create anchor for text
      this.pdfText.text(entireTitle, Object.assign({ destination: entireTitle }, textOptions))
      this.pdf.y += margin[1]

      this.claerAfterNumber(_index)

      // 标题要触发目录收集
      this.pdf.emit('titleAdded', { title: entireTitle, level: index + 1 })
    }
  }

  first = (text: string) =>
    this.getFormat({ index: 0, margin: [30, 15] })(text, {
      align: 'center',
      fontSize: 18
    })
  second = (text: string) => this.getFormat({ index: 1, margin: [0, 9] })(text, { fontSize: 15 })
  third = (text: string) => this.getFormat({ index: 2, margin: [0, 15] })(text, { fontSize: 12 })

  fourth = (text: string, renderAfter?: Function) => {
    const index = 3
    this.initList(index)

    const contentText = `(${++this.numberList[index]}) ${text} : `
    this.pdfText.text(contentText, { fontSize: 10 })

    if (renderAfter) {
      const pos = {
        x: this.pdf.x + this.pdf.widthOfString(contentText),
        y: this.pdf.y - this.pdf.heightOfString(contentText)
      }
      renderAfter(pos)
    }
    this.pdf.y += 9
  }
}

export class PdfPage {
  private pdf: typeof PdfKit
  private pdfText: PdfText
  pageNumber = 0
  private headerText = '巡检报告'

  constructor(pdf: typeof PdfKit) {
    this.pdfText = new PdfText(pdf)
    this.pdfText.setDefaultColor('#707275')
    this.pdf = pdf
    return this
  }

  setHeaderText = (text: string) => (this.headerText = text)

  addHeader = () => {
    const doc = this.pdf
    const top = doc.page.margins.top
    const left = doc.page.margins.left
    const right = doc.page.margins.right
    doc.page.margins.top = 0

    this.pdfText.text(this.headerText, left, top - 45, { lineBreak: false })
    this.pdf.moveDown()
    this.pdf.moveTo(doc.x, doc.y + 8)
    this.pdf.lineTo(doc.x + doc.page.width - left - right, doc.y + 8).stroke('#D8D8D8')
    doc.y = top

    doc.page.margins.top = top
  }

  addFooter = () => {
    const doc = this.pdf
    const bottom = doc.page.margins.bottom
    doc.page.margins.bottom = 0

    this.pdfText.text(
      `- ${this.pageNumber} -`,
      0.5 * (doc.page.width - doc.widthOfString(`- ${this.pageNumber} -`)),
      doc.page.height - 45,
      { align: 'center', lineBreak: false }
    )
    doc.y = doc.page.margins.top
    doc.page.margins.bottom = bottom
  }

  private footer_header = () => {
    // 新的一页可能会出现文字换页的情况，需要重置回原有的样式
    const fillColor = (this.pdf as any)._fillColor as [any]
    const fontSize = (this.pdf as any)._fontSize

    this.addFooter()
    this.addHeader()

    this.pdf.fillColor(...fillColor)
    this.pdf.fontSize(fontSize)
  }

  install = () => {
    this.pdf.on('pageAdded', () => this.pageNumber++)
    this.pdf.on('pageAdded', this.footer_header)
  }
  uninstanll = () => this.pdf.removeListener('pageAdded', this.footer_header)
}

export class PdfCatalog {
  private pdf: PDFKit.PDFDocument
  private pdfPage: PdfPage
  private pdfText: PdfText
  private catalogIndex
  private startY: number
  // 目录列表
  private logList = []
  constructor({ pdf, page }: { pdf: PDFKit.PDFDocument; page: PdfPage }) {
    this.pdf = pdf
    this.pdfPage = page

    this.pdfText = new PdfText(pdf)
    this.pdfText.setDefaultColor('#181A1D')
  }

  private listener = ({ title, level }) => {
    this.logList.push({
      title,
      level,
      pageNumber: this.pdfPage.pageNumber
    })
  }

  collect = () => this.pdf.on('titleAdded', this.listener)

  // 添加目录页，并记录目录所在的位置
  addCatalog = (catalogText = '目录') => {
    this.pdf.addPage()
    this.catalogIndex = this.pdf.bufferedPageRange().count - 1
    this.pdfPage.addHeader()
    this.pdfText.text(catalogText, { fontSize: 24, align: 'center' })
    this.startY = this.pdf.y + 30 - 15
  }

  private paddingLeft = 15
  private levelSizeMap = [, 16, 14, 14]
  // 计算所需点的数量
  private caculate = (log: CatalogTitle) => {
    const fontSize = this.levelSizeMap[log.level]
    const defaultWidth =
      this.pdfText.widthOfString(`${log.title}  `, { fontSize }) +
      this.pdfText.widthOfString(`${log.pageNumber}`, { fontSize: 14 })
    const page = this.pdf.page
    const dot = '.'

    const leftWidth =
      page.width -
      page.margins.left -
      page.margins.right -
      defaultWidth -
      this.paddingLeft * (log.level - 1)
    const dotWidth = this.pdfText.widthOfString(dot, { fontSize })
    let number = Math.floor(leftWidth / dotWidth)
    let dotStr = ''
    while (number--) {
      dotStr += dot
    }
    return dotStr
  }

  private getLogText = (log: CatalogTitle) => `${log.title} ${this.caculate(log)} `

  // 结束收集目录并打印
  end = () => {
    const levelMarginTop = [, 15, 9, 9]
    this.pdf.removeListener('titleAdded', this.listener)

    this.pdf.switchToPage(this.catalogIndex)
    this.pdf.y = this.startY
    this.logList.forEach(log => {
      const logText = this.getLogText(log)
      const options = {
        fontSize: this.levelSizeMap[log.level],
        goTo: log.title // link to title
      }

      if (log.level === 3) {
        options['fillColor'] = '#4A4C4F'
      }

      const paddingLeft = this.paddingLeft * (log.level - 1)
      this.pdf.y += levelMarginTop[log.level]
      this.pdfText.text(logText, this.pdf.x + paddingLeft, this.pdf.y, options)
      const textHeight = this.pdf.heightOfString(logText)
      this.pdfText.text(
        `${log.pageNumber}`,
        this.pdf.x, // align right this arg can be any number
        this.pdf.y - textHeight,
        Object.assign(options, { fontSize: 14, align: 'right' as any })
      )
    })
  }
}

export class PdfSvg {
  constructor(private pdf: PDFKit.PDFDocument) {}

  addIcon = (
    type: 'NORMAL' | 'CRITICAL' | 'WARN' | 'FAILED',
    x?: number,
    y?: number,
    options = {} as any
  ) => {
    const AlertTriangleFill = readFileSync(
      pathresolve('public/icon/alert-triangle-fill.svg')
    ).toString()
    const CheckmarkCircleFill = readFileSync(
      pathresolve('public/icon/checkmark-circle-fill.svg')
    ).toString()
    const { size = 24, ..._options } = options
    const typeMap = {
      NORMAL: {
        color: [50, 203, 85],
        icon: CheckmarkCircleFill
      },
      CRITICAL: {
        color: [249, 57, 64],
        icon: AlertTriangleFill
      },
      WARN: {
        color: [255, 144, 0],
        icon: AlertTriangleFill
      },
      FAILED: {
        color: [150, 152, 155],
        icon: AlertTriangleFill
      }
    }

    if (!Object.keys(typeMap).includes(type)) {
      return console.error(`add svg args error, type is not expected: ${type}`)
    }

    const { color, icon } = typeMap[type]

    SVGtoPDF(this.pdf, icon.replace('24px', `${size}px`), x, y, {
      colorCallback: () => [color, 1],
      ..._options
    })
  }

  addSvg = (svgPath: string, x?: number, y?: number, options?: SVGtoPDF.Options) => {
    SVGtoPDF(this.pdf, readFileSync(pathresolve(svgPath)).toString(), x, y, options)
  }
}

interface TextMixinProp extends PDFKit.Mixins.TextOptions {
  fillColor?: string
  fontSize?: number
}

interface BoydConfig {
  mergeSameColumns?: string[]
}

export interface HeaderProp extends Pick<
  CellOptions,
  'padding' | 'fillColor' | 'StrokeColor' | 'width' | 'height' | 'render'
> {
  id: string
  header: string
  bodyFillColor?: string
  render: CellProps['render']
}

interface CellOptions {
  padding?: number[]
  fillColor?: string
  StrokeColor?: string
  width?: number
  height?: number
  returnTop?: boolean
  x?: number
  y?: number
  [key: string]: any
}

export interface CellProps {
  text: string // 用于测量文本所占的高度
  data?: any // 该单元格所在的行数据
  render?: (prop: {
    table: PdfTableLike
    data: any
    cell: any
    pos: {
      x: number
      y: number
    }
  }) => any
  textOptions?: TextMixinProp
  strokes?: ('top' | 'bottom' | 'left' | 'right')[]
  options: CellOptions
}

interface CatalogTitle {
  title: string
  pageNumber: number
  level: number
}
