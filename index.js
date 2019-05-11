const fs = require(`fs`)
const program = require(`commander`)

const { Lexer: TurtleLexer } = require(`./src/lexer`)
const TurtleParser = require(`./src/parser`)
const Turtle = require(`./src/turtle`)

program.version(`0.0.1`)
  .option(`-P --program [program]`, `Turtle program as quoted string`, `make "length 250 to growsquare :length repeat 4 [forward :length right 90] make "length :length + 50 end repeat 10 [growsquare "length right 36]`)
  .option(`-O --output [filename]`, `Output filename [turtle.svg]`, `turtle.svg`)
  .parse(process.argv)

const parser = new TurtleParser()

const BaseCstVisitor = parser.getBaseCstVisitorConstructor()

class TurtleInterpreter extends BaseCstVisitor {

  constructor () {

    super()

    this.turtle = new Turtle()

    this.scope = {}

    this.validateVisitor()
  }

  program (context) {

    for (const statement of context.statement) {

      this.visit(statement)
    }
  }

  statement (context) {

    if (context.variableStatement) {

      this.visit(context.variableStatement)
    } else if (context.assignStatement) {

      this.visit(context.assignStatement)
    } else if (context.repeatStatement) {

      this.visit(context.repeatStatement)
    } else if (context.penToggleStatement) {

      this.visit(context.penToggleStatement)
    } else if (context.movementStatement) {

      this.visit(context.movementStatement)
    } else if (context.directionStatement) {

      this.visit(context.directionStatement)
    } else if (context.homeStatement) {

      this.visit(context.homeStatement)
    } else if (context.setXYStatement) {

      this.visit(context.setXYStatement)
    } else if (context.functionStatement) {

      this.visit(context.functionStatement)
    }
  }

  variableStatement (context) {

    this.scope[context.VAR[0].image] = this.visit(context.arithmeticStatement)
  }

  assignStatement (context) {

    this.scope[context.IDENTIFIER[0].image] = {
      fn: () => {

        for (const statement of context.statement) {

          this.visit(statement)
        }
      },
      inputs: context.INPUT.map(({ image }) => image)
    }
  }

  repeatStatement (context) {

    const count = this.visit(context.arithmeticStatement)

    let step = 0

    while (step < count) {

      this.visit(context.blockStatement)

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

      this.scope[functionScope.inputs[index]] = this.visit(input)
    }

    functionScope.fn()
  }

  arithmeticStatement (context) {

    const lhs = this.visit(context.atomicStatement[0])

    if (!context.atomicStatement[1]) {

      return lhs
    }

    switch (context.ArithmeticOperator[0].image) {

      case `+`:

        return lhs + this.visit(context.atomicStatement[1])
      case `-`:

        return lhs - this.visit(context.atomicStatement[1])
      case `*`:

        return lhs * this.visit(context.atomicStatement[1])
      case `/`:

        return lhs - this.visit(context.atomicStatement[1])
    }
  }

  atomicStatement (context) {

    if (context.INPUT) {

      return this.scope[context.INPUT[0].image]
    } else if (context.VAR) {

      return this.scope[context.VAR[0].image]
    } else if (context.INT) {

      return parseInt(context.INT[0].image, 10)
    }
  }

  blockStatement (context) {

    for (const statement of context.statement) {

      this.visit(statement)
    }
  }
}

const lexed = TurtleLexer.tokenize(program.program)

if (lexed.errors.length) {

  console.log(`Lexer error!`)

  console.log(lexer.errors)

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

  console.log(`saved image to ${program.output}`)
})