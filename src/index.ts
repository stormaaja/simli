import { parse } from "./parser"
import { Reader, fileExists } from "./parser/reader"
import { Environment } from "./ast/environment"
import { addSystemFunctions } from "./system"

export function parseFile(filePath: string) {
  return parse(new Reader(filePath))
}

function main(args: string[]) {
  if (args.length < 3) {
    console.error("Not enough params")
  } else {
    const filePath = args[2]
    if (fileExists(filePath)) {
      const ast = parseFile(filePath)
      if (args.indexOf("--debug") > -1) {
        console.log(JSON.stringify(ast, null, 2))
      }
      const checkEnv: Environment = {
        errors: [],
        symbols: {},
        location: {}
      }
      addSystemFunctions(checkEnv)
      ast.check(checkEnv, [])
      if (checkEnv.errors.length > 0) {
        console.error("Compile failed:")
        // console.error(JSON.stringify(checkEnv.errors, null, 2))
        checkEnv.errors.forEach(e => {
          console.error("")
          const { start, file } = e.node.location
          if (start && file) {
            console.error(`${file} ${start.line}:${start.column} ${e.id}`)
          } else {
            console.error(`Unknown: ${e.id}`)
          }
          if (e.details) {
            console.error(e.details)
          }
        })
        console.error("")
      } else {
        if (args.indexOf("--eval") > -1) {
          const env: Environment = {
            errors: [],
            symbols: {},
            location: {}
          }
          addSystemFunctions(env)
          ast.eval(env)
        }
      }
    } else {
      console.error(`File "${filePath}" does not exist.`)
    }
  }
}

main(process.argv)
