const fs = require(`fs`)
const program = require(`commander`)

const { Lexer: TurtleLexer } = require(`./src/lexer`)
const TurtleParser = require(`./src/parser`)
const Turtle = require(`./src/turtle`)

program.version(`0.0.1`)
  .option(`-P --program [program]`, `Turtle program as quoted string`)
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

    if (context.assignStatement) {

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

    const count = this.visit(context.atomicStatement)

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

    const length = direction * this.visit(context.atomicStatement)

    const offset = this.turtle.getCoordinatesOffset(length)

    this.turtle.setNewCoordinates(offset)
  }

  directionStatement (context) {

    const direction = context.DirectionOperator[0].image

    const degrees = this.visit(context.atomicStatement)

    this.turtle.setHeading(direction, degrees)
  }

  homeStatement (context) {

    this.turtle.home()
  }

  setXYStatement (context) {

    this.turtle.setNewCoordinates({

      x: this.visit(context.atomicStatement[0]),
      y: this.visit(context.atomicStatement[1])
    })
  } 

  functionStatement (context) {

    let index = 0

    const functionScope = this.scope[context.IDENTIFIER[0].image]

    for (const input of context.atomicStatement) {

      this.scope[functionScope.inputs[index]] = this.visit(input)
    }

    functionScope.fn()
  }

  atomicStatement (context) {

    if (context.INPUT) {

      return this.scope[context.INPUT[0].image]
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

  throw new Error(lexed.errors)
}

parser.input = lexed.tokens

const cst = parser.program()

if (parser.errors.length) {

  console.log(`Parser error!`)

  throw new Error(parser.errors)
}

const interpreter = new TurtleInterpreter()

interpreter.visit(cst)

fs.writeFile(program.output, interpreter.turtle.render(), () => {

  console.log(`saved image to ${program.output}`)
})