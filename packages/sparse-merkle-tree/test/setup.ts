import fs = require('fs')
import path = require('path')
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')

const rootPath = __dirname
const dbRootPath = path.join(__dirname, '.db')

chai.use(chaiAsPromised)
const should = chai.should()


fs.mkdirSync(dbRootPath, { recursive: true })

export { should, dbRootPath }
