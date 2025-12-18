const { pathsToModuleNameMapper } = require('ts-jest')
const path = require('path')

// Load tsconfig.base.json once - this is where all path mappings are defined
const tsconfigBasePath = path.resolve(__dirname, 'tsconfig.base.json')
const { compilerOptions } = require(tsconfigBasePath)

function getModuleNameMapper(prefixPath) {
  return pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: prefixPath,
  })
}

module.exports = {
  getModuleNameMapper,
}
