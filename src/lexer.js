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
  name: `Make`,
  pattern: /make/
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
  pattern: /penup|pu/,
  categories: Tokens.PenToggleOperator
})

createToken({
  name: `PenDown`,
  pattern: /pendown|pd/,
  categories: Tokens.PenToggleOperator
})

createToken({
  name: `DirectionOperator`,
  pattern: Lexer.NA
})

createToken({
  name: `Left`,
  pattern: /left|lt/,
  categories: Tokens.DirectionOperator
})

createToken({
  name: `Right`,
  pattern: /right|rt/,
  categories: Tokens.DirectionOperator
})

createToken({
  name: `MovementOperator`,
  pattern: Lexer.NA
})

createToken({
  name: `Forward`,
  pattern: /forward|fd/,
  categories: Tokens.MovementOperator
})

createToken({
  name: `Back`,
  pattern: /backward|bk/,
  categories: Tokens.MovementOperator
})

createToken({
  name: `Home`,
  pattern: /home/
})

createToken({
  name: `SetXY`,
  pattern: /setxy/
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
  name: `ArithmeticOperator`,
  pattern: Lexer.NA
})

createToken({
  name: `Plus`,
  pattern: /\+/,
  categories: Tokens.ArithmeticOperator
})

createToken({
  name: `Minus`,
  pattern: /-/,
  categories: Tokens.ArithmeticOperator
})

createToken({
  name: `Multiply`,
  pattern: /\*/,
  categories: Tokens.ArithmeticOperator
})

createToken({
  name: `Divide`,
  pattern: /\//,
  categories: Tokens.ArithmeticOperator
})

createToken({
  name: `Random`,
  pattern: /random/
})

createToken({
  name: `INT`,
  pattern: /[0-9]+/
})

createToken({
  name: `VAR`,
  pattern: /"[a-zA-Z]+/
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