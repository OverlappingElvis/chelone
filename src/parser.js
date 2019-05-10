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

    $.RULE(`functionStatement`, () => {

      $.CONSUME(Tokens.IDENTIFIER)

      $.OPTION(() => {

        $.MANY(() => {

          $.SUBRULE($.atomicStatement)
        })
      })
    })

    $.RULE(`penToggleStatement`, () => {

      $.CONSUME(Tokens.PenToggleOperator)
    })

    $.RULE(`movementStatement`, () => {

      $.CONSUME(Tokens.MovementOperator)

      $.SUBRULE($.atomicStatement)
    })

    $.RULE(`directionStatement`, () => {

      $.CONSUME(Tokens.DirectionOperator)

      $.SUBRULE($.atomicStatement)
    })

    $.RULE(`repeatStatement`, () => {

      $.CONSUME(Tokens.Repeat)

      $.SUBRULE($.atomicStatement)

      $.OR([
        {
          ALT: () => $.SUBRULE($.blockStatement)
        },
        {
          ALT: () => $.CONSUME(Tokens.IDENTIFIER)
        }
      ])
    })

    $.RULE(`atomicStatement`, () => {

      $.OR([
        {
          ALT: () => $.CONSUME(Tokens.INT)
        },
        {
          ALT: () => $.CONSUME(Tokens.INPUT)
        }
      ])
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