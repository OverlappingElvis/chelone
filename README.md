# Chelone

## Introduction

Chelone is an interpreter for a subset of the [Logo](https://en.wikipedia.org/wiki/Logo_(programming_language)) programming language (mostly the turtle parts) implemented in [chevrotain](https://github.com/SAP/chevrotain).

## Usage

-   `npm install`
-   Example: `npm run turtle -- -P "to spiral :length if :length > 300 [stop] forward :length right 10 spiral :length * 1.05 end spiral 1" -O output.svg`
    -   If run without options (`npm run turtle`), will output a demo image to `turtle.svg`

## Implemented Commands

If you're not familiar with Logo or turtle graphics, check out the Logo Foundation's [Logo Primer](https://el.media.mit.edu/logo-foundation/what_is_logo/logo_primer.html).

### Drawing and Movement

-   `penup` (alias `pu`)
-   `pendown` (alias `pd`)
-   `forward <amount>` (alias `fd`)
-   `backward <amount>` (alias `bk`)
-   `right <degrees>` (alias `rt`)
-   `left <degrees>` (alias `lt`)
-   `home`
-   `setxy <x> <y>` (relative to the origin)

### Iteration, Procedures, Variables

-   `repeat <count> [<statements>]`
-   `to <procedure> :<inputA> :<inputB> :<inputC> <statements> end`
-   `make "<variable> <value>`

### Conditionals and Flow Control

-   `if <valueA> = <valueB> [<statements>]`
    -   `=`, `!=`, `>`, `<`
-   `stop` in a `repeat` or `procedure` to end execution
-   `output` in a `procedure` to return a value

### Calculation

-   `+`, `-`, `*`, `/`, unary `-`
-   `random <max>` (random integer from 0 to max exclusive)

## Chelone?

In Greek myth, Chelone was a nymph who was turned into a tortoise because she didn't RSVP to Zeus and Hera's wedding.
