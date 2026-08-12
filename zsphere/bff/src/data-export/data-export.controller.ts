/* tslint:disable */
import { Controller, Get, Inject, Param, Res } from '@nestjs/common'

import { CacheService } from '@/common/cache'
import { PUBLIC_DIR } from '@/common/paths'
// import { Cache }

const Fuse = require('fuse.js')
const fs = require('fs')
const path = require('path')

@Controller('/api/export')
export class DataExportController {
  // @Inject(CACHE_MANAGER) private cacheManager
  @Inject() private cacheService: CacheService

  @Get(':fileName')
  async searchDoc(@Param('fileName') fileName: string) {
    if (!fileName) {
      return 'fileName is required'
    }
    const filePath = path.resolve(PUBLIC_DIR, 'exports', fileName)
    const data = fs.readFileSync(filePath).toString()

    fs.rm(filePath, { force: true }, err => {
      if (err) {
        console.error(`[EORROR] Failed to delete file: ${filePath}`, err)
      }
    })

    return data
  }
}
