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

class TurtleInterpreter extends BaseCstVisitor {

  constructor () {

    super()

    this.validateVisitor()
  }
}

const lexed = TurtleLexer.tokenize(`to square :length repeat 4 [forward :length left 90] end pendown square 100 penup`)

console.log(`lexer errors?`)
console.log(lexed.errors)

parser.input = lexed.tokens

const cst = parser.program()

console.log(`parser errors?`)
console.log(parser.errors)

console.log(`cst:`)
console.log(JSON.stringify(cst))
