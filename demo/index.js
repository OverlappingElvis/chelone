const program = require(`commander`)
const { parse } = require(`../index`)

const fs = require(`fs`)

program.version(`0.0.1`)
  .option(`-P --program [program]`, `Turtle program as quoted string`, `to knack :length repeat 6 [forward :length right 90 forward :length * 0.6 right 90 forward :length left 120] end penup setxy 0-50 0-150 pendown knack 200`)
  .option(`-O --output [filename]`, `Output filename [turtle.svg]`, `turtle.svg`)
  .parse(process.argv)

fs.writeFile(program.output, parse(program.program), () => {

  console.log(`Saved image to ${program.output}`)
})
