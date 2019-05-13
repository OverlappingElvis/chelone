# Chelone

## Introduction

Chelone is an interpreter for a subset of the [Logo](https://en.wikipedia.org/wiki/Logo_(programming_language)) programming language (mostly the turtle parts) implemented in [chevrotain](https://raw.githubusercontent.com/SAP/chevrotain/).

This is *not* a full implementation of Logo, but is generally compatible with its syntax.

## Usage

-   `npm install`
-   Example: `npm run turtle -- -P 'make "length 0.25 repeat 500 [forward "length * 10 right 144 make "length "length + 0.25]' -O output.svg`
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
-   `stop` (in a `repeat` or `procedure`) 

### Calculation

-   `+`, `-`, `*`, `/` (one operation per statement, no precedence or grouping)
-   `random <max>` (random integer from 0 to max exclusive)

### To Implement

-   Recursion
-   Procedure outputs
-   Scoped procedure inputs
-   Additional drawing tools
-   Module API

## Chelone?

In Greek myth, Chelone was a nymph who was turned into a tortoise because she didn't RSVP to Zeus and Hera's wedding.
