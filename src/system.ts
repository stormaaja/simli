import { Environment } from "./ast/environment"
import { SystemFunctionNode } from "./ast/function_node"
import { ASTNode } from "./ast/ast_node"

export function addSystemFunctions(env: Environment) {
  env.symbols.import = new SystemFunctionNode(
    "import",
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
              k,
              (env: Environment, args: ASTNode[]) => {
                importNs[k].apply(
                  null,
                  args.map(a => a.getTypedValue())
                )

                return null
              }
            ))
        )
      } else {
        throw new Error("Non-JS require not implemented yet")
      }
      return null
    }
  )
}
