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
        },
        {
          ALT: () => $.SUBRULE($.conditionalStatement)
        },
        {
          ALT: () => $.SUBRULE($.stopStatement)
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

      $.SUBRULE($.additionStatement)
    })

    $.RULE(`conditionalStatement`, () => {

      $.CONSUME(Tokens.If)

      $.SUBRULE($.additionStatement)

      $.CONSUME(Tokens.ComparisonOperator)

      $.SUBRULE2($.additionStatement)

      $.SUBRULE($.blockStatement)
    })

    $.RULE(`stopStatement`, () => {

      $.CONSUME(Tokens.Stop)
    })

    $.RULE(`functionStatement`, () => {

      $.CONSUME(Tokens.IDENTIFIER)

      $.OPTION(() => {

        $.MANY(() => {

          $.SUBRULE($.additionStatement)
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

      $.SUBRULE($.additionStatement)

      $.SUBRULE2($.additionStatement)
    })

    $.RULE(`movementStatement`, () => {

      $.CONSUME(Tokens.MovementOperator)

      $.SUBRULE($.additionStatement)
    })

    $.RULE(`directionStatement`, () => {

      $.CONSUME(Tokens.DirectionOperator)

      $.SUBRULE($.additionStatement)
    })

    $.RULE(`repeatStatement`, () => {

      $.CONSUME(Tokens.Repeat)

      $.SUBRULE($.additionStatement)

      $.OR([
        {
          ALT: () => $.SUBRULE($.blockStatement)
        },
        {
          ALT: () => $.CONSUME(Tokens.IDENTIFIER)
        }
      ])
    })

    $.RULE(`additionStatement`, () => {

      $.SUBRULE($.multiplicationStatement, {
        LABEL: `lhs`
      })

      $.MANY(() => {

        $.CONSUME(Tokens.AdditionOperator)

        $.SUBRULE2($.multiplicationStatement, {
          LABEL: `rhs`
        })
      })
    })

    $.RULE(`multiplicationStatement`, () => {

      $.SUBRULE($.atomicStatement, {
        LABEL: `lhs`
      })

      $.MANY(() => {

        $.CONSUME(Tokens.MultiplicationOperator)

        $.SUBRULE2($.atomicStatement, {
          LABEL: `rhs`
        })
      })
    })

    $.RULE(`atomicStatement`, () => {

      $.OR([
        {
          ALT: () => $.SUBRULE($.parenthesisStatement)
        },
        {
          ALT: () => $.CONSUME(Tokens.NUMBER)
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

    $.RULE(`parenthesisStatement`, () => {

      $.CONSUME(Tokens.LeftParen)

      $.SUBRULE($.additionStatement)

      $.CONSUME(Tokens.RightParen)
    })

    $.RULE(`randomStatement`, () => {

      $.CONSUME(Tokens.Random)

      $.SUBRULE($.atomicStatement)
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
