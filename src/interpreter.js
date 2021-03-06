const { Lexer: TurtleLexer } = require(`./lexer`)
const TurtleParser = require(`./parser`)
const Turtle = require(`./turtle`)

const parser = new TurtleParser()

const BaseCstVisitor = parser.getBaseCstVisitorConstructor()

class TurtleInterpreter extends BaseCstVisitor {

  constructor () {

    super()

    this.turtle = new Turtle()

    this.scope = {}

    this.constants = {
      STOP: Symbol(`STOP`)
    }

    this.validateVisitor()
  }

  program (context) {

    for (const statement of context.statement) {

      this.visit(statement)
    }

    return this.turtle.render()
  }

  statement (context) {

    if (context.variableStatement) {

      return this.visit(context.variableStatement)
    }

    if (context.assignStatement) {

      return this.visit(context.assignStatement)
    }

    if (context.repeatStatement) {

      return this.visit(context.repeatStatement)
    }

    if (context.penToggleStatement) {

      return this.visit(context.penToggleStatement)
    }

    if (context.movementStatement) {

      return this.visit(context.movementStatement)
    }

    if (context.directionStatement) {

      return this.visit(context.directionStatement)
    }

    if (context.homeStatement) {

      return this.visit(context.homeStatement)
    }

    if (context.setXYStatement) {

      return this.visit(context.setXYStatement)
    }

    if (context.functionStatement) {

      return this.visit(context.functionStatement)
    }

    if (context.conditionalStatement) {

      return this.visit(context.conditionalStatement)
    }

    if (context.stopStatement) {

      return this.visit(context.stopStatement)
    }

    if (context.outputStatement) {

      return this.visit(context.outputStatement)
    }
  }

  innerStatement (context) {

    return this.statement(context)
  }

  variableStatement (context) {

    this.scope[context.VAR[0].image] = this.visit(context.additionStatement)
  }

  assignStatement (context) {

    this.scope[context.IDENTIFIER[0].image] = {
      fn: () => {

        for (const statement of context.innerStatement) {

          const result = this.visit(statement)

          if (result && result[this.constants.STOP]) {

            return result.value
          }
        }
      },
      inputs: context.INPUT ? context.INPUT.map(({ image }) => image) : []
    }
  }

  conditionalStatement (context) {

    const lhs = this.visit(context.lhs)
    const rhs = this.visit(context.rhs)

    const operator = context.ComparisonOperator[0].image

    switch (operator) {

      case `=`:

        if (lhs !== rhs) {

          return
        }

        break
      case `!=`:

        if (lhs === rhs) {

          return
        }

        break
      case `>`:

        if (lhs <= rhs) {

          return
        }

        break
      case `<`:

        if (lhs >= rhs) {

          return
        }
    }

    return this.visit(context.blockStatement)
  }

  stopStatement (context) {

    return {
      [this.constants.STOP]: true
    }
  }

  outputStatement (context) {

    return {
      [this.constants.STOP]: true,
      value: this.visit(context.additionStatement)
    }
  }

  repeatStatement (context) {

    const count = this.visit(context.count)

    let step = 0

    let stopped = false

    while (step < count && !stopped) {

      for (const statement of context.blockStatement[0].children.innerStatement) {

        const result = this.visit(statement)

        if (result && result[this.constants.STOP]) {

          stopped = true

          break
        }
      }

      step++
    }
  }

  penToggleStatement (context) {

    if ([`penup`, `pu`].includes(context.PenToggleOperator[0].image)) {

      this.turtle.penUp()
    } else {

      this.turtle.penDown()
    }
  }

  movementStatement (context) {

    this.turtle.move(context.MovementOperator[0].image, this.visit(context.additionStatement))
  }

  directionStatement (context) {

    const direction = context.DirectionOperator[0].image

    const degrees = this.visit(context.additionStatement)

    this.turtle.setHeading(direction, degrees)
  }

  homeStatement (context) {

    this.turtle.home()
  }

  setXYStatement (context) {

    this.turtle.setXY({

      x: this.visit(context.x),
      y: this.visit(context.y)
    })
  }

  functionStatement (context) {

    let index = 0

    const functionScope = this.scope[context.IDENTIFIER[0].image]

    if (context.additionStatement) {

      for (const input of context.additionStatement) {

        this.scope[functionScope.inputs[index]] = this.visit(input, this.scope[context.IDENTIFIER[0].image])
      }
    }

    return functionScope.fn()
  }

  additionStatement (context) {

    let result = this.visit(context.lhs)

    if (context.rhs) {

      context.rhs.forEach((rhsOperand, index) => {

        const rhsValue = this.visit(rhsOperand)

        switch (context.AdditionOperator[index].image) {

          case `+`:

            result = result + rhsValue

            return
          case `-`:

            result = result - rhsValue

            return
        }
      })
    }

    return result
  }

  multiplicationStatement (context) {

    let result = this.visit(context.lhs)

    if (context.rhs) {

      context.rhs.forEach((rhsOperand, index) => {

        const rhsValue = this.visit(rhsOperand)

        switch (context.MultiplicationOperator[index].image) {

          case `*`:

            result = result * rhsValue

            return
          case `/`:

            result = result / rhsValue

            return
        }
      })
    }

    return result
  }

  atomicStatement (context) {

    if (context.unaryMinusStatement) {

      return this.visit(context.unaryMinusStatement)
    }

    if (context.parenthesisStatement) {

      return this.visit(context.parenthesisStatement)
    }

    if (context.NUMBER) {

      return parseFloat(context.NUMBER[0].image)
    }

    if (context.INPUT) {

      return this.scope[context.INPUT[0].image]
    }

    if (context.VAR) {

      return this.scope[context.VAR[0].image]
    }

    if (context.randomStatement) {

      return this.visit(context.randomStatement)
    }

    if (context.functionStatement) {

      return this.visit(context.functionStatement)
    }
  }

  unaryMinusStatement (context) {

    return -1 * this.visit(context.atomicStatement)
  }

  parenthesisStatement(context) {

    return this.visit(context.additionStatement)
  }

  randomStatement (context) {

    return Math.floor(Math.random() * Math.floor(this.visit(context.additionStatement)))
  }

  blockStatement (context) {

    for (const statement of context.innerStatement) {

      return this.visit(statement)
    }
  }
}

const interpreter = new TurtleInterpreter()

module.exports = {
  parse: (input) => {

    const lexed = TurtleLexer.tokenize(input)

    if (lexed.errors.length) {

      throw new Error(lexed.errors)
    }

    parser.input = lexed.tokens

    const cst = parser.program()

    if (parser.errors.length) {

      throw new Error(parser.errors)
    }

    return interpreter.visit(cst)
  }
}
