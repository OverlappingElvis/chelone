const chevrotain = require(`chevrotain`)
const { Parser } = chevrotain
const fs = require(`fs`)
const program = require(`commander`)

const { Lexer } = require(`./src/lexer`)
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
    } else if (context.functionStatement) {

      this.visit(context.functionStatement)
    }
  }

  assignStatement (context) {

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

  functionStatement (context) {

  }

  atomicStatement (context) {

    if (context.INPUT) {

      return context.INPUT.image
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

const lexed = Lexer.tokenize(program.program)

parser.input = lexed.tokens

const cst = parser.program()

const interpreter = new TurtleInterpreter()

interpreter.visit(cst)

fs.writeFile(program.output, interpreter.turtle.render(), () => {

  console.log(`saved image to ${program.output}`)
})