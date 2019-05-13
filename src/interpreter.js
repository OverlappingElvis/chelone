const fs = require(`fs`)
const program = require(`commander`)

const { Lexer: TurtleLexer } = require(`./lexer`)
const TurtleParser = require(`./parser`)
const Turtle = require(`./turtle`)

program.version(`0.0.1`)
  .option(`-P --program [program]`, `Turtle program as quoted string`, `make "length 50 to growsquare :length repeat 4 [forward :length right 90] make "length :length + 50 end repeat 10 [growsquare "length right 36 if "length > 250 [make "length 50]]`)
  .option(`-O --output [filename]`, `Output filename [turtle.svg]`, `turtle.svg`)
  .parse(process.argv)

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
  }

  variableStatement (context) {

    this.scope[context.VAR[0].image] = this.visit(context.arithmeticStatement)
  }

  assignStatement (context) {

    this.scope[context.IDENTIFIER[0].image] = {
      fn: () => {

        for (const statement of context.statement) {

          const result = this.visit(statement)

          if (result === this.constants.STOP) {

            return
          }
        }
      },
      inputs: context.INPUT.map(({ image }) => image)
    }
  }

  conditionalStatement (context) {

    const lhs = this.visit(context.arithmeticStatement[0])
    const rhs = this.visit(context.arithmeticStatement[1])

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

    return this.constants.STOP
  }

  repeatStatement (context) {

    const count = this.visit(context.arithmeticStatement)

    let step = 0

    let stopped = false

    while (step < count && !stopped) {

      for (const statement of context.blockStatement[0].children.statement) {

        const result = this.visit(statement)

        if (result === this.constants.STOP) {

          stopped = true

          break
        }
      }

      step++
    }
  }

  penToggleStatement (context) {

    if (context.PenToggleOperator[0].image === `penup`) {

      this.turtle.penDown = false
    } else {

      this.turtle.penDown = true
    }
  }

  movementStatement (context) {

    const direction = context.MovementOperator[0].image === `forward` ? 1 : -1

    const length = direction * this.visit(context.arithmeticStatement)

    const offset = this.turtle.getCoordinatesOffset(length)

    this.turtle.setNewCoordinates(offset)
  }

  directionStatement (context) {

    const direction = context.DirectionOperator[0].image

    const degrees = this.visit(context.arithmeticStatement)

    this.turtle.setHeading(direction, degrees)
  }

  homeStatement (context) {

    this.turtle.home()
  }

  setXYStatement (context) {

    this.turtle.setXY({

      x: this.visit(context.arithmeticStatement[0]),
      y: this.visit(context.arithmeticStatement[1])
    })
  } 

  functionStatement (context) {

    let index = 0

    const functionScope = this.scope[context.IDENTIFIER[0].image]

    for (const input of context.arithmeticStatement) {

      this.scope[functionScope.inputs[index]] = this.visit(input, this.scope[context.IDENTIFIER[0].image])
    }

    functionScope.fn()
  }

  arithmeticStatement (context) {

    const lhs = this.visit(context.minusStatement[0])

    if (!context.minusStatement[1]) {

      return lhs
    }

    switch (context.ArithmeticOperator[0].image) {

      case `+`:

        return lhs + this.visit(context.minusStatement[1])
      case `-`:

        return lhs - this.visit(context.minusStatement[1])
      case `*`:

        return lhs * this.visit(context.minusStatement[1])
      case `/`:

        return lhs - this.visit(context.minusStatement[1])
    }
  }

  minusStatement (context) {

    if (context.Minus) {

      return -1 * this.visit(context.atomicStatement)
    }

    return this.visit(context.atomicStatement)
  }

  atomicStatement (context) {

    if (context.NUMBER) {

      return parseFloat(context.NUMBER[0].image)
    } else if (context.INPUT) {

      return this.scope[context.INPUT[0].image]
    } else if (context.VAR) {

      return this.scope[context.VAR[0].image]
    } else  if (context.randomStatement) {

      return this.visit(context.randomStatement)
    }
  }

  randomStatement (context) {

    return Math.floor(Math.random() * Math.floor(this.visit(context.minusStatement)))
  }

  blockStatement (context) {

    for (const statement of context.statement) {

      return this.visit(statement)
    }
  }
}

const lexed = TurtleLexer.tokenize(program.program)

if (lexed.errors.length) {

  console.log(`Lexer error!`)

  console.log(lexed.errors)

  throw new Error()
}

parser.input = lexed.tokens

const cst = parser.program()

if (parser.errors.length) {

  console.log(`Parser error!`)

  console.log(parser.errors)

  throw new Error()
}

const interpreter = new TurtleInterpreter()

interpreter.visit(cst)

fs.writeFile(program.output, interpreter.turtle.render(), () => {

  console.log(`Saved image to ${program.output}`)
})