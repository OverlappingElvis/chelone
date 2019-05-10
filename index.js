const chevrotain = require(`chevrotain`)
const { Lexer, Parser } = chevrotain
const fs = require(`fs`)

const allTokens = []

const createToken = function (options) {

  const token = chevrotain.createToken(options)
  
  allTokens.push(token)

  return token
}

const WhiteSpace = createToken({
  name: `WhiteSpace`,
  pattern: /\s+/,
  group: Lexer.SKIPPED
})

const To = createToken({
  name: `To`,
  pattern: /to/
})

const End = createToken({
  name: `End`,
  pattern: /end/
})

const PenToggleOperator = createToken({
  name: `PenToggleOperator`,
  pattern: Lexer.NA
})

const PenUp = createToken({
  name: `PenUp`,
  pattern: /penup/,
  categories: PenToggleOperator
})

const PenDown = createToken({
  name: `PenDown`,
  pattern: /pendown/,
  categories: PenToggleOperator
})

const DirectionOperator = createToken({
  name: `DirectionOperator`,
  pattern: Lexer.NA
})

const Left = createToken({
  name: `Left`,
  pattern: /left/,
  categories: DirectionOperator
})

const Right = createToken({
  name: `Right`,
  pattern: /right/,
  categories: DirectionOperator
})

const MovementOperator = createToken({
  name: `MovementOperator`,
  pattern: Lexer.NA
})

const Forward = createToken({
  name: `Forward`,
  pattern: /forward/,
  categories: MovementOperator
})

const Back = createToken({
  name: `Back`,
  pattern: /back/,
  categories: MovementOperator
})

const Repeat = createToken({
  name: `Repeat`,
  pattern: /repeat/
})

const LeftBracket = createToken({
  name: `LeftBracket`,
  pattern: /\[/
})

const RightBracket = createToken({
  name: `RightBracket`,
  pattern: /\]/
})

const INT = createToken({
  name: `INT`,
  pattern: /[0-9]+/
})

const INPUT = createToken({
  name: `INPUT`,
  pattern: /:[a-zA-Z]+/
})

const IDENTIFIER = createToken({
  name: `IDENTIFIER`,
  pattern: /[a-zA-Z]+/
})


const TurtleLexer = new Lexer(allTokens)

class TurtleParser extends Parser {

  constructor () {

    super(allTokens)

    const $ = this

    $.RULE(`program`, () => {

        $.MANY(() => {

            $.SUBRULE($.statement)
        })
    })

    $.RULE(`statement`, () => {

      $.OR([
        {
          ALT: () => $.SUBRULE($.assignStatement)
        },
        {
          ALT: () => $.SUBRULE($.repeatStatement)
        },
        {
          ALT: () => $.SUBRULE($.penToggleStatement)
        },
        {
          ALT: () => $.SUBRULE($.movementStatement)
        },
        {
          ALT: () => $.SUBRULE($.directionStatement)
        },
        {
          ALT: () => $.SUBRULE($.functionStatement)
        }
      ])
    })

    $.RULE(`assignStatement`, () => {

      $.CONSUME(To)

      $.CONSUME(IDENTIFIER)

      $.OPTION(() => {

        $.MANY(() => {

          $.CONSUME(INPUT)
        })
      })

      $.MANY2(() => {

        $.SUBRULE($.statement)
      })

      $.CONSUME(End)
    })

    $.RULE(`functionStatement`, () => {

      $.CONSUME(IDENTIFIER)

      $.OPTION(() => {

        $.MANY(() => {

          $.SUBRULE($.atomicStatement)
        })
      })
    })

    $.RULE(`penToggleStatement`, () => {

      $.CONSUME(PenToggleOperator)
    })

    $.RULE(`movementStatement`, () => {

      $.CONSUME(MovementOperator)

      $.SUBRULE($.atomicStatement)
    })

    $.RULE(`directionStatement`, () => {

      $.CONSUME(DirectionOperator)

      $.SUBRULE($.atomicStatement)
    })

    $.RULE(`repeatStatement`, () => {

      $.CONSUME(Repeat)

      $.SUBRULE($.atomicStatement)

      $.OR([
        {
          ALT: () => $.SUBRULE($.blockStatement)
        },
        {
          ALT: () => $.CONSUME(IDENTIFIER)
        }
      ])
    })

    $.RULE(`atomicStatement`, () => {

      $.OR([
        {
          ALT: () => $.CONSUME(INT)
        },
        {
          ALT: () => $.CONSUME(INPUT)
        }
      ])
    })

    $.RULE(`blockStatement`, () => {

      $.CONSUME(LeftBracket)

      $.MANY(() => {

        $.SUBRULE($.statement)
      })

      $.CONSUME(RightBracket)
    })

    $.performSelfAnalysis()
  }
}

const parser = new TurtleParser()

const BaseCstVisitor = parser.getBaseCstVisitorConstructor()

class Turtle {

  constructor (options) {

    this.bounds = {
      x: 1000,
      y: 1000
    }

    this.x = this.bounds.x / 2
    this.y = this.bounds.y / 2

    this.heading = 90
    this.previousHeading = 90
    this.penDown = true

    this.segments = []
  }

  render () {

    const svg = [`<svg viewBox="0 0 ${this.bounds.x} ${this.bounds.y}" xmlns="http://www.w3.org/2000/svg">`, ...this.segments, `</svg>`]

    fs.writeFile(`turtle.svg`, svg.join(``), () => {

      console.log(`saved image to turtle.svg`)
    })
  }

  setNewCoordinates ({ x, y }) {

    const oldX = this.x
    const newX = this.x + x

    const oldY = this.y
    const newY = this.y + y

    if (this.penDown === true) {

      this.segments.push(`<line x1="${oldX.toFixed(0)}" y1="${oldY.toFixed(0)}" x2="${newX.toFixed(0)}" y2="${newY.toFixed(0)}" stroke="black" />`)
    }

    this.x = newX
    this.y = newY
  }

  getCoordinatesOffset (length) {

    // Math.cos and Math.sin take radians as input so convert from degrees
    return {
      x: length * Math.cos(this.heading * (Math.PI / 180)),
      y: length * Math.sin(this.heading * (Math.PI / 180))
    }
  }

  normalizeHeading (degrees) {

    if (degrees < 0) {

      return this.normalizeHeading(360 + degrees)
    }

    if (degrees > 360) {

      return this.normalizeHeading(degrees - 360)
    }

    if (degrees === 360) {

      return 0
    }

    return degrees
  }

  setHeading (direction, degrees) {

    this.previousHeading = this.heading

    const sign = direction === `left` ? 1 : -1

    const newAngle = this.heading + (sign * degrees)

    this.heading = this.normalizeHeading(newAngle)
  }
}

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

    const direction = context.MovementOperator[0].image

    const length = this.visit(context.atomicStatement)

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

const lexed = TurtleLexer.tokenize(process.argv[2])

parser.input = lexed.tokens

const cst = parser.program()

const interpreter = new TurtleInterpreter()

interpreter.visit(cst)

interpreter.turtle.render()