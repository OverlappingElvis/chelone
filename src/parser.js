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
        }
      ])
    })

    $.RULE(`innerStatement`, () => {

      $.OR([
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
        },
        {
          ALT: () => $.SUBRULE($.outputStatement)
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

        $.SUBRULE($.innerStatement)
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

      $.SUBRULE($.additionStatement, {
        LABEL: `lhs`
      })

      $.CONSUME(Tokens.ComparisonOperator)

      $.SUBRULE2($.additionStatement, {
        LABEL: `rhs`
      })

      $.SUBRULE($.blockStatement)
    })

    $.RULE(`stopStatement`, () => {

      $.CONSUME(Tokens.Stop)
    })

    $.RULE(`outputStatement`, () => {

      $.CONSUME(Tokens.Output)

      $.SUBRULE($.additionStatement)
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

      $.SUBRULE($.additionStatement, {
        LABEL: `x`
      })

      $.SUBRULE2($.additionStatement, {
        LABEL: `y`
      })
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

      $.SUBRULE($.additionStatement, {
        LABEL: `count`
      })

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
          ALT: () => $.SUBRULE($.unaryMinusStatement)
        },
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
        },
        {
          ALT: () => $.SUBRULE($.functionStatement)
        }
      ])
    })

    $.RULE(`unaryMinusStatement`, () => {

      $.CONSUME(Tokens.Minus)

      $.SUBRULE($.atomicStatement)
    })

    $.RULE(`parenthesisStatement`, () => {

      $.CONSUME(Tokens.LeftParen)

      $.SUBRULE($.additionStatement)

      $.CONSUME(Tokens.RightParen)
    })

    $.RULE(`randomStatement`, () => {

      $.CONSUME(Tokens.Random)

      $.SUBRULE($.additionStatement)
    })

    $.RULE(`blockStatement`, () => {

      $.CONSUME(Tokens.LeftBracket)

      $.MANY(() => {

        $.SUBRULE($.innerStatement)
      })

      $.CONSUME(Tokens.RightBracket)
    })

    $.performSelfAnalysis()
  }
}
