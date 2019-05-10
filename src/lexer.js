const chevrotain = require(`chevrotain`)
const Lexer = chevrotain.Lexer

const allTokens = []

const Tokens = {}

const createToken = function (options) {

  const token = chevrotain.createToken(options)
  
  allTokens.push(token)

  Tokens[token.name] = token
}

createToken({
  name: `WhiteSpace`,
  pattern: /\s+/,
  group: Lexer.SKIPPED
})

createToken({
  name: `To`,
  pattern: /to/
})

createToken({
  name: `End`,
  pattern: /end/
})

createToken({
  name: `PenToggleOperator`,
  pattern: Lexer.NA
})

createToken({
  name: `PenUp`,
  pattern: /penup/,
  categories: Tokens.PenToggleOperator
})

createToken({
  name: `PenDown`,
  pattern: /pendown/,
  categories: Tokens.PenToggleOperator
})

createToken({
  name: `DirectionOperator`,
  pattern: Lexer.NA
})

createToken({
  name: `Left`,
  pattern: /left/,
  categories: Tokens.DirectionOperator
})

createToken({
  name: `Right`,
  pattern: /right/,
  categories: Tokens.DirectionOperator
})

createToken({
  name: `MovementOperator`,
  pattern: Lexer.NA
})

createToken({
  name: `Forward`,
  pattern: /forward/,
  categories: Tokens.MovementOperator
})

createToken({
  name: `Back`,
  pattern: /back/,
  categories: Tokens.MovementOperator
})

createToken({
  name: `Repeat`,
  pattern: /repeat/
})

createToken({
  name: `LeftBracket`,
  pattern: /\[/
})

createToken({
  name: `RightBracket`,
  pattern: /\]/
})

createToken({
  name: `INT`,
  pattern: /[0-9]+/
})

createToken({
  name: `INPUT`,
  pattern: /:[a-zA-Z]+/
})

createToken({
  name: `IDENTIFIER`,
  pattern: /[a-zA-Z]+/
})

module.exports = {
  Lexer: new Lexer(allTokens),
  Tokens,
  allTokens
}