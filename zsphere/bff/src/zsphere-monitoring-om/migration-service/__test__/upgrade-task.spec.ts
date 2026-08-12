import { extractUpgradeVersionFromJobData } from '../upgrade-task'

describe('extractUpgradeVersionFromJobData', () => {
  it('extracts four-part migration service versions from the package URL', () => {
    expect(
      extractUpgradeVersionFromJobData(
        JSON.stringify({
          url: 'upload://ZMigrate-10.1.122.10.tar.gz'
        })
      )
    ).toBe('10.1.122.10')
  })

  it('keeps supporting three-part versions', () => {
    expect(
      extractUpgradeVersionFromJobData(
        JSON.stringify({
          url: 'https://example.test/ZMigrate-10.1.119.tar.gz'
        })
      )
    ).toBe('10.1.119')
  })
})
