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
