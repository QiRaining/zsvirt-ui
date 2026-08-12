/* tslint:disable */
import { Controller, Get, Inject, Query, Res } from '@nestjs/common'

// import { Cache } from 'cache-manager'
// import { CacheService, Cache } from '@/common/cache'
import { Cache, CacheService } from '@/common/cache'
import { PUBLIC_DIR } from '@/common/paths'
// import { Cache }

const Fuse = require('fuse.js')
const fs = require('fs')
const path = require('path')

const DOC_DATA = 'DOC_DATA'
const DOC_INDEX = 'DOC_INDEX'
const DEFAULT_LANGUAGE = 'zh-CN'

@Controller('api/search')
export class SearchController {
  // @Inject(CACHE_MANAGER) private cacheManager
  @Inject() private cacheService: CacheService

  @Get('/doc')
  async searchDoc(
    @Query('q') q,
    @Query('language') language = 'zh-CN',
    @Res() res
  ): Promise<string> {
    const results = await this._searchDoc(q, language)
    return res.set({ 'Content-Type': 'application/json' }).json(results)
  }

  @Cache<any>({ ttl: 60 * 24 * 1 })
  async _searchDoc(q = '', language = 'zh-CN'): Promise<string> {
    console.log('search - params', q, language)
    let docData = await this.cacheService.get(DOC_DATA)
    if (!docData) {
      docData = JSON.parse(
        fs
          .readFileSync(path.resolve(PUBLIC_DIR, 'doc/search/data.json'))
          .toString()
      )
      await this.cacheService.set(DOC_DATA, docData)
    }
    let docIndex = await this.cacheService.get(DOC_INDEX)
    if (!docIndex) {
      docIndex = JSON.parse(
        fs
          .readFileSync(
            path.resolve(PUBLIC_DIR, 'doc/search/fuse-index.json')
          )
          .toString()
      )
      await this.cacheService.set(DOC_INDEX, docIndex)
    }

    const parsedDocIndex = Fuse.parseIndex(docIndex)

    const options = {
      // isCaseSensitive: false,
      includeScore: true,
      // shouldSort: true,
      includeMatches: true,
      findAllMatches: true,
      // minMatchCharLength: 1,
      // location: 0,
      // threshold: 0.4,
      // distance: 100,
      // useExtendedSearch: false,
      ignoreLocation: true,
      // ignoreFieldNorm: false,
      // keys: ['chapter', 'topic', 'article', 'content', 'language']
      keys: [
        {
          name: 'article',
          weight: 100
        },
        {
          name: 'content',
          weight: 1
        },
        {
          name: 'chapter',
          weight: 0.1
        },
        {
          name: 'topic',
          weight: 0.1
        },
        {
          name: 'language',
          weight: 0.01
        }
      ]
    }

    // initialize Fuse with the index
    const fuse = new Fuse(docData, options, parsedDocIndex)
    const query = {
      $and: [
        {
          $or: [{ article: q }, { content: q }, { chapter: q }, { topic: q }]
        },
        {
          $path: ['language'],
          $val: `=${language || DEFAULT_LANGUAGE}`
        }
      ]
    }
    const results = fuse.search(query)
    const qLength = q?.length || 0
    for (const result of results) {
      const customMatches = [[], []]
      result?.matches?.forEach(matchItem => {
        if (matchItem.key === 'language') {
          return
        }
        matchItem?.indices?.forEach(indicesItem => {
          if (
            qLength - (indicesItem[1] - indicesItem[0]) === 1 &&
            q === matchItem?.value.slice(indicesItem[0], indicesItem[1] + 1)
          ) {
            result.score = result.score > 0 ? result.score - 1 : result.score
          }
        })
        if (result.score <= 0) {
          customMatches[0].push(matchItem)
        } else {
          customMatches[1].push(matchItem)
        }
      })
      result.matches = [...customMatches[0], ...customMatches[1]].slice(0, 4)
      result.item.content = null
    }
    results.sort((a, b) => a.score - b.score)
    return results
  }
}
