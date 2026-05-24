import { join } from 'path'

const reporter = function (/** @type {{ issues: any; cwd: any; }} */ options) {
  const { issues, cwd } = options

  for (const entry of Object.entries(issues)) {
    const [category, records] = entry
    if (records instanceof Set) {
      if (records.size === 0) continue
      const files = [...records]
      const message = `knip ${category}: ${files.length} files`
      console.error(message)
      for (const file of files) {
        const fullPath = join(cwd, file)
        console.info(`${fullPath}`)
      }
    } else {
      const recordEntries = Object.entries(records)
      const issueCount = recordEntries.reduce((acc, [file, fileIssues]) => acc + Object.values(fileIssues).length, 0)
      if (issueCount === 0) continue
      const message = `knip ${category}: ${recordEntries.length} files, ${issueCount} issues`
      console.error(message)
      for (const [file, fileIssues] of recordEntries) {
        for (const issue of Object.values(fileIssues)) {
          const fullPath = join(cwd, file)
          console.info(`${fullPath}:${issue.line}: ${issue.symbol}`)
        }
      }
    }
  }
}

export default reporter
