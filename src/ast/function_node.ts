import { ASTNode } from "./ast_node"
import { PositionRange } from "./position"
import { Environment } from "./environment"

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
}

export class SystemFunctionNode extends ASTNode {
  fn: (env: Environment, args: ASTNode[]) => ASTNode | null

  constructor(
    id: string,
    fn: (env: Environment, args: ASTNode[]) => ASTNode | null
  ) {
    super("function", [], {})
    this.fn = fn
  }

  eval(env: Environment, args: ASTNode[]): ASTNode | null {
    return this.fn(env, args)
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
}
