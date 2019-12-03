import { Environment, createError } from "./ast/environment"
import {
  SystemFunctionNode,
  FunctionNode,
  CheckParams
} from "./ast/function_node"
import { ASTNode } from "./ast/ast_node"
import { parseFile } from "."
import { PositionRange } from "./ast/position"
import { ValueNode } from "./ast/value_node"

function createSymbol(id: string, position?: PositionRange) {
  return new ValueNode("symbol", id, position || {})
}

export class UnidentifiedNode extends ASTNode {
  constructor() {
    super("function", [], {})
  }

  check(env_: Environment, args_: ASTNode[] = []): ASTNode {
    return this
  }
}

function importFunctions(env: Environment, args: ASTNode[]) {
  const ns = args[0].toString().split("/")
  const alias = args[1].toString()
  if (ns.length > 2) {
    throw new Error("No deeper than one level require is currently supported")
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
          },
          (checkParams: CheckParams) => {
            // TODO
            return checkParams.node
          }
        ))
    )
  } else {
    const importedAst = parseFile(`${ns.join("/")}.simli`)
    importedAst.eval(env, args)
  }
}

export function addSystemFunctions(env: Environment) {
  env.symbols.import = new SystemFunctionNode(
    [createSymbol("ns"), createSymbol("alias")],
    (env: Environment, args: ASTNode[]) => {
      importFunctions(env, args)
      return null
    },
    (checkParams: CheckParams) => {
      if (checkParams.args.length !== 2) {
        checkParams.env.errors.push(
          createError(
            checkParams.node,
            "wrongNumberArguments",
            `Import requires 2 params. Got ${checkParams.args.length}`
          )
        )
      } else {
        checkParams.env.symbols[
          checkParams.args[0].toString()
        ] = new UnidentifiedNode()
        checkParams.env.symbols[
          checkParams.args[1].toString()
        ] = new UnidentifiedNode()
        importFunctions(checkParams.env, checkParams.args)
      }
      return checkParams.node
    }
  )
  env.symbols.def = new SystemFunctionNode(
    [createSymbol("symbol"), createSymbol("value")],
    (env: Environment, args: ASTNode[]) => {
      env.symbols[args[0].toString()] = args[1]
      return null
    },
    (checkParams: CheckParams) => {
      if (checkParams.args.length !== 2) {
        checkParams.env.errors.push(
          createError(
            checkParams.node,
            "wrongNumberArguments",
            `Def requires 2 params. Got ${checkParams.args.length}`
          )
        )
      } else {
        checkParams.env.symbols[
          checkParams.args[0].toString()
        ] = new UnidentifiedNode()
      }
      return checkParams.node
    }
  )
  env.symbols.fn = new SystemFunctionNode(
    [
      createSymbol("symbol"),
      createSymbol("args"),
      new ASTNode("varargs", [], {})
    ],
    (env: Environment, args: ASTNode[]) => {
      return new FunctionNode(args, env.location)
    },
    (checkParams: CheckParams) => {
      if (checkParams.args.length < 2) {
        checkParams.env.errors.push(
          createError(
            checkParams.node,
            "wrongNumberArguments",
            `Def requires at least 2 params. Got ${checkParams.args.length}`
          )
        )
      } else {
        checkParams.env.symbols[
          checkParams.args[0].toString()
        ] = new UnidentifiedNode()
      }
      return checkParams.node
    }
  )
}
