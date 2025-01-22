const fs = require('fs')
const glob = require('glob')

;(async () => {
  const targetComponentPath = 'apps/docs/public/README.json'
  const readmeObject = transformDocsToJson('libs/**/README.md')
  const sortedArray = readmeObject.sort((a, b) => a.module?.localeCompare(b.module))
  fs.writeFileSync(targetComponentPath, JSON.stringify(sortedArray))
  console.log(`Readme template has been generated at: ${targetComponentPath}`)
})()

function transformDocsToJson(...paths) {
  const pathString = paths?.length > 1 ? `{${paths.join(',')}}` : paths[0]
  try {
    const readmeFilesToRead = glob.sync(pathString)
    return readmeFilesToRead
      .map((readmeFile) => {
        try {
          const data = fs.readFileSync(readmeFile, 'utf-8')
          const parts = readmeFile.split('\\')
          const secondToLastPart = parts[parts?.length - 2]
          return {
            path: readmeFile.substring(0, readmeFile.lastIndexOf('\\')),
            data: data,
            module: secondToLastPart,
          }
        } catch (readFileError) {
          console.error(`Error reading file ${readmeFile}:`, readFileError)
          return null
        }
      })
      .filter(Boolean)
  } catch (error) {
    console.error('Error in readDocs:', error)
    return []
  }
}
