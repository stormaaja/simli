import { Environment } from "./ast/environment"
import { SystemFunctionNode } from "./ast/function_node"
import { ASTNode } from "./ast/ast_node"

export function addSystemFunctions(env: Environment) {
  env.symbols.prn = new SystemFunctionNode("prn", (args: ASTNode[]) => {
    console.log(args.map(a => a.toString()).join(" "))
    return null
  })
}
