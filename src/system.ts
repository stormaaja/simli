import { Environment } from "./ast/environment"
import { SystemFunctionNode, FunctionNode } from "./ast/function_node"
import { ASTNode } from "./ast/ast_node"
import { parseFile } from "."
import { PositionRange } from "./ast/position"
import { ValueNode } from "./ast/value_node"

function createSymbol(id: string, position?: PositionRange) {
  return new ValueNode("symbol", id, position || {})
}

export function addSystemFunctions(env: Environment) {
  env.symbols.import = new SystemFunctionNode(
    [createSymbol("ns"), createSymbol("alias")],
    (env: Environment, args: ASTNode[]) => {
      const ns = args[0].toString().split("/")
      const alias = args[1].toString()
      if (ns.length > 2) {
        throw new Error(
          "No deeper than one level require is currently supported"
        )
      }
      if (ns[0] === "js") {
        const anyGlobal = global as any
        const importNs = anyGlobal[ns[1]]
        const fnKeys = Object.keys(importNs).filter(
          k => typeof importNs[k] === "function"
        )
        fnKeys.forEach(
          k =>
            (env.symbols[`${alias}/${k}`] = new SystemFunctionNode(
              [createSymbol(k)],
              (env: Environment, args: ASTNode[]) => {
                importNs[k].apply(
                  null,
                  args.map(a => {
                    const value = a.eval(env, args)
                    if (value) {
                      return value.getTypedValue()
                    } else {
                      return null
                    }
                  })
                )

                return null
              }
            ))
        )
      } else {
        const importedAst = parseFile(`${ns.join("/")}.simli`)
        importedAst.eval(env, args)
      }
      return null
    }
  )
  env.symbols.def = new SystemFunctionNode(
    [createSymbol("symbol"), createSymbol("value")],
    (env: Environment, args: ASTNode[]) => {
      env.symbols[args[0].toString()] = args[1]
      return null
    }
  )
  env.symbols.fn = new SystemFunctionNode(
    [createSymbol("symvol"), createSymbol("args"), createSymbol("body")],
    (env: Environment, args: ASTNode[]) => {
      return new FunctionNode(args, env.location)
    }
  )
}
