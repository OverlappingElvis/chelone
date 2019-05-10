const chevrotain = require(`chevrotain`)
const { Lexer, Parser } = chevrotain

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

  constructor () {

    this.x = 0
    this.y = 0
    this.heading = 0
    this.previousHeading = 0
    this.penDown = false
  }

  setNewCoordinates ({ x, y }) {

    this.x = (this.x + x)
    this.y = (this.y + y)
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

  penDown () {

    this.penDown = true
  }

  penUp () {

    this.penDown = false
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

    console.log(context)

    const count = this.visit(context.atomicStatement)

    let step = 0

    while (step < count) {

      this.visit(context.blockStatement)

      step++
    }
  }

  penToggleStatement (context) {

  }

  movementStatement (context) {

    const direction = context.MovementOperator[0].image

    const length = this.visit(context.atomicStatement)

    console.log(`moving ${direction} by ${length}`)

    console.log(`old position: ${this.turtle.x}, ${this.turtle.y}`)

    const offset = this.turtle.getCoordinatesOffset(length)

    console.log(`polar coordinate offset: ${offset.x}, ${offset.y}`)

    this.turtle.setNewCoordinates(offset)

    console.log(`new position: ${this.turtle.x}, ${this.turtle.y}`)
  }

  directionStatement (context) {

    const direction = context.DirectionOperator[0].image

    const degrees = this.visit(context.atomicStatement)

    console.log(`rotating ${direction} by ${degrees}`)

    this.turtle.setHeading(direction, degrees)

    console.log(`turtle's new heading is ${this.turtle.heading} (from ${this.turtle.previousHeading})`)
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

const lexed = TurtleLexer.tokenize(`left 45 repeat 4 [left 90 forward 10]`)

parser.input = lexed.tokens

const cst = parser.program()

const interpreter = new TurtleInterpreter()

interpreter.visit(cst)