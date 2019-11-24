import { parse } from "./parser"
import { Reader, fileExists } from "./parser/reader"
import { Environment } from "./ast/environment"
import { addSystemFunctions } from "./system"

function main(args: string[]) {
  if (args.length < 3) {
    console.error("Not enough params")
  } else {
    const filePath = args[2]
    if (fileExists(filePath)) {
      const ast = parse(new Reader(filePath))
      if (args.indexOf("--debug") > -1) {
        console.log(JSON.stringify(ast, null, 2))
      }
      if (args.indexOf("--eval") > -1) {
        const env: Environment = {
          errors: [],
          symbols: {}
        }
        addSystemFunctions(env)
        ast.eval(env)
      }
    } else {
      console.error(`File "${filePath}" does not exist.`)
    }
  }
}

main(process.argv)
