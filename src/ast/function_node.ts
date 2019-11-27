import { ASTNode } from "./ast_node"
import { PositionRange } from "./position"
import { Environment, createError } from "./environment"

export class FNCallNode extends ASTNode {
  id: string

  constructor(children: ASTNode[], location: PositionRange) {
    super("fnCall", children.slice(1), location)
    this.id = children[0].toString()
  }

  eval(env: Environment, args: ASTNode[] = []): ASTNode | null {
    env.location = this.location
    return env.symbols[this.id].eval(env, this.children)
  }

  check(env: Environment, args: ASTNode[] = []): ASTNode {
    this.children.slice(1).map(c => c.check(env, args))
    if (env.symbols[this.id]) {
      const node = env.symbols[this.id].check(env, args)
      const fnArgs = node.children[0].children
      if (this.children.length !== fnArgs.length) {
        env.errors.push(
          createError(
            this,
            "wrongNumberArguments",
            `${this.id}: ${this.children.length} arguments given but ${fnArgs.length}`
          )
        )
      }
    } else {
      env.errors.push(createError(this, "functionNotFound"))
    }
    return this
  }
}

export class SystemFunctionNode extends ASTNode {
  fn: (env: Environment, args: ASTNode[]) => ASTNode | null

  constructor(
    args: ASTNode[],
    fn: (env: Environment, args: ASTNode[]) => ASTNode | null
  ) {
    super("function", args, {})
    this.fn = fn
  }

  eval(env: Environment, args: ASTNode[]): ASTNode | null {
    return this.fn(env, args)
  }

  check(env: Environment, args: ASTNode[] = []): ASTNode {
    return this
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
