import { ASTNode } from "./ast_node"
import { PositionRange } from "./position"
import { Environment, createError } from "./environment"
import { UnidentifiedNode } from "../system"

export class FNCallNode extends ASTNode {
  id: string

  constructor(children: ASTNode[], location: PositionRange) {
    super("fnCall", children.slice(1), location)
    this.id = children[0].toString()
  }

  eval(env: Environment, _: ASTNode[] = []): ASTNode | null {
    env.location = this.location
    return env.symbols[this.id].eval(env, this.children)
  }

  check(env: Environment, args: ASTNode[] = []): ASTNode {
    if (env.symbols[this.id]) {
      const callArgs = this.children
      const node = env.symbols[this.id].check(env, callArgs)
      const fnArgs = node.children[1].children
      if (fnArgs[fnArgs.length - 1].type === "varargs") {
        if (this.children.length < fnArgs.length - 1) {
          env.errors.push(
            createError(
              this,
              "wrongNumberArguments",
              `${this.id}: At least ${fnArgs.length - 1} expected, ${
                callArgs.length
              } got`
            )
          )
        } else {
          callArgs.map(c => c.check(env, args))
        }
      } else {
        if (this.children.length !== fnArgs.length) {
          env.errors.push(
            createError(
              this,
              "wrongNumberArguments",
              `${this.id}: ${fnArgs.length} expected, ${callArgs.length} got`
            )
          )
        } else {
          callArgs.map(c => c.check(env, args))
        }
      }
    } else {
      env.errors.push(createError(this, "functionNotFound"))
    }
    return this
  }
}

export interface CheckParams {
  node: ASTNode
  env: Environment
  args: ASTNode[]
}

export class SystemFunctionNode extends FunctionNode {
  evalFunction: (env: Environment, args: ASTNode[]) => ASTNode | null
  checkFunction: (params: CheckParams) => ASTNode

  constructor(
    args: ASTNode[],
    evalFunction: (env: Environment, args: ASTNode[]) => ASTNode | null,
    checkFunction: (params: CheckParams) => ASTNode
  ) {
    super(
      "function",
      [new UnidentifiedNode(), new ASTNode("block", args, {})],
      {}
    )
    this.evalFunction = evalFunction
    this.checkFunction = checkFunction
  }

  eval(env: Environment, args: ASTNode[]): ASTNode | null {
    return this.evalFunction(env, args)
  }

  check(env: Environment, args: ASTNode[] = []): ASTNode {
    return this.checkFunction({
      node: this,
      env,
      args
    })
  }
}

export class FunctionNode extends ASTNode {
  args: ASTNode[]

  constructor(children: ASTNode[], location: PositionRange) {
    super("function", children, location)
    this.args = children[1].children
  }

  eval(env: Environment, args: ASTNode[] = []): ASTNode | null {
    const symbols = Object.assign({}, env.symbols)
    args.forEach((a, i) => {
      env.symbols[this.args[i].toString()] = a
    })
    const values = this.children.map(c => c.eval(env))
    env.symbols = symbols
    return values[values.length - 1]
  }

  check(env: Environment, args: ASTNode[] = []): ASTNode {
    const symbols = Object.assign({}, env.symbols)
    args.forEach((a, i) => {
      env.symbols[this.args[i].toString()] = a
    })
    const results = this.children.slice(1).map(c => c.check(env, args))
    env.symbols = symbols
    return results[results.length - 1]
  }
}
