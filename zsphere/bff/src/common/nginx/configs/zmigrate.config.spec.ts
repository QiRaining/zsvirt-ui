import { zmigrateProxyConfig } from './zmigrate.config'

function locationBlock(pattern: string): string {
  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = zmigrateProxyConfig.serverTemplate.match(
    new RegExp(`location ${escapedPattern} \\{([\\s\\S]*?)\\n\\}`)
  )

  expect(match).not.toBeNull()
  return match?.[1] ?? ''
}

describe('zmigrate nginx cache policy', () => {
  it.each([
    '^~ /zmigrate-ui/',
    '= /zmigrate-core-shell/mf-manifest.json',
    '= /zmigrate-app/mf-manifest.json'
  ])('prevents stale shell metadata in %s', pattern => {
    const block = locationBlock(pattern)

    expect(block).toContain('proxy_hide_header Cache-Control;')
    expect(block).toContain('proxy_hide_header Expires;')
    expect(block).toContain(
      'add_header Cache-Control "no-cache, no-store, must-revalidate" always;'
    )
  })

  it.each(['^~ /zmigrate-core-shell/', '^~ /zmigrate-app/'])(
    'caches fingerprinted assets in %s',
    pattern => {
      expect(locationBlock(pattern)).toContain(
        'add_header Cache-Control "public, max-age=31536000, immutable" always;'
      )
    }
  )
})

describe('zmigrate nginx compression policy', () => {
  it.each([
    '^~ /zmigrate-ui/',
    '= /zmigrate-core-shell/mf-manifest.json',
    '^~ /zmigrate-core-shell/',
    '= /zmigrate-app/mf-manifest.json',
    '^~ /zmigrate-app/'
  ])('compresses frontend resources in %s', pattern => {
    const block = locationBlock(pattern)

    expect(block).toContain('gzip on;')
    expect(block).toContain('gzip_comp_level 6;')
    expect(block).toContain('gzip_min_length 1024;')
    expect(block).toContain('gzip_vary on;')
    expect(block).toContain(
      'gzip_types text/css application/json application/javascript text/javascript image/svg+xml;'
    )
  })
})
