const { Parser } = require(`chevrotain`)
const { Tokens, allTokens } = require(`./lexer`)

module.exports = class TurtleParser extends Parser {

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
          ALT: () => $.SUBRULE($.variableStatement)
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
          ALT: () => $.SUBRULE($.homeStatement)
        },
        {
          ALT: () => $.SUBRULE($.setXYStatement)
        },
        {
          ALT: () => $.SUBRULE($.functionStatement)
        }
      ])
    })

    $.RULE(`assignStatement`, () => {

      $.CONSUME(Tokens.To)

      $.CONSUME(Tokens.IDENTIFIER)

      $.OPTION(() => {

        $.MANY(() => {

          $.CONSUME(Tokens.INPUT)
        })
      })

      $.MANY2(() => {

        $.SUBRULE($.statement)
      })

      $.CONSUME(Tokens.End)
    })

    $.RULE(`variableStatement`, () => {

      $.CONSUME(Tokens.Make)

      $.CONSUME(Tokens.VAR)

      $.SUBRULE($.arithmeticStatement)
    })

    $.RULE(`functionStatement`, () => {

      $.CONSUME(Tokens.IDENTIFIER)

      $.OPTION(() => {

        $.MANY(() => {

          $.SUBRULE($.arithmeticStatement)
        })
      })
    })

    $.RULE(`penToggleStatement`, () => {

      $.CONSUME(Tokens.PenToggleOperator)
    })

    $.RULE(`homeStatement`, () => {

      $.CONSUME(Tokens.Home)
    })

    $.RULE(`setXYStatement`, () => {

      $.CONSUME(Tokens.SetXY)

      $.SUBRULE($.arithmeticStatement)

      $.SUBRULE2($.arithmeticStatement)
    })

    $.RULE(`movementStatement`, () => {

      $.CONSUME(Tokens.MovementOperator)

      $.SUBRULE($.arithmeticStatement)
    })

    $.RULE(`directionStatement`, () => {

      $.CONSUME(Tokens.DirectionOperator)

      $.SUBRULE($.arithmeticStatement)
    })

    $.RULE(`repeatStatement`, () => {

      $.CONSUME(Tokens.Repeat)

      $.SUBRULE($.arithmeticStatement)

      $.OR([
        {
          ALT: () => $.SUBRULE($.blockStatement)
        },
        {
          ALT: () => $.CONSUME(Tokens.IDENTIFIER)
        }
      ])
    })

    $.RULE(`minusStatement`, () => {

      $.OPTION(() => {

        $.CONSUME(Tokens.Minus)
      })

      $.SUBRULE($.atomicStatement)
    })

    $.RULE(`arithmeticStatement`, () => {

      $.SUBRULE($.minusStatement)

      $.OPTION(() => {

        $.CONSUME(Tokens.ArithmeticOperator)

        $.SUBRULE2($.minusStatement)
      })
    })

    $.RULE(`atomicStatement`, () => {

      $.OR([
        {
          ALT: () => $.CONSUME(Tokens.INT)
        },
        {
          ALT: () => $.CONSUME(Tokens.INPUT)
        },
        {
          ALT: () => $.CONSUME(Tokens.VAR)
        },
        {
          ALT: () => $.SUBRULE($.randomStatement)
        }
      ])
    })

    $.RULE(`randomStatement`, () => {

      $.CONSUME(Tokens.Random)

      $.SUBRULE($.minusStatement)
    })

    $.RULE(`blockStatement`, () => {

      $.CONSUME(Tokens.LeftBracket)

      $.MANY(() => {

        $.SUBRULE($.statement)
      })

      $.CONSUME(Tokens.RightBracket)
    })

    $.performSelfAnalysis()
  }
}